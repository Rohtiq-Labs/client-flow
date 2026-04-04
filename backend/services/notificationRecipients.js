import User from '../models/User.js';

/**
 * Admins see all; agents only if lead is unassigned or assigned to them.
 * @param {import('mongoose').Types.ObjectId | string} organizationId
 * @param {{ assignedTo?: import('mongoose').Types.ObjectId | { _id?: import('mongoose').Types.ObjectId } | null } | null} lead
 * @returns {Promise<string[]>}
 */
export const recipientUserIdsForLeadVisibility = async (organizationId, lead) => {
  const users = await User.find({ organizationId })
    .select('_id role')
    .lean();

  const out = [];
  for (const u of users) {
    if (u.role === 'admin') {
      out.push(String(u._id));
      continue;
    }
    if (u.role !== 'agent') {
      continue;
    }
    const aid = lead?.assignedTo;
    const assignedId =
      aid && typeof aid === 'object' && aid._id
        ? String(aid._id)
        : aid
          ? String(aid)
          : null;
    if (!assignedId) {
      out.push(String(u._id));
    } else if (assignedId === String(u._id)) {
      out.push(String(u._id));
    }
  }
  return [...new Set(out)];
};

/**
 * New lead in workspace — notify all admins and agents.
 * @param {import('mongoose').Types.ObjectId | string} organizationId
 * @returns {Promise<string[]>}
 */
export const recipientUserIdsForOrganizationMembers = async (organizationId) => {
  const users = await User.find({
    organizationId,
    role: { $in: ['admin', 'agent'] },
  })
    .select('_id')
    .lean();
  return [...new Set(users.map((u) => String(u._id)))];
};
