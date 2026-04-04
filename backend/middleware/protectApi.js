import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { verifyUserToken } from '../services/authToken.js';

/**
 * Dev: if CRM_API_KEY and JWT_SECRET are both unset, allow all (req.user = null).
 * Else: Bearer CRM_API_KEY → admin API access, or valid JWT → req.user.
 */
export const protectApi = async (req, res, next) => {
  const apiKey = process.env.CRM_API_KEY;
  const jwtSecret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;
  const bearer =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

  if (!apiKey && !jwtSecret) {
    req.user = null;
    return next();
  }

  if (!bearer) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (apiKey && bearer === apiKey) {
    const orgSlug = String(req.headers['x-org-slug'] || '')
      .trim()
      .toLowerCase();
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

    req.user = {
      id: null,
      name: null,
      email: null,
      role: 'admin',
      isApiKey: true,
    };
    req.organizationId = String(org._id);
    return next();
  }

  if (!jwtSecret) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const decoded = verifyUserToken(bearer);
    if (!decoded?.sub || !mongoose.isValidObjectId(decoded.sub)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const user = await User.findById(decoded.sub).lean();
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!user.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (decoded?.orgId && String(decoded.orgId) !== String(user.organizationId)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      isApiKey: false,
    };
    req.organizationId = String(user.organizationId);
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};
