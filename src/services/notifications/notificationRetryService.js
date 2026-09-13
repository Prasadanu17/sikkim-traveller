/**
 * Notification Retry Service — Module 13
 * Handles controlled notification retries with exponential backoff and maximum attempt guards.
 * Prevents infinite retry loops and marks permanently failed messages as ABANDONED.
 */

import { NOTIFICATION_STATUSES } from "./notificationContextService";
import { updateNotificationStatus, getNotificationQueue } from "./notificationQueueService";
import { deliverNotification } from "./notificationDeliveryService";
import { logNotificationAudit, NOTIFICATION_AUDIT_ACTIONS } from "./notificationAuditService";

const MAX_RETRY_LIMIT = 3;

/**
 * Calculates exponential backoff delay in milliseconds.
 * Attempt 1: 5s, Attempt 2: 30s, Attempt 3: 120s
 */
export function calculateBackoffMs(retryCount) {
  const delays = [5000, 30000, 120000];
  return delays[Math.min(retryCount, delays.length - 1)];
}

/**
 * Initiates a retry attempt for a failed notification.
 */
export async function retryNotification(notificationId, actor = "OPERATIONS_STAFF") {
  const queue = getNotificationQueue();
  const notification = queue.find(n => n.notificationId === notificationId || n.id === notificationId);

  if (!notification) {
    return { success: false, error: "Notification not found." };
  }

  if (notification.status !== NOTIFICATION_STATUSES.FAILED && notification.status !== NOTIFICATION_STATUSES.RETRY_SCHEDULED) {
    return { success: false, error: `Cannot retry notification in status ${notification.status}` };
  }

  const currentCount = notification.retryCount || 0;
  if (currentCount >= (notification.maxRetries || MAX_RETRY_LIMIT)) {
    // Permanent Failure -> Transition to ABANDONED
    const abandoned = updateNotificationStatus(
      notification.notificationId,
      NOTIFICATION_STATUSES.ABANDONED,
      { failureReason: `Exceeded maximum retry attempts (${MAX_RETRY_LIMIT}). Delivery abandoned.` }
    );

    logNotificationAudit({
      actor,
      action: NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_FAILED,
      requestId: notification.requestId,
      notificationId: notification.notificationId,
      channel: notification.channel,
      previousState: notification.status,
      newState: NOTIFICATION_STATUSES.ABANDONED,
      details: "Max retries exceeded. Permanently abandoned."
    });

    return { success: false, error: "Maximum retry limit reached. Marked as ABANDONED.", notification: abandoned };
  }

  // Update retry count and status to RETRY_SCHEDULED
  const nextRetryAt = new Date(Date.now() + calculateBackoffMs(currentCount)).toISOString();
  updateNotificationStatus(
    notification.notificationId,
    NOTIFICATION_STATUSES.RETRY_SCHEDULED,
    {
      retryCount: currentCount + 1,
      scheduledAt: nextRetryAt
    }
  );

  logNotificationAudit({
    actor,
    action: NOTIFICATION_AUDIT_ACTIONS.NOTIFICATION_RETRIED,
    requestId: notification.requestId,
    notificationId: notification.notificationId,
    channel: notification.channel,
    previousState: notification.status,
    newState: NOTIFICATION_STATUSES.RETRY_SCHEDULED,
    details: `Retry attempt #${currentCount + 1} initiated by ${actor}`
  });

  // Attempt redelivery
  return deliverNotification({
    ...notification,
    retryCount: currentCount + 1,
    // Clear failure simulation tag on explicit manual retry
    payload: { ...notification.payload, _simulateFailure: false }
  });
}
