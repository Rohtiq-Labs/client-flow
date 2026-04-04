/**
 * Download media from Twilio-hosted MediaUrl (requires HTTP Basic: AccountSid:AuthToken).
 * @param {{
 *   mediaUrl: string,
 *   twilioAccountSid?: string,
 *   twilioAuthToken?: string
 * }} params
 * @returns {Promise<{ buffer: Buffer, status: number }>}
 */
export const downloadTwilioMedia = async ({
  mediaUrl,
  twilioAccountSid,
  twilioAuthToken
}) => {
  const sid = twilioAccountSid || '';
  const token = twilioAuthToken || '';

  if (!sid || !token) {
    const err = new Error('Twilio credentials are required to download media');
    err.statusCode = 503;
    throw err;
  }

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const res = await fetch(mediaUrl, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  const buf = Buffer.from(await res.arrayBuffer());

  if (!res.ok) {
    const err = new Error(`Twilio media download failed: HTTP ${res.status}`);
    err.statusCode = 502;
    err.details = buf.toString('utf8').slice(0, 200);
    throw err;
  }

  return { buffer: buf, status: res.status };
};
