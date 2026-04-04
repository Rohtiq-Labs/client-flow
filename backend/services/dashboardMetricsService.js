import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const PIPELINE_KEYS = ['new', 'replied', 'interested', 'converted', 'lost'];

/**
 * @param {string} organizationId
 * @returns {Promise<{
 *   totalLeads: number,
 *   newLeadsToday: number,
 *   activeConversations: number,
 *   pipeline: Record<string, number>,
 *   recentMessages: Array<Record<string, unknown>>,
 *   agentStats: Array<Record<string, unknown>>
 * }>}
 */
export const buildDashboardMetrics = async (organizationId) => {
  const oid = new mongoose.Types.ObjectId(organizationId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalLeads,
    newLeadsToday,
    activeConversationAgg,
    pipelineAgg,
    recentMessagesDocs,
    agentAgg,
  ] = await Promise.all([
    Lead.countDocuments({ organizationId: oid }),
    Lead.countDocuments({ organizationId: oid, created_at: { $gte: today } }),
    Message.aggregate([
      {
        $match: {
          organizationId: oid,
          $expr: {
            $gte: [{ $ifNull: ['$createdAt', '$timestamp'] }, since],
          },
        },
      },
      { $group: { _id: '$lead_id' } },
    ]),
    Lead.aggregate([
      { $match: { organizationId: oid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Message.find({ organizationId: oid })
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(10)
      .populate({ path: 'lead_id', select: 'name phone_number' })
      .lean(),
    Lead.aggregate([
      {
        $match: {
          organizationId: oid,
          assignedTo: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          totalLeads: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalLeads: -1 } },
    ]),
  ]);

  /** @type {Record<string, number>} */
  const pipeline = {
    new: 0,
    replied: 0,
    interested: 0,
    converted: 0,
    lost: 0,
  };
  for (const row of pipelineAgg) {
    const key = row._id;
    if (typeof key === 'string' && PIPELINE_KEYS.includes(key)) {
      pipeline[key] = row.count;
    }
  }

  const agentIds = agentAgg.map((a) => a._id).filter(Boolean);
  const users = await User.find({ _id: { $in: agentIds } })
    .select('name email')
    .lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const agentStats = agentAgg.map((a) => {
    const u = userMap.get(String(a._id));
    return {
      agentId: String(a._id),
      name: u?.name ?? 'Unknown',
      email: u?.email ?? null,
      totalLeads: a.totalLeads,
      converted: a.converted,
    };
  });

  const recentMessages = recentMessagesDocs.map((m) => {
    const lead = m.lead_id;
    const rawText = String(m.body || m.message || '').trim();
    let preview = rawText;
    if (!preview) {
      if (m.message_type === 'audio') preview = '[Voice]';
      else if (m.message_type === 'image') preview = '[Image]';
      else preview = '';
    }
    const at = m.createdAt || m.timestamp;
    return {
      id: String(m._id),
      leadId: lead ? String(lead._id) : String(m.lead_id),
      leadName: lead?.name ?? null,
      leadPhone: lead?.phone_number ?? '',
      message: preview,
      direction: m.direction,
      createdAt: at ? new Date(at).toISOString() : null,
    };
  });

  return {
    totalLeads,
    newLeadsToday,
    activeConversations: activeConversationAgg.length,
    pipeline,
    recentMessages,
    agentStats,
  };
};
