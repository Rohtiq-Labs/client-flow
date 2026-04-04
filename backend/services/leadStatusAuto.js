import Lead from '../models/Lead.js';
import { notifyLeadStatusUpdated } from './crmRealtimeNotify.js';

/**
 * First outbound from CRM → move pipeline from "new" to "replied".
 * @param {import('mongoose').Types.ObjectId | string} leadId
 * @param {import('mongoose').Types.ObjectId | string} organizationId
 */
export const maybeBumpLeadToReplied = async (leadId, organizationId) => {
  if (!organizationId) {
    return;
  }
  const lead = await Lead.findOne({ _id: leadId, organizationId });
  if (!lead || lead.status !== 'new') {
    return;
  }
  lead.status = 'replied';
  await lead.save();
  notifyLeadStatusUpdated(lead._id, lead.status, lead.organizationId);
};
