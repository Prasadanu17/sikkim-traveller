/**
 * Operations Alert Service — Module 10
 * Generates prioritized alerts from booking data.
 * Never fabricates data — alerts are derived from real record state.
 */

import { PERMIT_SENSITIVE_DESTINATIONS } from "./operationsContextService";

// ─────────────────────────────────────────────
// ALERT TYPES
// ─────────────────────────────────────────────

export const ALERT_SEVERITY = {
  URGENT:  "URGENT",
  WARNING: "WARNING",
  INFO:    "INFO",
  READY:   "READY"
};

export const ALERT_SEVERITY_STYLES = {
  URGENT:  { bg: "bg-red-50 border-red-200", text: "text-red-800", badge: "bg-red-600 text-white", icon: "🔴" },
  WARNING: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", badge: "bg-amber-500 text-white", icon: "🟡" },
  INFO:    { bg: "bg-blue-50 border-blue-200", text: "text-blue-800", badge: "bg-blue-500 text-white", icon: "🔵" },
  READY:   { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", badge: "bg-emerald-600 text-white", icon: "🟢" }
};

// ─────────────────────────────────────────────
// ALERT GENERATOR
// ─────────────────────────────────────────────

/**
 * Generates all operational alerts from the bookings dataset.
 * @param {Array} bookings — all booking records
 * @returns {Array} sorted alerts (URGENT first)
 */
export function generateOperationsAlerts(bookings = []) {
  const alerts = [];
  const now = Date.now();

  for (const booking of bookings) {
    const tripStart = booking.trip?.startDate ? new Date(booking.trip.startDate).getTime() : null;
    const daysUntilTrip = tripStart ? Math.ceil((tripStart - now) / 86400000) : null;
    const isActive = !["COMPLETED", "CANCELLED", "DECLINED"].includes(booking.status);

    if (!isActive) continue;

    // URGENT: Trip starts within 48 hours
    if (daysUntilTrip !== null && daysUntilTrip <= 2 && daysUntilTrip >= 0) {
      alerts.push({
        id: `alert-urgent-trip-${booking.id}`,
        severity: ALERT_SEVERITY.URGENT,
        title: "Trip Starts Very Soon",
        message: `${booking.customer?.name || "Traveler"}'s trip (${booking.requestId}) starts in ${daysUntilTrip === 0 ? "today" : daysUntilTrip + " day(s)"}. Verify all operational details.`,
        bookingId: booking.id,
        requestId: booking.requestId
      });
    }

    // URGENT: Permit required but not resolved
    if (booking.requiresPermit) {
      const unresolvedPermits = (booking.permits || []).filter(
        p => ["REQUIRED", "DOCUMENTS_PENDING", "APPLICATION_PENDING"].includes(p.status)
      );
      if (unresolvedPermits.length > 0 && daysUntilTrip !== null && daysUntilTrip <= 14) {
        alerts.push({
          id: `alert-permit-${booking.id}`,
          severity: daysUntilTrip <= 5 ? ALERT_SEVERITY.URGENT : ALERT_SEVERITY.WARNING,
          title: "Permit Unresolved",
          message: `${unresolvedPermits.length} permit(s) unresolved for ${booking.requestId}. Trip in ${daysUntilTrip} day(s).`,
          bookingId: booking.id,
          requestId: booking.requestId
        });
      }
    }

    // WARNING: Accommodation not verified for upcoming trips
    if (booking.accommodation?.verificationStatus === "NOT_CHECKED" && daysUntilTrip !== null && daysUntilTrip <= 7) {
      alerts.push({
        id: `alert-accom-${booking.id}`,
        severity: ALERT_SEVERITY.WARNING,
        title: "Accommodation Not Verified",
        message: `Accommodation not verified for ${booking.requestId} (${daysUntilTrip} day(s) until trip).`,
        bookingId: booking.id,
        requestId: booking.requestId
      });
    }

    // WARNING: Vehicle not verified for upcoming trips
    if (booking.transportation?.verificationStatus === "NOT_CHECKED" && daysUntilTrip !== null && daysUntilTrip <= 7) {
      alerts.push({
        id: `alert-transport-${booking.id}`,
        severity: ALERT_SEVERITY.WARNING,
        title: "Transportation Not Verified",
        message: `Vehicle/transport not verified for ${booking.requestId} (${daysUntilTrip} day(s) until trip).`,
        bookingId: booking.id,
        requestId: booking.requestId
      });
    }

    // WARNING: Not assigned
    if (!booking.assignedTo && booking.status === "RECEIVED") {
      alerts.push({
        id: `alert-unassigned-${booking.id}`,
        severity: ALERT_SEVERITY.WARNING,
        title: "Unassigned Request",
        message: `Booking ${booking.requestId} has not been assigned to an operator.`,
        bookingId: booking.id,
        requestId: booking.requestId
      });
    }

    // WARNING: Stale realtime data
    if (booking.realtimeSnapshot?.riskLevel === "HIGH" || booking.realtimeSnapshot?.alerts?.length > 0) {
      alerts.push({
        id: `alert-realtime-${booking.id}`,
        severity: ALERT_SEVERITY.WARNING,
        title: "Travel Advisory Active",
        message: `Realtime advisory detected for ${booking.requestId}. Review before proceeding.`,
        bookingId: booking.id,
        requestId: booking.requestId
      });
    }

    // READY: All conditions met
    const allReady =
      booking.accommodation?.verificationStatus === "CONFIRMED" &&
      booking.transportation?.verificationStatus === "CONFIRMED" &&
      (!booking.requiresPermit || booking.permits?.every(p => p.status === "APPROVED")) &&
      booking.customerApproval?.accepted === true &&
      booking.status === "READY_TO_CONFIRM";

    if (allReady) {
      alerts.push({
        id: `alert-ready-${booking.id}`,
        severity: ALERT_SEVERITY.READY,
        title: "Ready to Confirm",
        message: `All operational checks complete for ${booking.requestId}. Journey is ready to confirm.`,
        bookingId: booking.id,
        requestId: booking.requestId
      });
    }
  }

  // Sort: URGENT first, then WARNING, INFO, READY
  const severityOrder = ["URGENT", "WARNING", "INFO", "READY"];
  return alerts.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));
}

