/**
 * backend/src/security/tokenGenerator.js
 * Cryptographically secure journey access token generation.
 *
 * SECURITY DESIGN:
 * - Tokens are generated using crypto.randomBytes() — 256-bit entropy
 * - Raw tokens are NEVER stored in the database
 * - Only SHA-256(token + pepper) is stored
 * - The journey requestId format (ST-REQ-YYYYMMDD-XXXX) remains the same
 *   for human-readable identification
 * - The access token is a separate, high-entropy random value
 */

import crypto from 'crypto';
import env from '../config/env.js';

/**
 * Generates a human-readable journey Request ID.
 * This is NOT a secret — it is a display identifier only.
 * @returns {string} e.g. "ST-REQ-20260826-4271"
 */
export function generateRequestId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ST-REQ-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Generates a cryptographically secure access token.
 * Returns the raw (plaintext) token — show to customer ONCE, then discard.
 * @returns {string} 64-char hex string (256 bits of entropy)
 */
export function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a raw token with HMAC-SHA256 and the server-side pepper.
 * This hash is what gets stored in the database.
 * @param {string} rawToken
 * @returns {string} HMAC-SHA256 hex digest
 */
export function hashToken(rawToken) {
  return crypto
    .createHmac(env.CUSTOMER_TOKEN_HASH_ALGORITHM || 'sha256', env.CUSTOMER_TOKEN_PEPPER)
    .update(rawToken)
    .digest('hex');
}

/**
 * Validates a raw token string format (basic sanity check before hashing).
 * A valid raw token is a 64-character lowercase hex string.
 * @param {string} token
 * @returns {boolean}
 */
export function isValidTokenFormat(token) {
  if (typeof token !== 'string') return false;
  const clean = token.trim();
  // Accept both the new format (64-char hex) and the legacy ST-REQ-...-TK... format
  return /^[a-f0-9]{64}$/.test(clean) || /^ST-REQ-\d{8}-\d{4}-TK[A-Za-z0-9]{6,12}$/.test(clean);
}

/**
 * Computes token expiration date.
 * @param {number} [days] - Override default expiry days
 * @returns {Date}
 */
export function tokenExpiresAt(days) {
  const d = new Date();
  d.setDate(d.getDate() + (days ?? env.JOURNEY_TOKEN_EXPIRY_DAYS));
  return d;
}

/**
 * Generates a full journey access package:
 * - Human-readable requestId
 * - Cryptographically secure raw token (return to customer ONCE)
 * - Token hash (store in DB)
 * - Token expiry
 */
export function generateJourneyAccessPackage() {
  const requestId = generateRequestId();
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = tokenExpiresAt();

  return {
    requestId,
    rawToken,   // → send to customer, NEVER store
    tokenHash,  // → store in DB
    expiresAt,
    accessUrl: `/trip-planner/dashboard?token=${encodeURIComponent(rawToken)}`
  };
}
