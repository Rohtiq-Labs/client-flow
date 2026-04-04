/**
 * Browser calls should go through the Next.js proxy; this helps direct tools / future SPA.
 */
export const corsMiddleware = (req, res, next) => {
  const origin =
    process.env.CORS_ORIGIN ||
    process.env.FRONTEND_ORIGIN ||
    'http://localhost:3000';

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};
