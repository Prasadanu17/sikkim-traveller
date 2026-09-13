/**
 * Notification Audit Service — Module 13
 * Append-only audit logger for notification lifecycle and communication actions.
 * Audit logs are immutable and never deleted.
 */

const AUDIT_STORAGE_KEY = "st_notification_audit_log_v1";

export const NOTIFICATION_AUDIT_ACTIONS = {
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
  NOTIFICATION_QUEUED: "NOTIFICATION_QUEUED",
  NOTIFICATION_SENT: "NOTIFICATION_SENT",
  NOTIFICATION_DELIVERED: "NOTIFICATION_DELIVERED",
  NOTIFICATION_FAILED: "NOTIFICATION_FAILED",
  NOTIFICATION_RETRIED: "NOTIFICATION_RETRIED",
  NOTIFICATION_READ: "NOTIFICATION_READ",
  PREFERENCE_CHANGED: "PREFERENCE_CHANGED",
  MESSAGE_DRAFTED: "MESSAGE_DRAFTED",
  MESSAGE_SENT: "MESSAGE_SENT",
  MESSAGE_CANCELLED: "MESSAGE_CANCELLED"
};

/**
 * Loads all audit entries.
 */
export function getNotificationAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_err) {
    return [];
  }
}

/**
 * Appends an immutable audit event to the notification audit log.
 */
export function logNotificationAudit({
  actor = "SYSTEM",
  action = NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_CREATED,
  requestId = "GENERAL",
  notificationId = null,
  channel = null,
  eventType = null,
  previousState = null,
  newState = null,
  details = ""
}) {
  const auditEvent = {
    auditId: `AUDIT-NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    requestId,
    notificationId,
    channel,
    eventType,
    previousState,
    newState,
    details
  };

  try {
    const existing = getNotificationAuditLogs();
    const updated = [auditEvent, ...existing];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (_err) {
    console.warn("[NotificationAudit] Failed to append audit log.");
  }

  return auditEvent;
}
