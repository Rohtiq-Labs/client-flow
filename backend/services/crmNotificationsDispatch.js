import Notification from '../models/Notification.js';
import {
  recipientUserIdsForLeadVisibility,
  recipientUserIdsForOrganizationMembers,
} from './notificationRecipients.js';
import { mapNotificationToApi } from './notificationPayload.js';
import { emitNotificationToUser } from './socketService.js';

const leadDisplayName = (lead) => {
  const n = lead?.name && String(lead.name).trim();
  if (n) return n;
  return lead?.phone_number ? String(lead.phone_number) : 'Lead';
};

/**
 * @param {import('mongoose').Types.ObjectId | string} organizationId
 * @param {string[]} recipientUserIds
 * @param {'whatsapp_inbound' | 'lead_created' | 'lead_assigned'} type
 * @param {Record<string, unknown>} meta
 */
const insertAndEmit = async (organizationId, recipientUserIds, type, meta) => {
  if (!recipientUserIds.length) {
    return;
  }
  const oid =
    typeof organizationId === 'string'
      ? organizationId
      : String(organizationId);
  const now = new Date();
  const docs = recipientUserIds.map((recipientUserId) => ({
    organizationId: oid,
    recipientUserId,
    type,
    readAt: null,
    meta,
    createdAt: now,
  }));
  try {
    const inserted = await Notification.insertMany(docs);
    for (const doc of inserted) {
      const plain =
        doc && typeof doc.toObject === 'function'
          ? doc.toObject({ versionKey: false })
          : doc;
      emitNotificationToUser(String(doc.recipientUserId), mapNotificationToApi(plain));
    }
  } catch (e) {
    console.error('[crmNotificationsDispatch]', type, e);
  }
};

/**
 * @param {import('mongoose').Types.ObjectId | string} organizationId
 * @param {Record<string, unknown>} lead
 * @param {Record<string, unknown>} messageDoc
 */
export const dispatchWhatsAppInboundNotification = async (
  organizationId,
  lead,
  messageDoc,
) => {
  const recipientUserIds = await recipientUserIdsForLeadVisibility(
    organizationId,
    lead,
  );
  const preview =
    String(messageDoc.body || messageDoc.message || '').slice(0, 160) || '';
  await insertAndEmit(organizationId, recipientUserIds, 'whatsapp_inbound', {
    leadId: String(lead._id),
    messageId: String(messageDoc._id),
    preview,
    leadName: leadDisplayName(lead),
    phone: lead.phone_number ? String(lead.phone_number) : undefined,
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} organizationId
 * @param {Record<string, unknown>} lead
 */
export const dispatchLeadCreatedNotifications = async (organizationId, lead) => {
  const recipientUserIds = await recipientUserIdsForOrganizationMembers(
    organizationId,
  );
  await insertAndEmit(organizationId, recipientUserIds, 'lead_created', {
    leadId: String(lead._id),
    leadName: leadDisplayName(lead),
    phone: lead.phone_number ? String(lead.phone_number) : undefined,
  });
};

/**
 * @param {import('mongoose').Types.ObjectId | string} organizationId
 * @param {Record<string, unknown>} lead
 * @param {string | null} assigneeUserId — null if unassigned
 * @param {string | null} assignerName
 * @param {string | null} assigneeName
 */
export const dispatchLeadAssignedNotification = async (
  organizationId,
  lead,
  assigneeUserId,
  assignerName,
  assigneeName,
) => {
  if (!assigneeUserId) {
    return;
  }
  await insertAndEmit(
    organizationId,
    [String(assigneeUserId)],
    'lead_assigned',
    {
      leadId: String(lead._id),
      leadName: leadDisplayName(lead),
      phone: lead.phone_number ? String(lead.phone_number) : undefined,
      assigneeName: assigneeName || undefined,
      assignerName: assignerName || undefined,
    },
  );
};
