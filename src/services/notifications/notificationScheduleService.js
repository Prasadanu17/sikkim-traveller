/**
 * Notification Schedule Service — Module 13
 * Evaluates upcoming booking dates to generate pre-trip, trip-start, and post-trip scheduled reminders.
 * Provides deterministic simulation controls for dev mode.
 */

import { NOTIFICATION_EVENTS, NOTIFICATION_CHANNELS } from "./notificationContextService";
import { generateIdempotencyKey } from "./notificationDeduplicationService";

/**
 * Evaluates a booking record to identify scheduled notification candidates.
 */
export function evaluateScheduledNotificationCandidates(bookingRecord) {
  if (!bookingRecord || !bookingRecord.trip?.startDate) return [];

  const candidates = [];
  const startDateStr = bookingRecord.trip.startDate;
  const startDate = new Date(startDateStr);
  const now = new Date();
  
  // Calculate difference in days
  const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const reqId = bookingRecord.requestId;
  const customerName = bookingRecord.customer?.name || "Traveler";
  const destination = (bookingRecord.destinations || ["Sikkim"]).join(", ");

  // 1. Pre-trip 7-day reminder
  if (diffDays === 7 || diffDays === 6) {
    candidates.push({
      eventType: NOTIFICATION_EVENTS.PRE_TRIP_REMINDER,
      channel: NOTIFICATION_CHANNELS.IN_APP,
      requestId: reqId,
      customerId: bookingRecord.customerId || "CUST-GUEST",
      recipient: { name: customerName, email: bookingRecord.customer?.email, phone: bookingRecord.customer?.phone },
      payload: { daysLeft: 7, startDate: startDateStr, destination },
      idempotencyKey: generateIdempotencyKey(reqId, NOTIFICATION_EVENTS.PRE_TRIP_REMINDER, "7DAYS")
    });
  }

  // 2. Pre-trip 1-day reminder
  if (diffDays === 1 || diffDays === 0) {
    candidates.push({
      eventType: NOTIFICATION_EVENTS.TRIP_STARTING,
      channel: NOTIFICATION_CHANNELS.WHATSAPP,
      requestId: reqId,
      customerId: bookingRecord.customerId || "CUST-GUEST",
      recipient: { name: customerName, email: bookingRecord.customer?.email, phone: bookingRecord.customer?.phone },
      payload: { daysLeft: 1, startDate: startDateStr, destination, driverName: "Tenzing Bhutia", driverPhone: "+91 98320 12345" },
      idempotencyKey: generateIdempotencyKey(reqId, NOTIFICATION_EVENTS.TRIP_STARTING, "1DAY")
    });
  }

  // 3. Post-trip follow-up (e.g. 1 day after end date)
  if (bookingRecord.trip?.endDate) {
    const endDate = new Date(bookingRecord.trip.endDate);
    const endDiffDays = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 3600 * 24));
    if (endDiffDays === 1) {
      candidates.push({
        eventType: NOTIFICATION_EVENTS.POST_TRIP_FOLLOWUP,
        channel: NOTIFICATION_CHANNELS.EMAIL,
        requestId: reqId,
        customerId: bookingRecord.customerId || "CUST-GUEST",
        recipient: { name: customerName, email: bookingRecord.customer?.email, phone: bookingRecord.customer?.phone },
        payload: { destination },
        idempotencyKey: generateIdempotencyKey(reqId, NOTIFICATION_EVENTS.POST_TRIP_FOLLOWUP, "1DAY_POST")
      });
    }
  }

  return candidates;
}
