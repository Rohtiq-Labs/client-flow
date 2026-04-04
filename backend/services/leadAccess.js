/**
 * @param {import('express').Request & { user?: { id?: string | null, role?: string, isApiKey?: boolean } }} req
 * @param {{ assignedTo?: import('mongoose').Types.ObjectId | { _id?: import('mongoose').Types.ObjectId } | null }} lead
 * @returns {boolean}
 */
export const canAccessLead = (req, lead) => {
  if (!req.organizationId) {
    return false;
  }
  if (lead?.organizationId && String(lead.organizationId) !== String(req.organizationId)) {
    return false;
  }
  if (!req.user) {
    return true;
  }
  if (req.user.isApiKey || req.user.role === 'admin') {
    return true;
  }
  if (req.user.role !== 'agent') {
    return false;
  }
  const aid = lead.assignedTo;
  const id =
    aid && typeof aid === 'object' && '_id' in aid
      ? String(aid._id)
      : aid
        ? String(aid)
        : null;
  return Boolean(id && id === req.user.id);
};
