import twilio from 'twilio';
import { getTwilioMessageStatusCallbackUrl } from './twilioStatusCallbackUrl.js';

/** Fields for `messages.create` so Twilio POSTs delivery/read updates. */
export const outboundMessageStatusCallbackFields = () => {
  const url = getTwilioMessageStatusCallbackUrl();
  if (!url) {
    return {};
  }
  return {
    statusCallback: url,
    statusCallbackMethod: 'POST',
  };
};

/**
 * @param {{
 *   org: { twilioAccountSid?: string, twilioAuthToken?: string, twilioWhatsAppNumber?: string },
 *   toWhatsAppAddress: string,
 *   body: string
 * }} params
 * @returns {Promise<string>} Twilio Message SID
 */
export const sendWhatsAppMessage = async ({ org, toWhatsAppAddress, body }) => {
  const sid = org?.twilioAccountSid || '';
  const token = org?.twilioAuthToken || '';
  const from = org?.twilioWhatsAppNumber || '';

  if (!sid || !token || !from) {
    const err = new Error(
      'Twilio is not configured for this organization'
    );
    err.statusCode = 503;
    throw err;
  }

  const client = twilio(sid, token);
  const created = await client.messages.create({
    from,
    to: toWhatsAppAddress,
    body,
    ...outboundMessageStatusCallbackFields(),
  });

  return created.sid;
};

/**
 * WhatsApp outbound with media (Twilio fetches each URL once).
 * @param {{
 *   org: { twilioAccountSid?: string, twilioAuthToken?: string, twilioWhatsAppNumber?: string },
 *   toWhatsAppAddress: string,
 *   body: string,
 *   mediaUrls: string[]
 * }} params
 * @returns {Promise<string>} Message SID
 */
export const sendWhatsAppMediaMessage = async ({
  org,
  toWhatsAppAddress,
  body,
  mediaUrls
}) => {
  const sid = org?.twilioAccountSid || '';
  const token = org?.twilioAuthToken || '';
  const from = org?.twilioWhatsAppNumber || '';

  if (!sid || !token || !from) {
    const err = new Error(
      'Twilio is not configured for this organization'
    );
    err.statusCode = 503;
    throw err;
  }

  if (!Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    const err = new Error('mediaUrls is required');
    err.statusCode = 400;
    throw err;
  }

  const client = twilio(sid, token);
  const created = await client.messages.create({
    from,
    to: toWhatsAppAddress,
    body: body?.trim() ? body : ' ',
    mediaUrl: mediaUrls,
    ...outboundMessageStatusCallbackFields(),
  });

  return created.sid;
};
