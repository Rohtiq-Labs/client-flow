/**
 * @param {Record<string, unknown>} doc — Notification lean
 */
export const mapNotificationToApi = (doc) => ({
  id: String(doc._id),
  type: doc.type,
  readAt: doc.readAt ? new Date(doc.readAt).getTime() : null,
  createdAt: new Date(doc.createdAt).getTime(),
  meta: {
    leadId: doc.meta?.leadId ?? '',
    messageId: doc.meta?.messageId ?? undefined,
    preview: doc.meta?.preview ?? undefined,
    leadName: doc.meta?.leadName ?? undefined,
    phone: doc.meta?.phone ?? undefined,
    assigneeName: doc.meta?.assigneeName ?? undefined,
    assignerName: doc.meta?.assignerName ?? undefined,
  },
});
