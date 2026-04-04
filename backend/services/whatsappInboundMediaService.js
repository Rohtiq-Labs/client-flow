import { uploadBuffer } from './gridfsMediaService.js';
import { downloadTwilioMedia } from './twilioMediaDownloadService.js';

const MAX_BYTES_DEFAULT = 16 * 1024 * 1024; // WhatsApp ~16MB cap

/**
 * Twilio/WhatsApp often uses application/ogg for voice notes.
 * @param {string} [contentType]
 * @returns {boolean}
 */
export const isAudioContentType = (contentType) => {
  if (!contentType || typeof contentType !== 'string') return false;
  const c = contentType.toLowerCase().split(';')[0].trim();
  return c.startsWith('audio/') || c === 'application/ogg';
};

const MAX_IMAGE_BYTES_DEFAULT = 5 * 1024 * 1024; // WhatsApp image limit (Twilio)

/**
 * @param {string} [contentType]
 * @returns {boolean}
 */
export const isImageContentType = (contentType) => {
  if (!contentType || typeof contentType !== 'string') return false;
  const c = contentType.toLowerCase().split(';')[0].trim();
  return c.startsWith('image/');
};

/**
 * Parse NumMedia and MediaUrl{n} / MediaContentType{n} from Twilio webhook body.
 * @param {Record<string, string>} body
 * @returns {{ index: number, mediaUrl: string, contentType: string }[]}
 */
export const parseTwilioMediaEntries = (body) => {
  const n = Number.parseInt(String(body.NumMedia ?? '0'), 10);
  if (!Number.isFinite(n) || n <= 0) return [];

  const out = [];
  for (let i = 0; i < n; i += 1) {
    const mediaUrl = body[`MediaUrl${i}`];
    const contentType = body[`MediaContentType${i}`] || 'application/octet-stream';
    if (mediaUrl && typeof mediaUrl === 'string') {
      out.push({ index: i, mediaUrl, contentType });
    }
  }
  return out;
};

/**
 * Download first audio attachment and store in GridFS.
 * @param {{
 *   mediaUrl: string,
 *   contentType: string,
 *   twilioMediaSid?: string,
 *   leadId: import('mongoose').Types.ObjectId,
 *   messageSid?: string
 * }} params
 * @returns {Promise<{
 *   gridfsFileId: string,
 *   contentType: string,
 *   sizeBytes: number
 * } | null>}
 */
export const storeInboundAudioFromTwilio = async (params) => {
  const maxBytes = Number(process.env.MAX_WHATSAPP_MEDIA_BYTES) || MAX_BYTES_DEFAULT;

  const { buffer } = await downloadTwilioMedia({
    mediaUrl: params.mediaUrl,
    twilioAccountSid: params.twilioAccountSid,
    twilioAuthToken: params.twilioAuthToken
  });

  if (buffer.length > maxBytes) {
    const err = new Error(`Media exceeds MAX_WHATSAPP_MEDIA_BYTES (${maxBytes})`);
    err.statusCode = 413;
    throw err;
  }

  const ext =
    params.contentType.includes('mpeg') || params.contentType.includes('mp3')
      ? 'mp3'
      : params.contentType.includes('ogg') || params.contentType.includes('opus')
        ? 'ogg'
        : params.contentType.includes('mp4') || params.contentType.includes('m4a')
          ? 'm4a'
          : params.contentType.includes('amr')
            ? 'amr'
            : 'audio';

  const filename = `wa-audio-${params.leadId.toString()}-${Date.now()}.${ext}`;

  const id = await uploadBuffer(buffer, {
    filename,
    metadata: {
      source: 'twilio_whatsapp',
      contentType: params.contentType,
      twilio_media_sid: params.twilioMediaSid ?? null,
      twilio_message_sid: params.messageSid ?? null,
      lead_id: params.leadId.toString()
    }
  });

  return {
    gridfsFileId: id.toString(),
    contentType: params.contentType,
    sizeBytes: buffer.length
  };
};

/**
 * @param {{
 *   mediaUrl: string,
 *   contentType: string,
 *   twilioMediaSid?: string,
 *   leadId: import('mongoose').Types.ObjectId,
 *   messageSid?: string
 * }} params
 * @returns {Promise<{
 *   gridfsFileId: string,
 *   contentType: string,
 *   sizeBytes: number
 * }>}
 */
export const storeInboundImageFromTwilio = async (params) => {
  const maxBytes =
    Number(process.env.MAX_WHATSAPP_IMAGE_BYTES) || MAX_IMAGE_BYTES_DEFAULT;

  const { buffer } = await downloadTwilioMedia({
    mediaUrl: params.mediaUrl,
    twilioAccountSid: params.twilioAccountSid,
    twilioAuthToken: params.twilioAuthToken
  });

  if (buffer.length > maxBytes) {
    const err = new Error(`Image exceeds MAX_WHATSAPP_IMAGE_BYTES (${maxBytes})`);
    err.statusCode = 413;
    throw err;
  }

  const base = params.contentType.toLowerCase().split(';')[0].trim();
  const ext =
    base.includes('png') ? 'png'
    : base.includes('gif') ? 'gif'
    : base.includes('webp') ? 'webp'
    : base.includes('jpeg') || base.includes('jpg') ? 'jpg'
    : 'img';

  const filename = `wa-image-${params.leadId.toString()}-${Date.now()}.${ext}`;

  const id = await uploadBuffer(buffer, {
    filename,
    metadata: {
      source: 'twilio_whatsapp',
      contentType: params.contentType,
      twilio_media_sid: params.twilioMediaSid ?? null,
      twilio_message_sid: params.messageSid ?? null,
      lead_id: params.leadId.toString(),
      kind: 'image'
    }
  });

  return {
    gridfsFileId: id.toString(),
    contentType: params.contentType,
    sizeBytes: buffer.length
  };
};
