import express from 'express';
import mongoose from 'mongoose';
import Organization from '../../models/Organization.js';
import { requireAdmin } from '../../middleware/auth.js';
import { protectApi } from '../../middleware/protectApi.js';
import {
  buildWhatsAppInboundLookupCandidates,
  normalizeWhatsAppNumberForStorage,
} from '../../utils/twilioWhatsAppNormalize.js';

const router = express.Router();

/**
 * Organization branding/config.
 * Single-domain multi-tenant: when logged in, org is derived from JWT (req.organizationId).
 */
router.get('/', async (req, res) => {
  try {
    const authHeader = String(req.headers.authorization || '').trim();
    if (!authHeader.startsWith('Bearer ')) {
      return res.json({ success: true, organization: null });
    }

    // Use the same auth as protected routes to resolve req.organizationId.
    await new Promise((resolve, reject) =>
      protectApi(req, res, (err) => (err ? reject(err) : resolve(null))),
    );

    const organizationId = req.organizationId;
    if (!organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const org = await Organization.findById(organizationId)
      .select('name slug logo primaryColor')
      .lean();

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    return res.json({
      success: true,
      organization: {
        id: String(org._id),
        name: org.name,
        slug: org.slug,
        logo: org.logo || null,
        primaryColor: org.primaryColor || null,
      },
    });
  } catch (e) {
    console.error('[org]', e);
    return res.status(500).json({ success: false, error: 'Failed to load organization' });
  }
});

/**
 * Admin-only org update (Twilio + branding).
 * Requires protectApi to have set req.organizationId and req.user.
 */
router.patch('/', protectApi, requireAdmin, async (req, res) => {
  try {
    const organizationId = req.organizationId;
    if (!organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      name,
      logo,
      primaryColor,
      twilioAccountSid,
      twilioAuthToken,
      twilioWhatsAppNumber,
    } = req.body ?? {};

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (logo !== undefined) update.logo = String(logo).trim();
    if (primaryColor !== undefined) update.primaryColor = String(primaryColor).trim();
    if (twilioAccountSid !== undefined) update.twilioAccountSid = String(twilioAccountSid).trim();
    if (twilioAuthToken !== undefined) update.twilioAuthToken = String(twilioAuthToken).trim();
    if (twilioWhatsAppNumber !== undefined) {
      const normalized = normalizeWhatsAppNumberForStorage(twilioWhatsAppNumber);
      update.twilioWhatsAppNumber = normalized;
      if (normalized) {
        const candidates = buildWhatsAppInboundLookupCandidates(normalized);
        const conflict = await Organization.findOne({
          twilioWhatsAppNumber: { $in: candidates },
          _id: { $ne: new mongoose.Types.ObjectId(String(organizationId)) },
        })
          .select('slug')
          .lean();
        if (conflict) {
          return res.status(409).json({
            success: false,
            error:
              `This WhatsApp number is already linked to another workspace (${conflict.slug}). ` +
              'Remove Twilio settings from that workspace in MongoDB or Twilio, then save again.',
          });
        }
      }
    }

    let org;
    try {
      org = await Organization.findByIdAndUpdate(organizationId, update, {
        new: true,
        runValidators: true,
      })
        .select('name slug logo primaryColor')
        .lean();
    } catch (e) {
      if (e && e.code === 11000) {
        return res.status(409).json({
          success: false,
          error:
            'This WhatsApp number is already in use by another organization. Clear it from the other org first.',
        });
      }
      throw e;
    }

    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    return res.json({
      success: true,
      organization: {
        id: String(org._id),
        name: org.name,
        slug: org.slug,
        logo: org.logo || null,
        primaryColor: org.primaryColor || null,
      },
    });
  } catch (e) {
    console.error('[org:update]', e);
    return res.status(500).json({ success: false, error: 'Failed to update organization' });
  }
});

export default router;

