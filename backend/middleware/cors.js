/**
 * Browser direct API calls (SPA / Next client) send Authorization and X-Org-Slug.
 */
export const corsMiddleware = (req, res, next) => {
  const origin =
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_ORIGIN ||
    'http://localhost:3000';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PATCH,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Org-Slug'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};
