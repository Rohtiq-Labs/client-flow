import crypto from 'crypto';

const getSecret = () =>
  process.env.MEDIA_SIGNING_SECRET ||
  process.env.CRM_API_KEY ||
  process.env.TWILIO_AUTH_TOKEN ||
  '';

const ttlSeconds = () =>
  Number.parseInt(String(process.env.MEDIA_URL_TTL_SECONDS ?? '900'), 10) || 900;

/**
 * Short-lived token Twilio uses to GET audio from this server (one-time fetch).
 * @param {string} gridfsFileIdHex
 * @param {string} contentType
 * @returns {string}
 */
export const createTwilioFetchToken = (gridfsFileIdHex, contentType) => {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      'Set MEDIA_SIGNING_SECRET, CRM_API_KEY, or TWILIO_AUTH_TOKEN for voice media URLs'
    );
  }
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds();
  const payload = Buffer.from(
    JSON.stringify({ g: gridfsFileIdHex, ct: contentType, exp }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
};

/**
 * @param {string} token
 * @returns {{ gridfsFileId: string, contentType: string } | null}
 */
export const verifyTwilioFetchToken = (token) => {
  const secret = getSecret();
  if (!secret || !token || typeof token !== 'string') return null;

  const idx = token.lastIndexOf('.');
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  try {
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  let json;
  try {
    json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!json?.g || !json?.ct || typeof json.exp !== 'number') return null;
  if (Math.floor(Date.now() / 1000) > json.exp) return null;
  return { gridfsFileId: json.g, contentType: json.ct };
};
