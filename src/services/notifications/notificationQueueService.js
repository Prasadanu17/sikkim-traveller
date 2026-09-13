/**
 * Notification Queue Service — Module 13
 * Manages the notification queue, lifecycle state machine transitions,
 * status updates, and read state persistence.
 */

import { NOTIFICATION_STATUSES } from "./notificationContextService";
import { loadNotificationStore, saveNotificationStore } from "./notificationFallbackService";
import { logNotificationAudit, NOTIFICATION_AUDIT_ACTIONS } from "./notificationAuditService";

/**
 * Returns all queued and delivered notifications from storage.
 */
export function getNotificationQueue() {
  return loadNotificationStore();
}

/**
 * Enqueues a new notification into the storage queue.
 */
export function enqueueNotification(notificationRecord) {
  const store = loadNotificationStore();
  const updated = [notificationRecord, ...store];
  saveNotificationStore(updated);

  logNotificationAudit({
    actor: notificationRecord.source || "SYSTEM",
    action: NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_QUEUED,
    requestId: notificationRecord.requestId,
    notificationId: notificationRecord.notificationId,
    channel: notificationRecord.channel,
    eventType: notificationRecord.eventType,
    newState: NOTIFICATION_STATUSES.QUEUED,
    details: `Enqueued notification ${notificationRecord.notificationId} via ${notificationRecord.channel}`
  });

  return notificationRecord;
}

/**
 * Updates a notification record's status in the queue.
 */
export function updateNotificationStatus(notificationId, newStatus, extraData = {}) {
  const store = loadNotificationStore();
  const index = store.findIndex(n => n.notificationId === notificationId || n.id === notificationId);

  if (index === -1) return null;

  const current = store[index];
  const previousState = current.status;
  const now = new Date().toISOString();

  const updatedRecord = {
    ...current,
    ...extraData,
    status: newStatus,
    updatedAt: now,
    sentAt: newStatus === NOTIFICATION_STATUSES.SENT || newStatus === NOTIFICATION_STATUSES.DELIVERED ? current.sentAt || now : current.sentAt,
    deliveredAt: newStatus === NOTIFICATION_STATUSES.DELIVERED ? current.deliveredAt || now : current.deliveredAt,
    readAt: newStatus === NOTIFICATION_STATUSES.READ ? current.readAt || now : current.readAt
  };

  store[index] = updatedRecord;
  saveNotificationStore(store);

  logNotificationAudit({
    actor: "SYSTEM",
    action: newStatus === NOTIFICATION_STATUSES.DELIVERED ? NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_DELIVERED :
            newStatus === NOTIFICATION_STATUSES.READ ? NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_READ :
            newStatus === NOTIFICATION_STATUSES.FAILED ? NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_FAILED :
            NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_SENT,
    requestId: current.requestId,
    notificationId: current.notificationId,
    channel: current.channel,
    eventType: current.eventType,
    previousState,
    newState: newStatus,
    details: extraData.failureReason || `Transitioned status from ${previousState} to ${newStatus}`
  });

  return updatedRecord;
}

/**
 * Marks a notification as READ.
 */
export function markQueueNotificationRead(notificationId) {
  return updateNotificationStatus(notificationId, NOTIFICATION_STATUSES.READ, { readAt: new Date().toISOString() });
}

/**
 * Marks all notifications for a request or customer as READ.
 */
export function markAllQueueNotificationsRead(customerId = null) {
  const store = loadNotificationStore();
  const now = new Date().toISOString();
  let updatedCount = 0;

  const updatedStore = store.map(n => {
    if ((!customerId || n.customerId === customerId) && n.status !== NOTIFICATION_STATUSES.READ) {
      updatedCount++;
      return {
        ...n,
        status: NOTIFICATION_STATUSES.READ,
        readAt: now,
        updatedAt: now
      };
    }
    return n;
  });

  if (updatedCount > 0) {
    saveNotificationStore(updatedStore);
  }
  return updatedCount;
}
