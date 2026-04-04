import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import {
  notifyLeadAssigned,
  notifyLeadStatusUpdated,
} from '../services/crmRealtimeNotify.js';
import { dispatchLeadAssignedNotification } from '../services/crmNotificationsDispatch.js';
import {
  mapLeadToListRow,
  mapMessageToApi,
  pipelineFromDb,
} from '../services/crmRealtimePayload.js';
import {
  isValidLeadStatus,
  normalizeLeadStatus,
} from '../services/leadPipelineConstants.js';
import { canAccessLead } from '../services/leadAccess.js';

const buildListQuery = (req) => {
  const q = {};
  const assignedToParam =
    req.query?.assignedTo !== undefined
      ? String(req.query.assignedTo)
      : undefined;

  if (!req.organizationId) return null;
  q.organizationId = req.organizationId;

  if (!req.user) return q;

  if (req.user.isApiKey || req.user.role === 'admin') {
    if (assignedToParam === 'none' || assignedToParam === 'unassigned') {
      q.assignedTo = null;
      return q;
    }
    if (assignedToParam === 'me' && req.user.id) {
      q.assignedTo = req.user.id;
    } else if (
      assignedToParam &&
      assignedToParam !== 'me' &&
      mongoose.isValidObjectId(assignedToParam)
    ) {
      q.assignedTo = assignedToParam;
    }
    return q;
  }

  if (req.user.role === 'agent') {
    q.assignedTo = req.user.id;
  }

  return q;
};

export const listLeads = async (req, res) => {
  try {
    const filter = buildListQuery(req);
    if (!filter) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .lean();

    const agg = await Message.aggregate([
      { $match: { organizationId: filter.organizationId } },
      {
        $addFields: {
          sortAt: { $ifNull: ['$createdAt', '$timestamp'] },
          text: { $ifNull: ['$body', '$message'] },
        },
      },
      { $sort: { sortAt: -1 } },
      {
        $group: {
          _id: '$lead_id',
          lastText: { $first: '$text' },
          lastAt: { $first: '$sortAt' },
        },
      },
    ]);

    const lastMap = new Map(agg.map((x) => [String(x._id), x]));

    const payload = leads.map((lead) => {
      const id = String(lead._id);
      const last = lastMap.get(id);
      return mapLeadToListRow(
        lead,
        last
          ? { lastText: last.lastText, lastAt: last.lastAt }
          : null
      );
    });

    payload.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

    return res.json({ success: true, leads: payload });
  } catch (e) {
    console.error('[listLeads]', e);
    return res.status(500).json({ success: false, error: 'Failed to load leads' });
  }
};

export const getLeadMessages = async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({ success: false, error: 'Invalid lead id' });
    }

    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const lead = await Lead.findOne({
      _id: leadId,
      organizationId: req.organizationId
    }).populate('assignedTo', 'name email').lean();
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    if (!canAccessLead(req, lead)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const msgs = await Message.find({
      organizationId: req.organizationId,
      lead_id: leadId
    })
      .sort({ timestamp: 1, _id: 1 })
      .lean();

    const messages = msgs.map((m) => mapMessageToApi(m));

    return res.json({ success: true, messages });
  } catch (e) {
    console.error('[getLeadMessages]', e);
    return res.status(500).json({ success: false, error: 'Failed to load messages' });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status: rawStatus } = req.body ?? {};

    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({ success: false, error: 'Invalid lead id' });
    }

    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const existing = await Lead.findOne({
      _id: leadId,
      organizationId: req.organizationId
    }).lean();
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    if (!canAccessLead(req, existing)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    if (!isValidLeadStatus(rawStatus)) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid status. Use: new, replied, interested, converted, lost',
      });
    }

    const status = normalizeLeadStatus(rawStatus);

    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    notifyLeadStatusUpdated(lead._id, lead.status, lead.organizationId);

    return res.json({
      success: true,
      lead: {
        id: String(lead._id),
        status: pipelineFromDb(lead.status),
      },
    });
  } catch (e) {
    console.error('[updateLeadStatus]', e);
    return res.status(500).json({ success: false, error: 'Failed to update lead' });
  }
};

export const assignLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { agentId } = req.body ?? {};

    if (!mongoose.isValidObjectId(leadId)) {
      return res.status(400).json({ success: false, error: 'Invalid lead id' });
    }
    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let newAssignee = null;
    if (agentId !== null && agentId !== undefined && String(agentId).trim() !== '') {
      if (!mongoose.isValidObjectId(String(agentId))) {
        return res.status(400).json({ success: false, error: 'Invalid agentId' });
      }
      const agent = await User.findOne({
        _id: agentId,
        organizationId: req.organizationId
      }).select('_id role').lean();
      if (!agent) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      if (agent.role !== 'agent') {
        return res.status(400).json({
          success: false,
          error: 'agentId must reference a user with role agent',
        });
      }
      newAssignee = agent._id;
    }

    const leadExists = await Lead.exists({
      _id: leadId,
      organizationId: req.organizationId
    });
    if (!leadExists) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo: newAssignee },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email role')
      .lean();

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    notifyLeadAssigned(lead._id, newAssignee, lead.organizationId);

    if (newAssignee) {
      const assigneeName =
        lead.assignedTo && typeof lead.assignedTo === 'object'
          ? lead.assignedTo.name
          : null;
      const assignerName =
        req.user && !req.user.isApiKey && req.user.name
          ? req.user.name
          : null;
      void dispatchLeadAssignedNotification(
        lead.organizationId,
        lead,
        String(newAssignee),
        assignerName,
        assigneeName,
      ).catch((err) => console.error('[assignLead] notification', err));
    }

    return res.json({
      success: true,
      lead: {
        id: String(lead._id),
        phone_number: lead.phone_number,
        name: lead.name,
        status: lead.status,
        created_at: lead.created_at,
        assignedTo: lead.assignedTo
          ? {
              id: String(lead.assignedTo._id),
              name: lead.assignedTo.name,
              email: lead.assignedTo.email,
              role: lead.assignedTo.role,
            }
          : null,
      },
    });
  } catch (e) {
    console.error('[assignLead]', e);
    return res.status(500).json({ success: false, error: 'Failed to assign lead' });
  }
};
