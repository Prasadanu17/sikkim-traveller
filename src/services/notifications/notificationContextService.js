/**
 * Notification Context Service — Module 13
 * Core domain constants, event definitions, channel enums, lifecycle states,
 * and factory functions for notifications, templates, preferences, and audit logs.
 */

// ─────────────────────────────────────────────
// LIFECYCLE STATES
// ─────────────────────────────────────────────
export const NOTIFICATION_STATUSES = {
  DRAFT: "DRAFT",
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
  RETRY_SCHEDULED: "RETRY_SCHEDULED",
  ABANDONED: "ABANDONED"
};

// ─────────────────────────────────────────────
// CHANNELS
// ─────────────────────────────────────────────
export const NOTIFICATION_CHANNELS = {
  EMAIL: "EMAIL",
  WHATSAPP: "WHATSAPP",
  SMS: "SMS",
  IN_APP: "IN_APP",
  PUSH: "PUSH"
};

// ─────────────────────────────────────────────
// EVENT TYPES
// ─────────────────────────────────────────────
export const NOTIFICATION_EVENTS = {
  // Booking events
  BOOKING_RECEIVED: "BOOKING_RECEIVED",
  BOOKING_UNDER_REVIEW: "BOOKING_UNDER_REVIEW",
  BOOKING_STATUS_CHANGED: "BOOKING_STATUS_CHANGED",

  // Quote & Proposal events
  QUOTE_CREATED: "QUOTE_CREATED",
  QUOTE_UPDATED: "QUOTE_UPDATED",
  QUOTE_EXPIRED: "QUOTE_EXPIRED",
  PROPOSAL_CREATED: "PROPOSAL_CREATED",
  PROPOSAL_SENT: "PROPOSAL_SENT",
  PROPOSAL_ACCEPTED: "PROPOSAL_ACCEPTED",
  PROPOSAL_REQUIRES_REAPPROVAL: "PROPOSAL_REQUIRES_REAPPROVAL",

  // Payment & Invoice events
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
  INVOICE_CREATED: "INVOICE_CREATED",
  INVOICE_UPDATED: "INVOICE_UPDATED",

  // Permit events
  PERMIT_REQUIRED: "PERMIT_REQUIRED",
  PERMIT_DOCUMENTS_PENDING: "PERMIT_DOCUMENTS_PENDING",
  PERMIT_APPROVED: "PERMIT_APPROVED",
  PERMIT_REJECTED: "PERMIT_REJECTED",

  // Travel intelligence & alerts
  WEATHER_ALERT: "WEATHER_ALERT",
  ROAD_ALERT: "ROAD_ALERT",
  DESTINATION_RESTRICTION: "DESTINATION_RESTRICTION",

  // Trip Reminders & Schedules
  TRIP_REMINDER: "TRIP_REMINDER",
  PRE_TRIP_REMINDER: "PRE_TRIP_REMINDER",
  TRIP_STARTING: "TRIP_STARTING",
  TRIP_DAY_UPDATE: "TRIP_DAY_UPDATE",
  TRIP_COMPLETED: "TRIP_COMPLETED",
  POST_TRIP_FOLLOWUP: "POST_TRIP_FOLLOWUP",

  // System & Operations
  SYSTEM_ALERT: "SYSTEM_ALERT",
  MANUAL_MESSAGE: "MANUAL_MESSAGE"
};

