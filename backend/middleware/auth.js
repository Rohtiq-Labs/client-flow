import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyUserToken } from '../services/authToken.js';

export const authenticate = async (req, res, next) => {
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
    req.user = {
      id: null,
      name: null,
      email: null,
      role: 'admin',
      isApiKey: true,
    };
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
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      isApiKey: false,
    };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next();
  }
  if (req.user.isApiKey || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, error: 'Forbidden' });
};
