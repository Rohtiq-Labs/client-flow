import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRES = '7d';

/**
 * @param {{ _id: import('mongoose').Types.ObjectId, role: string, organizationId: import('mongoose').Types.ObjectId }} user
 * @returns {string}
 */
export const signUserToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(
    { sub: String(user._id), role: user.role, orgId: String(user.organizationId) },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRES }
  );
};

/**
 * @param {string} token
 * @returns {{ sub: string, role: string, orgId?: string }}
 */
export const verifyUserToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, secret);
};
