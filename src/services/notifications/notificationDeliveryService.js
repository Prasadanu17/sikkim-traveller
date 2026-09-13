/**
 * Notification Delivery Service — Module 13
 * Handles provider invocation, error isolation, and status updates upon dispatch.
 */

import { NOTIFICATION_STATUSES } from "./notificationContextService";
import { executeProviderDelivery } from "./notificationProviderRegistry";
import { updateNotificationStatus } from "./notificationQueueService";

/**
 * Delivers a queued notification record through its designated provider.
 */
export async function deliverNotification(notificationRecord) {
  if (!notificationRecord) return { success: false, error: "Invalid notification record." };

  // Mark status as PROCESSING
  updateNotificationStatus(notificationRecord.notificationId, NOTIFICATION_STATUSES.PROCESSING);

  try {
    const result = await executeProviderDelivery(notificationRecord);

    if (result.success) {
      const updated = updateNotificationStatus(
        notificationRecord.notificationId,
        NOTIFICATION_STATUSES.DELIVERED,
        {
          providerRef: result.providerRef,
          simulationNotice: result.notice
        }
      );
      return { success: true, notification: updated };
    } else {
      const updated = updateNotificationStatus(
        notificationRecord.notificationId,
        NOTIFICATION_STATUSES.FAILED,
        { failureReason: result.error || "Delivery provider failed." }
      );
      return { success: false, error: result.error, notification: updated };
    }
  } catch (err) {
    const updated = updateNotificationStatus(
      notificationRecord.notificationId,
      NOTIFICATION_STATUSES.FAILED,
      { failureReason: err.message || "Unhandled exception during delivery." }
    );
    return { success: false, error: err.message, notification: updated };
  }
}
