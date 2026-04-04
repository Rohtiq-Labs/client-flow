import express from 'express';
import twilio from 'twilio';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import Organization from '../models/Organization.js';
import {
  notifyNewCrmLead,
  notifyNewCrmMessage
} from '../services/crmRealtimeNotify.js';
import {
  dispatchLeadCreatedNotifications,
  dispatchWhatsAppInboundNotification,
} from '../services/crmNotificationsDispatch.js';
import {
  isAudioContentType,
  isImageContentType,
  parseTwilioMediaEntries,
  storeInboundAudioFromTwilio,
  storeInboundImageFromTwilio
} from '../services/whatsappInboundMediaService.js';
import {
  buildWhatsAppInboundLookupCandidates,
  normalizeWhatsAppNumberForStorage
} from '../utils/twilioWhatsAppNormalize.js';
import { outboundMessageStatusCallbackFields } from '../services/twilioWhatsAppService.js';

const router = express.Router();

const TWIML_EMPTY =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

/**
 * Twilio sends From/To like `whatsapp:+14155238886`. Store E.164 without the channel prefix.
 */
const normalizePhoneFromTwilio = (from) => {
  if (!from || typeof from !== 'string') return '';
  return from.replace(/^whatsapp:/i, '').trim();
};

const maybeSendAutoReply = async (org, inboundFromAddress, logPrefix) => {
  if (process.env.AUTO_REPLY_ENABLED !== 'true') return;

  const sid = org?.twilioAccountSid || '';
  const token = org?.twilioAuthToken || '';
  const fromNumber = org?.twilioWhatsAppNumber || '';

  if (!sid || !token || !fromNumber) {
    console.warn(
      `${logPrefix} AUTO_REPLY_ENABLED is true but Twilio env vars are incomplete; skipping reply.`
    );
    return;
  }

  const body =
    process.env.AUTO_REPLY_MESSAGE ||
    'Thanks — we received your message and will get back to you soon.';

  const client = twilio(sid, token);
  await client.messages.create({
    from: fromNumber,
    to: inboundFromAddress,
    body,
    ...outboundMessageStatusCallbackFields(),
  });
  console.log(`${logPrefix} Auto-reply sent to ${inboundFromAddress}`);
};

