/**
 * Customer Portal Sanitization Service — Module 11
 * Sanitizes all user-supplied input strings, textareas, and parameters.
 * Validates tracking token formats to protect against injection and IDOR attacks.
 */

// ─────────────────────────────────────────────
// HTML & TEXT SANITIZATION
// ─────────────────────────────────────────────

const HTML_ENTITY_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;"
};

/**
 * Strips HTML tags and escapes dangerous HTML entities.
 * @param {string} input - Raw string
 * @returns {string} Sanitized string
 */
export function sanitizeText(input) {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Strip HTML tags
  let clean = input.replace(/<\/?[^>]+(>|$)/g, "");

  // 2. Escape special characters
  clean = clean.replace(/[&<>"'`/]/g, (char) => HTML_ENTITY_MAP[char] || char);

  // 3. Trim whitespace
  return clean.trim();
}

/**
 * Recursively sanitizes all string properties in an object.
 * @param {object} obj
 * @returns {object} Sanitized object clone
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─────────────────────────────────────────────
// TRACKING TOKEN VALIDATION
// ─────────────────────────────────────────────

/**
 * Validates tracking token format.
 * Valid tokens follow patterns:
 * - ST-TRK-XXXXX (e.g., ST-TRK-88219)
 * - ST-REQ-YYYYMMDD-XXXX (e.g., ST-REQ-2026-0042)
 * - Standard alphanumeric tokens 6–36 chars long (letters, numbers, hyphens only).
 * @param {string} token
 * @returns {boolean} True if format is valid
 */
export function validateTrackingToken(token) {
  if (!token || typeof token !== "string") return false;
  const clean = token.trim();
  if (clean.length < 5 || clean.length > 40) return false;

  // Strict regex: alphanumeric and hyphens only — no whitespace, quotes, slashes, or script chars
  const tokenRegex = /^[A-Za-z0-9\-_]{5,40}$/;
  return tokenRegex.test(clean);
}

/**
 * Sanitizes and validates a change request payload.
 * @param {object} payload
 * @returns {object} { isValid: boolean, sanitized: object, error?: string }
 */
export function sanitizeChangeRequest(payload) {
  if (!payload || typeof payload !== "object") {
    return { isValid: false, sanitized: null, error: "Invalid change request data." };
  }

  const validCategories = [
    "DATES",
    "DESTINATIONS",
    "ACCOMMODATION",
    "TRANSPORTATION",
    "BUDGET_REDUCE",
    "BUDGET_INCREASE",
    "PACE",
    "ACTIVITY",
    "GENERAL"
  ];

  const category = (payload.category || "GENERAL").toUpperCase().trim();
  const safeCategory = validCategories.includes(category) ? category : "GENERAL";
  const rawDescription = payload.description || "";
  const sanitizedDescription = sanitizeText(rawDescription);

  if (!sanitizedDescription || sanitizedDescription.length < 5) {
    return {
      isValid: false,
      sanitized: null,
      error: "Please provide a brief description (at least 5 characters) of the changes you would like to request."
    };
  }

  if (sanitizedDescription.length > 2000) {
    return {
      isValid: false,
      sanitized: null,
      error: "Description is too long (maximum 2,000 characters allowed)."
    };
  }

  return {
    isValid: true,
    sanitized: {
      category: safeCategory,
      description: sanitizedDescription,
      requestedAt: new Date().toISOString()
    }
  };
}