// Map event types to default topic categories
export const EVENT_TOPIC_MAP = {
  [NOTIFICATION_EVENTS.BOOKING_RECEIVED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.BOOKING_UNDER_REVIEW]: "bookingUpdates",
  [NOTIFICATION_EVENTS.BOOKING_STATUS_CHANGED]: "bookingUpdates",

  [NOTIFICATION_EVENTS.QUOTE_CREATED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.QUOTE_UPDATED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.QUOTE_EXPIRED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.PROPOSAL_CREATED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.PROPOSAL_SENT]: "bookingUpdates",
  [NOTIFICATION_EVENTS.PROPOSAL_ACCEPTED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.PROPOSAL_REQUIRES_REAPPROVAL]: "bookingUpdates",

  [NOTIFICATION_EVENTS.PAYMENT_PENDING]: "paymentUpdates",
  [NOTIFICATION_EVENTS.PAYMENT_RECEIVED]: "paymentUpdates",
  [NOTIFICATION_EVENTS.PAYMENT_FAILED]: "paymentUpdates",
  [NOTIFICATION_EVENTS.PAYMENT_REFUNDED]: "paymentUpdates",
  [NOTIFICATION_EVENTS.INVOICE_CREATED]: "paymentUpdates",
  [NOTIFICATION_EVENTS.INVOICE_UPDATED]: "paymentUpdates",

  [NOTIFICATION_EVENTS.PERMIT_REQUIRED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.PERMIT_DOCUMENTS_PENDING]: "bookingUpdates",
  [NOTIFICATION_EVENTS.PERMIT_APPROVED]: "bookingUpdates",
  [NOTIFICATION_EVENTS.PERMIT_REJECTED]: "bookingUpdates",

  [NOTIFICATION_EVENTS.WEATHER_ALERT]: "travelAlerts",
  [NOTIFICATION_EVENTS.ROAD_ALERT]: "travelAlerts",
  [NOTIFICATION_EVENTS.DESTINATION_RESTRICTION]: "travelAlerts",

  [NOTIFICATION_EVENTS.TRIP_REMINDER]: "tripReminders",
  [NOTIFICATION_EVENTS.PRE_TRIP_REMINDER]: "tripReminders",
  [NOTIFICATION_EVENTS.TRIP_STARTING]: "tripReminders",
  [NOTIFICATION_EVENTS.TRIP_DAY_UPDATE]: "tripReminders",
  [NOTIFICATION_EVENTS.TRIP_COMPLETED]: "tripReminders",
  [NOTIFICATION_EVENTS.POST_TRIP_FOLLOWUP]: "tripReminders",

  [NOTIFICATION_EVENTS.SYSTEM_ALERT]: "bookingUpdates",
  [NOTIFICATION_EVENTS.MANUAL_MESSAGE]: "bookingUpdates"
};

// ─────────────────────────────────────────────
// FACTORY BUILDERS
// ─────────────────────────────────────────────

/**
 * Builds a standardized Notification object.
 */
export function buildNotification({
  notificationId,
  requestId,
  customerId = "CUST-DEFAULT",
  recipient = {},
  channel = NOTIFICATION_CHANNELS.IN_APP,
  templateId = null,
  templateVersion = "1.0",
  eventType = NOTIFICATION_EVENTS.SYSTEM_ALERT,
  payload = {},
  renderedContent = {},
  status = NOTIFICATION_STATUSES.QUEUED,
  scheduledAt = null,
  idempotencyKey = null,
  source = "SYSTEM",
  isAIDraft = false
}) {
  const now = new Date().toISOString();
  const id = notificationId || `NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    notificationId: id,
    id: id, // compatibility alias
    requestId: requestId || "GENERAL",
    customerId: customerId || "CUST-GUEST",
    recipient: {
      name: recipient.name || recipient.fullName || "Valued Guest",
      email: recipient.email || "",
      phone: recipient.phone || ""
    },
    channel,
    templateId: templateId || `TPL_${eventType}`,
    templateVersion,
    eventType,
    payload,
    renderedContent: {
      subject: renderedContent.subject || "Notification from Sikkim Traveller",
      body: renderedContent.body || ""
    },
    status,
    createdAt: now,
    updatedAt: now,
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    sentAt: null,
    deliveredAt: null,
    readAt: null,
    failureReason: null,
    retryCount: 0,
    maxRetries: 3,
    idempotencyKey: idempotencyKey || `ST-NOTIFY-${requestId || "SYS"}-${eventType}-${Date.now()}`,
    source,
    isAIDraft: Boolean(isAIDraft),
    _isAIDraft: Boolean(isAIDraft),
    _isMockData: true
  };
}

/**
 * Builds default notification preferences for a customer.
 */
export function buildDefaultPreferences(customerId) {
  return {
    customerId: customerId || "DEFAULT",
    channels: {
      email: true,
      whatsApp: true,
      sms: false,
      inApp: true,
      push: false
    },
    topics: {
      bookingUpdates: true,
      paymentUpdates: true,
      travelAlerts: true,
      tripReminders: true,
      marketing: false // Default to OFF per security & compliance rules
    },
    updatedAt: new Date().toISOString()
  };
}
