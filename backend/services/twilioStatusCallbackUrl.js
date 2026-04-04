/**
 * URL Twilio POSTs to for outbound message status (sent / delivered / read).
 * Must match exactly what is passed to `messages.create({ statusCallback })` and
 * what you use in `validateRequest`.
 */
export const getTwilioMessageStatusCallbackUrl = () => {
  const explicit = String(process.env.TWILIO_STATUS_CALLBACK_URL ?? '').trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  const base = String(process.env.PUBLIC_BASE_URL ?? '').trim().replace(/\/$/, '');
  if (!base) {
    return '';
  }
  return `${base}/webhook/message-status`;
};
