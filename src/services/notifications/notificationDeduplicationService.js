/**
 * Notification Deduplication Service — Module 13
 * Unique idempotency key generation and duplicate prevention.
 * Guards against page refreshes, fast double-clicks, API retries, and webhook duplicates.
 */

// In-flight processing lock to prevent race conditions during async operations
const IN_FLIGHT_IDEMPOTENCY_LOCKS = new Set();

/**
 * Generates a deterministic idempotency key for a notification event.
 * Format: ST-NOTIFY-{requestId}-{eventType}-{uniqueQualifier}
 */
export function generateIdempotencyKey(requestId = "GENERAL", eventType = "ALERT", qualifier = "") {
  const cleanReq = String(requestId).trim().toUpperCase();
  const cleanEvt = String(eventType).trim().toUpperCase();
  const cleanQual = qualifier ? `-${String(qualifier).trim()}` : "";
  return `ST-NOTIFY-${cleanReq}-${cleanEvt}${cleanQual}`;
}

/**
 * Checks if an idempotency lock is currently held.
 */
export function isIdempotencyLocked(idempotencyKey) {
  if (!idempotencyKey) return false;
  return IN_FLIGHT_IDEMPOTENCY_LOCKS.has(idempotencyKey);
}

/**
 * Acquires an in-flight idempotency lock.
 * Returns true if lock was acquired, false if already locked.
 */
export function acquireIdempotencyLock(idempotencyKey) {
  if (!idempotencyKey) return true;
  if (IN_FLIGHT_IDEMPOTENCY_LOCKS.has(idempotencyKey)) {
    return false;
  }
  IN_FLIGHT_IDEMPOTENCY_LOCKS.add(idempotencyKey);
  return true;
}

/**
 * Releases an in-flight idempotency lock after processing.
 */
export function releaseIdempotencyLock(idempotencyKey) {
  if (!idempotencyKey) return;
  IN_FLIGHT_IDEMPOTENCY_LOCKS.delete(idempotencyKey);
}

/**
 * Checks existing notifications in store for duplicate idempotency key.
 */
export function findDuplicateNotification(notifications = [], idempotencyKey) {
  if (!idempotencyKey || !Array.isArray(notifications)) return null;
  return notifications.find(n => n.idempotencyKey === idempotencyKey) || null;
}
