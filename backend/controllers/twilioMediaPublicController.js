import {
  getGridfsFileLength,
  openDownloadStream
} from '../services/gridfsMediaService.js';
import { verifyTwilioFetchToken } from '../services/mediaSigningService.js';

const parseTokenParam = (raw) => {
  if (typeof raw !== 'string') return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

/**
 * Twilio validates outbound mediaUrl with HEAD then GET. Express does not route HEAD to GET — a
 * missing HEAD handler returns 404 and Twilio rejects the media (WhatsApp shows nothing).
 * HEAD /api/twilio-media/:token
 */
export const headTwilioMediaByToken = async (req, res, next) => {
  try {
    const token = parseTokenParam(req.params.token);
    const data = verifyTwilioFetchToken(token);
    if (!data) {
      res.status(404).end();
      return;
    }

    const len = await getGridfsFileLength(data.gridfsFileId);
    if (len === null) {
      res.status(404).end();
      return;
    }

    const ct = (data.contentType || 'application/octet-stream').split(';')[0].trim();
    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Length', String(len));
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};

/**
 * Public URL Twilio calls to download media once (no CRM API key).
 * GET /api/twilio-media/:token
 */
export const streamTwilioMediaByToken = async (req, res, next) => {
  try {
    const token = parseTokenParam(req.params.token);

    const data = verifyTwilioFetchToken(token);
    if (!data) {
      res.status(404).send('Not found');
      return;
    }

    const len = await getGridfsFileLength(data.gridfsFileId);
    if (len === null) {
      res.status(404).send('Not found');
      return;
    }

    const ct = (data.contentType || 'application/octet-stream').split(';')[0].trim();
    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Length', String(len));
    res.setHeader('Cache-Control', 'private, no-store');

    const stream = openDownloadStream(data.gridfsFileId);
    stream.on('error', (err) => {
      console.error('[streamTwilioMediaByToken]', err);
      if (!res.headersSent) {
        res.status(404).send('Not found');
      }
    });
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
