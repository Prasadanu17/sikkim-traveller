/**
 * Customer Notification Service — Module 11
 * Generates customer-facing alerts, proposal reminders, and document notices.
 */

export function getCustomerNotifications(booking) {
  if (!booking) return [];

  const notifications = [];

  // 1. Pending Proposal Approval
  if (booking.status === "AWAITING_CUSTOMER" || booking.status === "PROPOSAL_SENT") {
    notifications.push({
      id: "NOTIF-PROPOSAL",
      type: "ACTION_REQUIRED",
      title: "Proposal Ready For Review",
      message: `Your personalized ${booking.proposal?.versionLabel || "Proposal"} is ready. Review details and approve to secure hotel allotments.`,
      severity: "warning",
      actionText: "Review Proposal",
      actionTab: "proposal"
    });
  }

  // 2. Pending Change Request
  if (booking.hasPendingChangeRequest) {
    notifications.push({
      id: "NOTIF-CHANGE-REQ",
      type: "INFO",
      title: "Change Request Under Review",
      message: "Our destination architect is incorporating your requested adjustments into an updated proposal.",
      severity: "info",
      actionTab: "overview"
    });
  }

  // 3. Confirmed Trip
  if (booking.status === "CONFIRMED") {
    notifications.push({
      id: "NOTIF-CONFIRMED",
      type: "SUCCESS",
      title: "Trip Confirmed",
      message: "Your Sikkim holiday is confirmed! All room vouchers and private vehicle details are finalized.",
      severity: "success",
      actionText: "View Documents",
      actionTab: "documents"
    });
  }

  // 4. Documents available
  if (Array.isArray(booking.documents) && booking.documents.length > 0) {
    notifications.push({
      id: "NOTIF-DOCS",
      type: "DOCUMENT",
      title: `${booking.documents.length} Travel Document${booking.documents.length === 1 ? "" : "s"} Available`,
      message: "Download or view your verified itineraries and vouchers in the Documents section.",
      severity: "info",
      actionText: "View Documents",
      actionTab: "documents"
    });
  }

  // 5. Permit clearance status
  if (booking.permits?.status === "PROCESSING") {
    notifications.push({
      id: "NOTIF-PERMIT",
      type: "PERMIT",
      title: "Protected Area Permit in Progress",
      message: "Sikkim Department of Tourism permit submission is active for your restricted zone visits.",
      severity: "info",
      actionTab: "overview"
    });
  }

  return notifications;
}
