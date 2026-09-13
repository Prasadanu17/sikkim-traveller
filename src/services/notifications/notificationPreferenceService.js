/**
 * Notification Preference Service — Module 13
 * Customer notification preference management and channel/topic delivery authorization checks.
 * Supports opt-out rules and mandatory operational overrides.
 */

import { buildDefaultPreferences, EVENT_TOPIC_MAP, NOTIFICATION_CHANNELS } from "./notificationContextService";

const PREFERENCES_STORAGE_KEY = "st_notification_preferences_v1";

/**
 * Loads customer preferences from storage or builds defaults.
 */
export function getCustomerPreferences(customerId = "DEFAULT") {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) {
      const allPrefs = JSON.parse(raw);
      if (allPrefs[customerId]) {
        return allPrefs[customerId];
      }
    }
  } catch (_err) {
    console.warn("[NotificationPreferences] Could not load customer preferences.");
  }
  return buildDefaultPreferences(customerId);
}

/**
 * Saves updated preferences for a customer.
 */
export function saveCustomerPreferences(customerId, updatedPreferences) {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    const allPrefs = raw ? JSON.parse(raw) : {};

    const updated = {
      ...getCustomerPreferences(customerId),
      ...updatedPreferences,
      customerId,
      updatedAt: new Date().toISOString()
    };

    allPrefs[customerId] = updated;
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(allPrefs));
    return updated;
  } catch (_err) {
    console.warn("[NotificationPreferences] Could not save preferences.");
    return buildDefaultPreferences(customerId);
  }
}

/**
 * Evaluates whether a notification should be delivered to a recipient
 * based on channel toggles, topic toggles, and mandatory event overrides.
 */
export function shouldDeliverNotification(customerId, channel, eventType) {
  const prefs = getCustomerPreferences(customerId);

  // 1. Mandatory operational events (e.g. urgent weather risk, permit rejection, security alert) cannot be disabled by topic
  const isMandatoryEvent = [
    "WEATHER_ALERT",
    "ROAD_ALERT",
    "PERMIT_REJECTED",
    "PAYMENT_REFUNDED",
    "SYSTEM_ALERT"
  ].includes(eventType);

  if (isMandatoryEvent && channel === NOTIFICATION_CHANNELS.IN_APP) {
    return { deliver: true, reason: "Mandatory operational notification (In-App guaranteed)" };
  }

  // 2. Check channel setting
  const channelKey = {
    [NOTIFICATION_CHANNELS.EMAIL]: "email",
    [NOTIFICATION_CHANNELS.WHATSAPP]: "whatsApp",
    [NOTIFICATION_CHANNELS.SMS]: "sms",
    [NOTIFICATION_CHANNELS.IN_APP]: "inApp",
    [NOTIFICATION_CHANNELS.PUSH]: "push"
  }[channel] || "inApp";

  if (prefs.channels && prefs.channels[channelKey] === false) {
    return { deliver: false, reason: `Channel "${channel}" is disabled by customer preference.` };
  }

  // 3. Check topic setting
  const topic = EVENT_TOPIC_MAP[eventType] || "bookingUpdates";
  if (prefs.topics && prefs.topics[topic] === false && !isMandatoryEvent) {
    return { deliver: false, reason: `Topic category "${topic}" is opted out by customer.` };
  }

  return { deliver: true, reason: "Delivery authorized by preferences" };
}
