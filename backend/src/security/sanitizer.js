/**
 * backend/src/security/sanitizer.js
 * Input sanitization — strips HTML/script injection before validation.
 */

const HTML_ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Strips HTML tags and escapes dangerous characters.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<\/?[^>]+(>|$)/g, '')                      // strip tags
    .replace(/[&<>"'`/]/g, char => HTML_ENTITY_MAP[char]) // escape entities
    .trim();
}

/**
 * Recursively sanitizes all string values in an object.
 * @param {object} obj
 * @returns {object}
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Validates a token string (format check only — not existence/auth).
 * Accepts 64-char hex (new format) or legacy ST-REQ tokens.
 * @param {string} token
 * @returns {boolean}
 */
export function isValidTokenString(token) {
  if (typeof token !== 'string') return false;
  const clean = token.trim();
  if (clean.length < 10 || clean.length > 200) return false;
  return /^[A-Za-z0-9\-_]{10,200}$/.test(clean);
}
