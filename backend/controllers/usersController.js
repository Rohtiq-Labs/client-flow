import mongoose from 'mongoose';
import User from '../models/User.js';

const emailOk = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

export const createAgent = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({
        success: false,
        error: 'Server auth is not configured (JWT_SECRET)',
      });
    }

    const { name, email, password } = req.body ?? {};
    const organizationId = req.organizationId;

    if (!organizationId || !mongoose.isValidObjectId(String(organizationId))) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

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

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await User.exists({
      organizationId,
      email: normalizedEmail
    });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const user = await User.create({
      organizationId,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'agent',
    });

    return res.status(201).json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error('[createAgent]', e);
    return res.status(500).json({ success: false, error: 'Failed to create agent' });
  }
};

export const listAgents = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    if (!organizationId || !mongoose.isValidObjectId(String(organizationId))) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const users = await User.find({ organizationId, role: 'agent' })
      .select('name email role')
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      users: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (e) {
    console.error('[listAgents]', e);
    return res.status(500).json({ success: false, error: 'Failed to load users' });
  }
};
