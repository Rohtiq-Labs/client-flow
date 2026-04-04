import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import Organization from '../models/Organization.js';
import { canAccessLead } from '../services/leadAccess.js';
import { notifyNewCrmMessage } from '../services/crmRealtimeNotify.js';
import { maybeBumpLeadToReplied } from '../services/leadStatusAuto.js';
import { getOutboundSenderId } from '../services/outboundSender.js';
import { sendWhatsAppMessage } from '../services/twilioWhatsAppService.js';

const toE164 = (phone) => {
  const raw = String(phone ?? '').trim().replace(/\s/g, '');
  if (!raw) return null;
  if (raw.startsWith('+')) return raw;
  return `+${raw}`;
};

const toWhatsAppAddress = (e164) => {
  if (!e164) return null;
  return `whatsapp:${e164}`;
};

export const sendMessage = async (req, res) => {
  try {
    const { leadId, phone, message } = req.body ?? {};

    if (!leadId || typeof leadId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'leadId is required'
      });
    }

    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({
        success: false,
        error: 'leadId must be a valid id'
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        error: 'phone is required'
      });
    }

    if (message === undefined || message === null || String(message).trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }

    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const text = String(message);
    const lead = await Lead.findOne({
      _id: leadId,
      organizationId: req.organizationId
    }).lean();

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    if (!canAccessLead(req, lead)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const normalizedPhone = toE164(phone);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number'
      });
    }

    if (lead.phone_number !== normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: 'Phone does not match this lead'
      });
    }

    const toAddress = toWhatsAppAddress(normalizedPhone);
    const org = await Organization.findById(req.organizationId)
      .select('twilioAccountSid twilioAuthToken twilioWhatsAppNumber')
      .lean();
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }
    const messageSid = await sendWhatsAppMessage({
      org,
      toWhatsAppAddress: toAddress,
      body: text
    });

    const now = new Date();
    const saved = await Message.create({
      organizationId: req.organizationId,
      lead_id: lead._id,
      twilio_message_sid: messageSid,
      message_type: 'text',
      direction: 'outgoing',
      deliveryStatus: 'sent',
      from: 'crm',
      to: normalizedPhone,
      body: text,
      message: text,
      timestamp: now,
      createdAt: now,
      senderId: getOutboundSenderId(req),
    });
    notifyNewCrmMessage(saved);
    await maybeBumpLeadToReplied(lead._id, req.organizationId);

    return res.status(200).json({
      success: true,
      messageSid
    });
  } catch (err) {
    console.error('[sendMessage]', err);

    const msg =
      typeof err?.message === 'string' ? err.message : 'Failed to send message';

    if (err?.statusCode === 503) {
      return res.status(503).json({ success: false, error: msg });
    }

    if (typeof err?.status === 'number' && err.status >= 400) {
      return res.status(502).json({ success: false, error: msg });
    }

    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
};
