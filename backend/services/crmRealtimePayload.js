/**
 * Shared shapes for REST + Socket.io so the inbox stays consistent.
 */

export const pipelineFromDb = (status) => {
  const s = String(status || '').toLowerCase();
  const m = {
    new: 'New',
    replied: 'Replied',
    interested: 'Interested',
    converted: 'Converted',
    lost: 'Lost',
    contacted: 'Replied',
    booked: 'Converted',
  };
  return m[s] || 'New';
};

export const listBadgeFromPipeline = (status) => {
  if (status === 'New') return 'New';
  if (status === 'Replied') return 'Replied';
  if (status === 'Interested') return 'Interested';
  if (status === 'Converted') return 'Converted';
  if (status === 'Lost') return 'Lost';
  return 'New';
};

/**
 * @param {Record<string, unknown>} m — Message lean or doc
 * @returns {object}
 */
export const mapMessageToApi = (m) => {
  const createdAt = new Date(m.createdAt || m.timestamp).getTime();
  const hasAudio = Boolean(m.audio?.gridfs_file_id);
  const hasImage = Boolean(m.image?.gridfs_file_id);
  const senderId = m.senderId ? String(m.senderId) : null;
  const isOut = m.direction === 'outgoing';
  const deliveryStatus =
    isOut && m.deliveryStatus
      ? m.deliveryStatus
      : isOut
        ? 'sent'
        : null;

  return {
    id: String(m._id),
    leadId: String(m.lead_id),
    message: m.body || m.message || '',
    messageType: m.message_type || 'text',
    direction: m.direction === 'incoming' ? 'in' : 'out',
    timestampLabel: '',
    createdAt,
    hasAudio,
    audioUrl: hasAudio ? `/api/messages/${String(m._id)}/audio` : null,
    hasImage,
    imageUrl: hasImage ? `/api/messages/${String(m._id)}/image` : null,
    senderId,
    deliveryStatus,
  };
};

/**
 * @param {Record<string, unknown>} lead — Lead lean or doc
 * @param {{ lastText: string, lastAt: Date | number } | null} last
 * @returns {object}
 */
export const mapLeadToListRow = (lead, last) => {
  const id = String(lead._id);
  const st = pipelineFromDb(lead.status);
  const lastActivityAt = last?.lastAt
    ? new Date(last.lastAt).getTime()
    : new Date(lead.created_at).getTime();
  let assignedTo = null;
  if (lead.assignedTo) {
    const a = lead.assignedTo;
    if (typeof a === 'object' && a !== null && '_id' in a) {
      assignedTo = {
        id: String(a._id),
        name: typeof a.name === 'string' ? a.name : null,
        email: typeof a.email === 'string' ? a.email : null,
      };
    } else {
      assignedTo = { id: String(a), name: null, email: null };
    }
  }

  return {
    id,
    name: lead.name || null,
    phone: lead.phone_number,
    status: st,
    listBadge: listBadgeFromPipeline(st),
    lastMessage: last?.lastText ?? '',
    timestampLabel: '',
    lastActivityAt,
    unread: false,
    assignedTo,
  };
};
