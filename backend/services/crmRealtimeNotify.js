import { mapLeadToListRow, mapMessageToApi } from './crmRealtimePayload.js';
import { emitToCrm } from './socketService.js';

const toPlain = (doc) =>
  doc && typeof doc.toObject === 'function'
    ? doc.toObject({ versionKey: false })
    : doc;

/**
 * @param {import('mongoose').Types.ObjectId | string | undefined | null} organizationId
 */
const emitDashboardUpdated = (organizationId) => {
  if (!organizationId) {
    return;
  }
  emitToCrm('dashboard_updated', { organizationId: String(organizationId) });
};

/**
 * @param {import('mongoose').Document | Record<string, unknown>} messageDoc
 */
export const notifyNewCrmMessage = (messageDoc) => {
  const plain = toPlain(messageDoc);
  emitToCrm('crm:message', { message: mapMessageToApi(plain) });
  emitDashboardUpdated(plain.organizationId);
};

/**
 * @param {Record<string, unknown>} messageLean — updated message doc
 */
export const notifyMessageDeliveryStatus = (messageLean) => {
  const plain = toPlain(messageLean);
  emitToCrm('crm:message_status', {
    messageId: String(plain._id),
    leadId: String(plain.lead_id),
    deliveryStatus: plain.deliveryStatus || 'sent',
  });
};

/**
 * New lead row for sidebar (e.g. first WhatsApp contact).
 * @param {import('mongoose').Document | Record<string, unknown>} leadDoc
 * @param {{ lastText: string, lastAt: Date }} last
 */
export const notifyNewCrmLead = (leadDoc, last) => {
  const plain = toPlain(leadDoc);
  emitToCrm('crm:lead', {
    lead: mapLeadToListRow(plain, last),
  });
  emitDashboardUpdated(plain.organizationId);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} leadId
 * @param {string} status — DB enum: new | replied | interested | converted | lost
 * @param {import('mongoose').Types.ObjectId | string | undefined | null} organizationId
 */
export const notifyLeadStatusUpdated = (leadId, status, organizationId) => {
  emitToCrm('lead_status_updated', {
    leadId: String(leadId),
    status,
  });
  emitDashboardUpdated(organizationId);
};

/**
 * @param {import('mongoose').Types.ObjectId | string} leadId
 * @param {import('mongoose').Types.ObjectId | string | null} agentId
 * @param {import('mongoose').Types.ObjectId | string | undefined | null} organizationId
 */
export const notifyLeadAssigned = (leadId, agentId, organizationId) => {
  emitToCrm('lead_assigned', {
    leadId: String(leadId),
    agentId: agentId ? String(agentId) : null,
  });
  emitDashboardUpdated(organizationId);
};
