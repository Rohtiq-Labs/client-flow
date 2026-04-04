/** @type {readonly string[]} */
export const LEAD_STATUS_ENUM = Object.freeze([
  'new',
  'replied',
  'interested',
  'converted',
  'lost',
]);

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export const isValidLeadStatus = (value) =>
  typeof value === 'string' && LEAD_STATUS_ENUM.includes(value.trim().toLowerCase());

/**
 * @param {string} value
 * @returns {string}
 */
export const normalizeLeadStatus = (value) => value.trim().toLowerCase();
