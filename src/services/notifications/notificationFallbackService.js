/**
 * Notification Fallback Service — Module 13
 * Manages persistent mock store in localStorage (`st_notifications_store_v1`)
 * and seeds realistic initial notification data for development mode.
 */

import { buildNotification, NOTIFICATION_STATUSES, NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS } from "./notificationContextService";

const STORAGE_KEY = "st_notifications_store_v1";

const DEMO_NOTIFICATIONS_SEED = [
  buildNotification({
    notificationId: "NOTIF-DEMO-001",
    requestId: "ST-REQ-20260823-1042",
    customerId: "CUST-98765",
    recipient: { name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210" },
    channel: NOTIFICATION_CHANNELS.IN_APP,
    eventType: NOTIFICATION_EVENTS.PROPOSAL_SENT,
    renderedContent: {
      subject: "Custom Journey Proposal Ready!",
      body: "Your 6-day Sikkim itinerary proposal for Gangtok, Lachung & Yumthang (ST-REQ-20260823-1042) is ready for review."
    },
    status: NOTIFICATION_STATUSES.DELIVERED,
    scheduledAt: null,
    idempotencyKey: "ST-NOTIFY-ST-REQ-20260823-1042-PROPOSAL_SENT-SEED",
    source: "OPERATIONS"
  }),
  buildNotification({
    notificationId: "NOTIF-DEMO-002",
    requestId: "ST-REQ-20260823-1042",
    customerId: "CUST-98765",
    recipient: { name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210" },
    channel: NOTIFICATION_CHANNELS.WHATSAPP,
    eventType: NOTIFICATION_EVENTS.WEATHER_ALERT,
    renderedContent: {
      subject: "⚠️ High Altitude Road Advisory",
      body: "Advisory for North Sikkim (Lachung/Yumthang): Light snow predicted at Yumthang Valley. Operations has updated your vehicle to 4WD."
    },
    status: NOTIFICATION_STATUSES.DELIVERED,
    scheduledAt: null,
    idempotencyKey: "ST-NOTIFY-ST-REQ-20260823-1042-WEATHER_ALERT-SEED",
    source: "REALTIME"
  }),
  buildNotification({
    notificationId: "NOTIF-DEMO-003",
    requestId: "ST-REQ-20260823-1042",
    customerId: "CUST-98765",
    recipient: { name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210" },
    channel: NOTIFICATION_CHANNELS.IN_APP,
    eventType: NOTIFICATION_EVENTS.PERMIT_REQUIRED,
    renderedContent: {
      subject: "Action Required: PAP Permit Documents",
      body: "Please upload clear passport-size photo and Govt ID proof for your Protected Area Permit (PAP) to Yumthang."
    },
    status: NOTIFICATION_STATUSES.DELIVERED,
    scheduledAt: null,
    idempotencyKey: "ST-NOTIFY-ST-REQ-20260823-1042-PERMIT_REQUIRED-SEED",
    source: "OPERATIONS"
  }),
  buildNotification({
    notificationId: "NOTIF-DEMO-004",
    requestId: "ST-REQ-20260823-1044",
    customerId: "CUST-45678",
    recipient: { name: "Vikram Mehta", email: "vikram@example.com", phone: "+91 96543 21098" },
    channel: NOTIFICATION_CHANNELS.EMAIL,
    eventType: NOTIFICATION_EVENTS.PAYMENT_RECEIVED,
    renderedContent: {
      subject: "Payment Received — ₹25,000",
      body: "We have received your advance payment of ₹25,000 for booking ST-REQ-20260823-1044. Official receipt #REC-8921 generated."
    },
    status: NOTIFICATION_STATUSES.DELIVERED,
    scheduledAt: null,
    idempotencyKey: "ST-NOTIFY-ST-REQ-20260823-1044-PAYMENT_RECEIVED-SEED",
    source: "FINANCIAL"
  })
];

/**
 * Initializes mock store with seed data if empty.
 */
export function initializeNotificationStoreIfNeeded() {
  const isMockMode = import.meta.env.VITE_NOTIFICATIONS_MOCK_MODE !== "false";
  if (!isMockMode) return;

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_NOTIFICATIONS_SEED));
    }
  } catch (_err) {
    console.warn("[NotificationFallback] Could not initialize notification store.");
  }
}

/**
 * Loads all notifications from localStorage.
 */
export function loadNotificationStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_NOTIFICATIONS_SEED));
      return DEMO_NOTIFICATIONS_SEED;
    }
    return JSON.parse(raw);
  } catch (_err) {
    return DEMO_NOTIFICATIONS_SEED;
  }
}

/**
 * Saves notification list to localStorage.
 */
export function saveNotificationStore(notifications = []) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (_err) {
    console.warn("[NotificationFallback] Could not save notification store.");
  }
}

/**
 * Resets notification store to fresh seed.
 */
export function resetNotificationStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_NOTIFICATIONS_SEED));
    return DEMO_NOTIFICATIONS_SEED;
  } catch (_err) {
    return [];
  }
}
