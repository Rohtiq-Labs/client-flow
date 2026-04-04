/**
 * Canonical form for storing / matching Twilio WhatsApp identifiers: `whatsapp:+E164` (no spaces).
 * Twilio inbound `To` is usually `whatsapp:+14155238886`.
 */
export const normalizeWhatsAppNumberForStorage = (value) => {
  if (value === undefined || value === null) return '';
  let s = String(value).trim().replace(/\s+/g, '');
  if (!s) return '';
  s = s.replace(/^whatsapp:/i, '');
  if (!s.startsWith('+')) {
    s = `+${s}`;
  }
  return `whatsapp:${s}`;
};

/**
 * All string variants we may have in DB or on the wire for the same number.
 */
export const buildWhatsAppInboundLookupCandidates = (rawTo) => {
  if (!rawTo || typeof rawTo !== 'string') return [];
  const canonical = normalizeWhatsAppNumberForStorage(rawTo);
  if (!canonical) return [];
  const bare = canonical.replace(/^whatsapp:/i, '');
  return [...new Set([canonical, bare, `whatsapp:${bare}`])];
};
