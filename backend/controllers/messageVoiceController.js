import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import Organization from '../models/Organization.js';
import { canAccessLead } from '../services/leadAccess.js';
import { notifyNewCrmMessage } from '../services/crmRealtimeNotify.js';
import { maybeBumpLeadToReplied } from '../services/leadStatusAuto.js';
import { getOutboundSenderId } from '../services/outboundSender.js';
import { uploadBuffer } from '../services/gridfsMediaService.js';
import { createTwilioFetchToken } from '../services/mediaSigningService.js';
import {
  baseMime,
  prepareOutboundWhatsAppAudio
} from '../services/whatsappOutboundAudioService.js';
import { sendWhatsAppMediaMessage } from '../services/twilioWhatsAppService.js';

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

export const sendVoiceMessage = async (req, res) => {
  try {
    const { leadId, phone, caption } = req.body ?? {};
    const file = req.file;

    if (!file?.buffer) {
      return res.status(400).json({
        success: false,
        error: 'audio file is required (field name: audio)'
      });
    }

    if (!leadId || typeof leadId !== 'string') {
      return res.status(400).json({ success: false, error: 'leadId is required' });
    }

    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({
        success: false,
        error: 'leadId must be a valid id'
      });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'phone is required' });
    }

    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const lead = await Lead.findOne({
      _id: leadId,
      organizationId: req.organizationId
    }).lean();
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    if (!canAccessLead(req, lead)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const normalizedPhone = toE164(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }

    if (lead.phone_number !== normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: 'Phone does not match this lead'
      });
    }

    const base = String(process.env.PUBLIC_BASE_URL ?? '').trim().replace(/\/$/, '');
    if (!base) {
      return res.status(503).json({
        success: false,
        error:
          'PUBLIC_BASE_URL is required so Twilio can fetch the audio (e.g. your ngrok HTTPS URL to this server)'
      });
    }

    let uploadBufferData = file.buffer;
    let contentType = baseMime(file.mimetype) || 'application/octet-stream';
    let filename =
      typeof file.originalname === 'string' && file.originalname.trim()
        ? file.originalname.trim()
        : 'voice.bin';

    try {
      const prepared = await prepareOutboundWhatsAppAudio(
        file.buffer,
        file.mimetype || ''
      );
      uploadBufferData = prepared.buffer;
      contentType = prepared.contentType;
      filename = prepared.filename;
    } catch (prepErr) {
      console.error('[sendVoiceMessage] prepare audio', prepErr);
      return res.status(503).json({
        success: false,
        error:
          typeof prepErr?.message === 'string'
            ? prepErr.message
            : 'Could not prepare audio for WhatsApp'
      });
    }

    const gridfsId = await uploadBuffer(uploadBufferData, {
      filename,
      metadata: {
        source: 'crm_outbound_voice',
        lead_id: String(lead._id),
        content_type: contentType
      }
    });

    const token = createTwilioFetchToken(gridfsId.toString(), contentType);
    const mediaUrl = `${base}/api/twilio-media/${encodeURIComponent(token)}`;

    const captionText =
      caption !== undefined && caption !== null ? String(caption).trim() : '';
    const bodyForTwilio = captionText || ' ';

    const org = await Organization.findById(req.organizationId)
      .select('twilioAccountSid twilioAuthToken twilioWhatsAppNumber')
      .lean();
    if (!org) {
      return res.status(404).json({ success: false, error: 'Organization not found' });
    }

    const messageSid = await sendWhatsAppMediaMessage({
      org,
      toWhatsAppAddress: toWhatsAppAddress(normalizedPhone),
      body: bodyForTwilio,
      mediaUrls: [mediaUrl]
    });

    const now = new Date();
    const saved = await Message.create({
      organizationId: req.organizationId,
      lead_id: lead._id,
      twilio_message_sid: messageSid,
      message_type: captionText ? 'mixed' : 'audio',
      direction: 'outgoing',
      deliveryStatus: 'sent',
      from: 'crm',
      to: normalizedPhone,
      body: captionText,
      message: captionText,
      timestamp: now,
      createdAt: now,
      senderId: getOutboundSenderId(req),
      audio: {
        gridfs_file_id: gridfsId,
        content_type: contentType,
        size_bytes: uploadBufferData.length
      }
    });
    notifyNewCrmMessage(saved);
    await maybeBumpLeadToReplied(lead._id, req.organizationId);

    return res.status(200).json({ success: true, messageSid });
  } catch (err) {
    console.error('[sendVoiceMessage]', err);

    const msg =
      typeof err?.message === 'string' ? err.message : 'Failed to send voice message';

    if (err?.statusCode === 503) {
      return res.status(503).json({ success: false, error: msg });
    }

    if (typeof err?.status === 'number' && err.status >= 400) {
      return res.status(502).json({ success: false, error: msg });
    }

    return res
      .status(500)
      .json({ success: false, error: 'Failed to send voice message' });
  }
};
