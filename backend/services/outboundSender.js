import mongoose from 'mongoose';

/**
 * CRM outbound messages: attach agent id when the client uses JWT (not API key).
 * @param {import('express').Request & { user?: { id?: string | null, isApiKey?: boolean } }} req
 * @returns {import('mongoose').Types.ObjectId | null}
 */
export const getOutboundSenderId = (req) => {
  if (!req.user?.id || req.user.isApiKey) {
    return null;
  }
  return new mongoose.Types.ObjectId(req.user.id);
};
