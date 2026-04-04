import express from 'express';
import twilio from 'twilio';
import Message from '../models/Message.js';
import Organization from '../models/Organization.js';
import { notifyMessageDeliveryStatus } from '../services/crmRealtimeNotify.js';
import {
  shouldApplyDeliveryUpdate,
  twilioStatusToDelivery,
} from '../services/messageDeliveryStatus.js';
import { getTwilioMessageStatusCallbackUrl } from '../services/twilioStatusCallbackUrl.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const logPrefix = '[Twilio message status]';

  try {
    const messageSid =
      typeof req.body?.MessageSid === 'string' ? req.body.MessageSid.trim() : '';
    const rawStatus = req.body?.MessageStatus;

    if (!messageSid) {
      console.warn(`${logPrefix} Missing MessageSid`);
      return res.status(200).end();
    }

    const msg = await Message.findOne({ twilio_message_sid: messageSid }).lean();
    if (!msg) {
      console.warn(`${logPrefix} No message for sid=${messageSid}`);
      return res.status(200).end();
    }

    if (msg.direction !== 'outgoing') {
      return res.status(200).end();
    }

    const org = await Organization.findById(msg.organizationId)
      .select('twilioAuthToken')
      .lean();
    const token = String(org?.twilioAuthToken ?? '').trim();

    if (!token) {
      console.warn(`${logPrefix} Org has no twilioAuthToken; ignoring sid=${messageSid}`);
      return res.status(200).end();
    }

    const callbackUrl = getTwilioMessageStatusCallbackUrl();
    if (!callbackUrl) {
      console.warn(
        `${logPrefix} Set PUBLIC_BASE_URL or TWILIO_STATUS_CALLBACK_URL to verify webhooks; ignoring sid=${messageSid}`,
      );
      return res.status(200).end();
    }

    const signature = req.headers['x-twilio-signature'];
    if (
      typeof signature !== 'string' ||
      !twilio.validateRequest(token, signature, callbackUrl, req.body)
    ) {
      console.warn(`${logPrefix} Invalid signature for sid=${messageSid}`);
      return res.status(403).send('Forbidden');
    }

    const nextStatus = twilioStatusToDelivery(rawStatus);
    if (nextStatus === null) {
      return res.status(200).end();
    }

    const current = msg.deliveryStatus ?? null;
    if (!shouldApplyDeliveryUpdate(current, nextStatus)) {
      return res.status(200).end();
    }

    const updated = await Message.findByIdAndUpdate(
      msg._id,
      { $set: { deliveryStatus: nextStatus } },
      { new: true },
    ).lean();

    if (updated) {
      notifyMessageDeliveryStatus(updated);
    }

    console.log(`${logPrefix} ${messageSid} → ${nextStatus} (twilio=${String(rawStatus)})`);
    return res.status(200).end();
  } catch (e) {
    console.error(`${logPrefix}`, e);
    return res.status(500).end();
  }
});

export default router;
