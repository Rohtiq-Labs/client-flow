import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { signUserToken } from '../services/authToken.js';

const emailOk = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const slugFromCompanyName = (companyName) => {
  const raw = String(companyName || '').trim().toLowerCase();
  return raw
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
};

const orgSlugFromRequest = (req) => {
  const raw = req.headers['x-org-slug'];
  if (!raw) return null;
  return String(Array.isArray(raw) ? raw[0] : raw)
    .trim()
    .toLowerCase();
};

export const signup = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({
        success: false,
        error: 'Server auth is not configured (JWT_SECRET)',
      });
    }

    const { companyName, name, email, password } = req.body ?? {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'name is required' });
    }
    if (!email || typeof email !== 'string' || !emailOk(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'password must be at least 8 characters',
      });
    }

    // SaaS onboarding: if companyName is present, create a new organization and admin user.
    if (companyName !== undefined && companyName !== null && String(companyName).trim()) {
      const comp = String(companyName).trim();
      const baseSlug = slugFromCompanyName(comp);
      if (!baseSlug) {
        return res.status(400).json({ success: false, error: 'companyName is required' });
      }

      const normalizedEmail = String(email).toLowerCase().trim();

      // Choose a unique slug (barberco, barberco-2, barberco-3, ...)
      let slug = baseSlug;
      for (let i = 0; i < 50; i += 1) {
        const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
        // eslint-disable-next-line no-await-in-loop
        const taken = await Organization.exists({ slug: candidate });
        if (!taken) {
          slug = candidate;
          break;
        }
      }

      const org = await Organization.create({
        name: comp,
        slug,
        logo: '',
        primaryColor: '',
        twilioAccountSid: '',
        twilioAuthToken: '',
        twilioWhatsAppNumber: '',
      });

      const user = await User.create({
        organizationId: org._id,
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'admin',
      });

      const token = signUserToken(user);

      return res.status(201).json({
        success: true,
        token,
        organization: {
          id: String(org._id),
          name: org.name,
          slug: org.slug,
        },
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Org-scoped signup (optional): requires x-org-slug; first user in org becomes admin.
    const orgSlug = orgSlugFromRequest(req);
    if (!orgSlug) {
      return res.status(400).json({
        success: false,
        error: 'Organization is required (x-org-slug)',
      });
    }
    const org = await Organization.findOne({ slug: orgSlug }).select('_id').lean();
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.exists({ organizationId: org._id, email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const count = await User.countDocuments({ organizationId: org._id });
    const role = count === 0 ? 'admin' : 'agent';

    const user = await User.create({
      organizationId: org._id,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    });

    const token = signUserToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error('[signup]', e);
    return res.status(500).json({ success: false, error: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({
        success: false,
        error: 'Server auth is not configured (JWT_SECRET)',
      });
    }

    const { email, password } = req.body ?? {};

    if (!email || typeof email !== 'string' || !emailOk(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'password is required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const candidates = await User.find({ email: normalizedEmail }).select('+password');
    if (candidates.length > 1) {
      return res.status(400).json({
        success: false,
        error:
          'This email is used in more than one organization. Ask an admin to rename one account email.',
      });
    }
    const user = candidates[0] ?? null;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = signUserToken(user);

    const orgDoc = await Organization.findById(user.organizationId)
      .select('name slug')
      .lean();

    return res.json({
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      organization: orgDoc
        ? {
            id: String(orgDoc._id),
            name: orgDoc.name,
            slug: orgDoc.slug,
          }
        : undefined,
    });
  } catch (e) {
    console.error('[login]', e);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};
