import cors from 'cors';

const parseAllowedOrigins = () => {
  const raw =
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_ORIGIN ||
    'http://localhost:3000,http://127.0.0.1:3000';
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const extras = [];
  for (const o of parts) {
    if (o.includes('localhost:')) {
      extras.push(o.replace(/localhost/g, '127.0.0.1'));
    }
    if (o.includes('127.0.0.1:')) {
      extras.push(o.replace(/127\.0\.0\.1/g, 'localhost'));
    }
  }
  return [...new Set([...parts, ...extras])];
};

const originMatches = (allowedOrigin, requestOrigin) => {
  if (!allowedOrigin || !requestOrigin) return false;
  const a = String(allowedOrigin).trim();
  const r = String(requestOrigin).trim();
  if (!a || !r) return false;
  if (a === r) return true;

  // Support wildcard entries like: https://*.vercel.app
  // (scheme must still match; only the hostname prefix is wildcarded)
  try {
    const allowedUrl = new URL(a);
    const requestUrl = new URL(r);
    if (allowedUrl.protocol !== requestUrl.protocol) return false;
    if (allowedUrl.port !== requestUrl.port) return false;

    const allowedHost = allowedUrl.hostname;
    const requestHost = requestUrl.hostname;

    if (allowedHost.startsWith('*.')) {
      const suffix = allowedHost.slice(2);
      return (
        requestHost === suffix ||
        requestHost.endsWith(`.${suffix}`)
      );
    }
  } catch {
    // If parsing fails, fall back to strict match only.
  }

  return false;
};

const corsOptions = {
  origin: (requestOrigin, callback) => {
    const allowed = parseAllowedOrigins();
    if (!requestOrigin) {
      callback(null, false);
      return;
    }
    if (allowed.some((a) => originMatches(a, requestOrigin))) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Org-Slug',
    'Accept',
  ],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);
