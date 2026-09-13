import { getNotificationQueue, markQueueNotificationRead, markAllQueueNotificationsRead } from "../notifications/notificationQueueService";

/**
 * Extracts and returns customer-safe notifications based on booking events & queue store.
 */
export function getCustomerNotifications(booking) {
  if (!booking) return [];

  const queue = getNotificationQueue();
  const reqId = booking.requestId || booking.id;

  // Filter items corresponding to this booking request
  const matched = queue.filter(n => n.requestId === reqId || n.requestId === booking.requestId || n.id === booking.id);

  if (matched.length > 0) {
    return matched.map(n => ({
      id: n.notificationId || n.id,
      type: n.eventType,
      priority: n.payload?.priority || "INFO",
      title: n.renderedContent?.subject || n.subject || "Travel Update",
      message: n.renderedContent?.body || n.body || n.message,
      section: "overview",
      timestamp: n.createdAt,
      read: n.status === "READ"
    }));
  }

  // Fallback derived items if queue is empty
  const status = booking.status;
  const notifications = [];

  if (status === "PROPOSAL_SENT" || status === "AWAITING_CUSTOMER") {
    notifications.push({
      id: `${booking.id}-proposal-ready`,
      type: "PRICE_UPDATE",
      priority: "URGENT",
      title: "Proposal Ready for Review",
      message: "Your custom Sikkim journey proposal is ready. Please review the details and accept to proceed.",
      section: "proposal",
      timestamp: booking.updatedAt,
      read: false
    });
  }

  return notifications;
}

export function markNotificationRead(id) {
  markQueueNotificationRead(id);
}

export function markAllNotificationsRead(notifications = []) {
  markAllQueueNotificationsRead();
}