/**
 * Generates dashboard KPI stats from bookings.
 * Never fabricates — only counts real records.
 */
export function generateDashboardStats(bookings = []) {
  const now = Date.now();
  const today = new Date().toISOString().split("T")[0];

  const active = bookings.filter(b => !["COMPLETED", "CANCELLED", "DECLINED"].includes(b.status));

  const newRequests = bookings.filter(b => b.status === "RECEIVED").length;
  const underReview = bookings.filter(b => ["UNDER_REVIEW", "AVAILABILITY_CHECK"].includes(b.status)).length;
  const awaitingCustomer = bookings.filter(b => ["PROPOSAL_SENT", "AWAITING_CUSTOMER"].includes(b.status)).length;

  const upcomingThisWeek = active.filter(b => {
    if (!b.trip?.startDate) return false;
    const start = new Date(b.trip.startDate).getTime();
    const diff = Math.ceil((start - now) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;

  const urgentAlerts = generateOperationsAlerts(bookings).filter(a => a.severity === "URGENT").length;

  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
  const total = bookings.length;

  return {
    newRequests,
    underReview,
    awaitingCustomer,
    upcomingThisWeek,
    urgentAlerts,
    confirmed,
    total,
    hasData: total > 0
  };
}

/**
 * Returns upcoming trips in the next N days.
 */
export function getUpcomingTrips(bookings, days = 30) {
  const now = Date.now();
  return bookings
    .filter(b => {
      if (!b.trip?.startDate) return false;
      if (["CANCELLED", "DECLINED"].includes(b.status)) return false;
      const start = new Date(b.trip.startDate).getTime();
      const diff = Math.ceil((start - now) / 86400000);
      return diff >= 0 && diff <= days;
    })
    .sort((a, b) => new Date(a.trip.startDate) - new Date(b.trip.startDate));
}