router.post('/', async (req, res, next) => {
  const logPrefix = '[WhatsApp webhook]';

  try {
    const { From, To, Body, ProfileName } = req.body;

    const numMedia = Number.parseInt(String(req.body.NumMedia ?? '0'), 10) || 0;
    const mediaEntries = parseTwilioMediaEntries(req.body);

    console.log(`${logPrefix} Incoming`, {
      From,
      ProfileName: ProfileName || null,
      BodyPreview:
        typeof Body === 'string' ? Body.slice(0, 200) : Body ?? null,
      MessageSid: req.body.MessageSid || null,
      NumMedia: numMedia,
      mediaTypes: mediaEntries.map((m) => m.contentType)
    });

    const phone_number = normalizePhoneFromTwilio(From);
    if (!phone_number) {
      console.warn(`${logPrefix} Missing or invalid From; responding with empty TwiML.`);
      res.type('text/xml').status(200).send(TWIML_EMPTY);
      return;
    }

    const toNumberRaw = typeof To === 'string' && To.trim() ? To.trim() : null;
    const toCanonical = toNumberRaw
      ? normalizeWhatsAppNumberForStorage(toNumberRaw)
      : '';
    if (!toCanonical) {
      console.warn(`${logPrefix} Missing To; responding with empty TwiML.`);
      res.type('text/xml').status(200).send(TWIML_EMPTY);
      return;
    }

    const lookupCandidates = buildWhatsAppInboundLookupCandidates(toNumberRaw);
    const org = await Organization.findOne({
      twilioWhatsAppNumber: { $in: lookupCandidates },
    }).lean();
    if (!org) {
      console.warn(
        `${logPrefix} No org found for To (candidates=${JSON.stringify(lookupCandidates)}); ` +
          'ensure System page saved this exact WhatsApp sender and no other org uses the same number.'
      );
      res.type('text/xml').status(200).send(TWIML_EMPTY);
      return;
    }
    console.log(`${logPrefix} Matched org slug=${org.slug} id=${String(org._id)}`);

    const bodyText = typeof Body === 'string' ? Body.trim() : '';

    let lead = await Lead.findOne({ organizationId: org._id, phone_number });
    let isNewLead = false;

    if (!lead) {
      isNewLead = true;
      try {
        lead = await Lead.create({
          organizationId: org._id,
          phone_number,
          name: ProfileName?.trim() || undefined,
          status: 'new',
          created_at: new Date()
        });
        console.log(`${logPrefix} Created lead`, lead._id.toString(), phone_number);
      } catch (createErr) {
        if (createErr?.code === 11000) {
          lead = await Lead.findOne({ organizationId: org._id, phone_number });
          isNewLead = false;
          if (lead) {
            console.warn(
              `${logPrefix} Lead create race/legacy index; using existing lead`,
              lead._id.toString()
            );
          } else {
            throw createErr;
          }
        } else {
          throw createErr;
        }
      }
    }
    if (lead && !isNewLead) {
      if (!lead.name && ProfileName?.trim()) {
        lead.name = ProfileName.trim();
        await lead.save();
      }
      console.log(`${logPrefix} Existing lead`, lead._id.toString(), phone_number);
    }

    const audioCandidates = mediaEntries.filter((e) =>
      isAudioContentType(e.contentType)
    );
    const imageCandidates = mediaEntries.filter((e) =>
      isImageContentType(e.contentType)
    );

    let message_type = 'text';
    let messagePreview = bodyText;
    let audioPayload;
    let imagePayload;

    if (audioCandidates.length > 0) {
      const first = audioCandidates[0];
      const twilioMediaSid = req.body[`MediaSid${first.index}`];
      try {
        const stored = await storeInboundAudioFromTwilio({
          mediaUrl: first.mediaUrl,
          contentType: first.contentType,
          twilioMediaSid:
            typeof twilioMediaSid === 'string' ? twilioMediaSid : undefined,
          leadId: lead._id,
          messageSid:
            typeof req.body.MessageSid === 'string' ? req.body.MessageSid : undefined,
          twilioAccountSid: org.twilioAccountSid,
          twilioAuthToken: org.twilioAuthToken
        });

        audioPayload = {
          gridfs_file_id: stored.gridfsFileId,
          content_type: stored.contentType,
          size_bytes: stored.sizeBytes,
          twilio_media_sid:
            typeof twilioMediaSid === 'string' ? twilioMediaSid : undefined
        };

        if (bodyText) {
          message_type = 'mixed';
          messagePreview = bodyText;
        } else {
          message_type = 'audio';
          messagePreview = '[Voice message]';
        }
      } catch (mediaErr) {
        console.error(`${logPrefix} Failed to store voice message`, mediaErr);
        message_type = bodyText ? 'mixed' : 'audio';
        messagePreview =
          bodyText ||
          '[Voice message — could not save recording; check server logs]';
        audioPayload = {
          storage_failed: true,
          error:
            mediaErr instanceof Error ? mediaErr.message : 'Unknown media error'
        };
      }
    } else if (imageCandidates.length > 0) {
      const first = imageCandidates[0];
      const twilioMediaSid = req.body[`MediaSid${first.index}`];
      try {
        const stored = await storeInboundImageFromTwilio({
          mediaUrl: first.mediaUrl,
          contentType: first.contentType,
          twilioMediaSid:
            typeof twilioMediaSid === 'string' ? twilioMediaSid : undefined,
          leadId: lead._id,
          messageSid:
            typeof req.body.MessageSid === 'string' ? req.body.MessageSid : undefined,
          twilioAccountSid: org.twilioAccountSid,
          twilioAuthToken: org.twilioAuthToken
        });

        imagePayload = {
          gridfs_file_id: stored.gridfsFileId,
          content_type: stored.contentType,
          size_bytes: stored.sizeBytes,
          twilio_media_sid:
            typeof twilioMediaSid === 'string' ? twilioMediaSid : undefined
        };

        if (bodyText) {
          message_type = 'mixed';
          messagePreview = bodyText;
        } else {
          message_type = 'image';
          messagePreview = '[Photo]';
        }
      } catch (mediaErr) {
        console.error(`${logPrefix} Failed to store image`, mediaErr);
        message_type = bodyText ? 'mixed' : 'image';
        messagePreview =
          bodyText ||
          '[Photo — could not save image; check server logs]';
        imagePayload = {
          storage_failed: true,
          error:
            mediaErr instanceof Error ? mediaErr.message : 'Unknown media error'
        };
      }
    } else if (mediaEntries.length > 0) {
      message_type = bodyText ? 'mixed' : 'text';
      messagePreview =
        bodyText ||
        `[${mediaEntries.length} attachment(s) — type not supported]`;
      console.log(
        `${logPrefix} Unsupported media types`,
        mediaEntries.map((m) => m.contentType)
      );
    }

    const savedMessage = await Message.create({
      organizationId: org._id,
      lead_id: lead._id,
      twilio_message_sid:
        typeof req.body.MessageSid === 'string' ? req.body.MessageSid : undefined,
      message_type,
      message: messagePreview,
      from: phone_number,
      to: toCanonical,
      direction: 'incoming',
      timestamp: new Date(),
      ...(audioPayload && !audioPayload.storage_failed
        ? {
            audio: {
              gridfs_file_id: audioPayload.gridfs_file_id,
              content_type: audioPayload.content_type,
              size_bytes: audioPayload.size_bytes,
              twilio_media_sid: audioPayload.twilio_media_sid
            }
          }
        : {}),
      ...(audioPayload?.storage_failed
        ? {
            audio: {
              storage_failed: true,
              error: audioPayload.error
            }
          }
        : {}),
      ...(imagePayload && !imagePayload.storage_failed
        ? {
            image: {
              gridfs_file_id: imagePayload.gridfs_file_id,
              content_type: imagePayload.content_type,
              size_bytes: imagePayload.size_bytes,
              twilio_media_sid: imagePayload.twilio_media_sid
            }
          }
        : {}),
      ...(imagePayload?.storage_failed
        ? {
            image: {
              storage_failed: true,
              error: imagePayload.error
            }
          }
        : {})
    });

    console.log(
      `${logPrefix} Stored in DB → messages collection`,
      `message_id=${savedMessage._id.toString()}`,
      `lead_id=${lead._id.toString()}`,
      `type=${message_type}`,
      `preview="${String(messagePreview).slice(0, 60)}${String(messagePreview).length > 60 ? '…' : ''}"`
    );

    const lastAt = savedMessage.createdAt || savedMessage.timestamp || new Date();
    if (isNewLead) {
      notifyNewCrmLead(lead, {
        lastText: String(messagePreview),
        lastAt,
      });
    }
    notifyNewCrmMessage(savedMessage);

    const leadPlain =
      typeof lead.toObject === 'function'
        ? lead.toObject({ versionKey: false })
        : lead;
    const msgPlain =
      typeof savedMessage.toObject === 'function'
        ? savedMessage.toObject({ versionKey: false })
        : savedMessage;
    void (async () => {
      try {
        if (isNewLead) {
          await dispatchLeadCreatedNotifications(org._id, leadPlain);
        }
        await dispatchWhatsAppInboundNotification(org._id, leadPlain, msgPlain);
      } catch (err) {
        console.error(`${logPrefix} notifications`, err);
      }
    })();

    await maybeSendAutoReply(org, From, logPrefix);

    res.type('text/xml').status(200).send(TWIML_EMPTY);
  } catch (err) {
    next(err);
  }
});

export default router;
