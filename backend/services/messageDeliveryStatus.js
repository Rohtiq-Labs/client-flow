/** @typedef {'sent' | 'delivered' | 'read' | 'failed'} DeliveryStatus */

const SUCCESS_ORDER = { sent: 1, delivered: 2, read: 3 };

/**
 * Map Twilio MessageStatus to our delivery enum (outbound only).
 * @param {string | undefined} twilioStatus
 * @returns {DeliveryStatus | null} null = ignore (e.g. inbound-only statuses)
 */
export const twilioStatusToDelivery = (twilioStatus) => {
  const s = String(twilioStatus || '').toLowerCase().trim();
  if (!s) return null;
  if (s === 'failed' || s === 'undelivered') return 'failed';
  if (s === 'read') return 'read';
  if (s === 'delivered') return 'delivered';
  if (
    s === 'queued' ||
    s === 'accepted' ||
    s === 'scheduled' ||
    s === 'sending' ||
    s === 'sent'
  ) {
    return 'sent';
  }
  return null;
};

/**
 * Whether to persist `incoming` over `current` (monotonic for success; failed always wins).
 * @param {DeliveryStatus | undefined | null} current
 * @param {DeliveryStatus | null} incoming
 */
export const shouldApplyDeliveryUpdate = (current, incoming) => {
  if (incoming === null) return false;
  if (current === 'failed' && incoming !== 'failed') return false;
  if (incoming === 'failed') return true;
  const cur =
    current && SUCCESS_ORDER[current] !== undefined
      ? SUCCESS_ORDER[current]
      : 0;
  const inc = SUCCESS_ORDER[incoming] ?? 0;
  return inc > cur;
};
