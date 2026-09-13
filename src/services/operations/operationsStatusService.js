/**
 * Operations Status Service — Module 10
 * Defines valid booking status transitions and enforces the pipeline sequence.
 * Invalid transitions are blocked on frontend; backend MUST re-verify.
 */

import { BOOKING_STATUSES } from "./operationsContextService";

// ─────────────────────────────────────────────
// VALID TRANSITION MAP
// ─────────────────────────────────────────────

const VALID_TRANSITIONS = {
  RECEIVED:             ["UNDER_REVIEW", "CANCELLED", "DECLINED"],
  UNDER_REVIEW:         ["AVAILABILITY_CHECK", "RECEIVED", "CANCELLED", "DECLINED"],
  AVAILABILITY_CHECK:   ["PRICE_PENDING", "UNDER_REVIEW", "CANCELLED", "DECLINED"],
  PRICE_PENDING:        ["PROPOSAL_SENT", "AVAILABILITY_CHECK", "CANCELLED", "DECLINED"],
  PROPOSAL_SENT:        ["AWAITING_CUSTOMER", "PRICE_PENDING", "CANCELLED", "DECLINED"],
  AWAITING_CUSTOMER:    ["CUSTOMER_ACCEPTED", "PROPOSAL_SENT", "CANCELLED", "DECLINED"],
  CUSTOMER_ACCEPTED:    ["READY_TO_CONFIRM", "AWAITING_CUSTOMER", "CANCELLED"],
  READY_TO_CONFIRM:     ["CONFIRMED", "CUSTOMER_ACCEPTED", "CANCELLED"],
  CONFIRMED:            ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS:          ["COMPLETED", "CANCELLED"],
  COMPLETED:            [], // Terminal state
  CANCELLED:            [], // Terminal state
  DECLINED:             []  // Terminal state
};

// ─────────────────────────────────────────────
// STATUS METADATA
// ─────────────────────────────────────────────

export const STATUS_META = {
  RECEIVED:           { label: "Received",            color: "blue",    icon: "inbox" },
  UNDER_REVIEW:       { label: "Under Review",         color: "indigo",  icon: "search" },
  AVAILABILITY_CHECK: { label: "Availability Check",   color: "violet",  icon: "check-square" },
  PRICE_PENDING:      { label: "Price Pending",         color: "amber",   icon: "dollar-sign" },
  PROPOSAL_SENT:      { label: "Proposal Sent",         color: "cyan",    icon: "send" },
  AWAITING_CUSTOMER:  { label: "Awaiting Customer",     color: "orange",  icon: "clock" },
  CUSTOMER_ACCEPTED:  { label: "Customer Accepted",     color: "lime",    icon: "thumbs-up" },
  READY_TO_CONFIRM:   { label: "Ready to Confirm",      color: "emerald", icon: "check-circle" },
  CONFIRMED:          { label: "Confirmed",             color: "green",   icon: "star" },
  IN_PROGRESS:        { label: "In Progress",           color: "teal",    icon: "map-pin" },
  COMPLETED:          { label: "Completed",             color: "gray",    icon: "flag" },
  CANCELLED:          { label: "Cancelled",             color: "rose",    icon: "x-circle" },
  DECLINED:           { label: "Declined",              color: "red",     icon: "slash" }
};

export const STATUS_TAILWIND = {
  RECEIVED:           "bg-blue-100 text-blue-800 border-blue-200",
  UNDER_REVIEW:       "bg-indigo-100 text-indigo-800 border-indigo-200",
  AVAILABILITY_CHECK: "bg-violet-100 text-violet-800 border-violet-200",
  PRICE_PENDING:      "bg-amber-100 text-amber-800 border-amber-200",
  PROPOSAL_SENT:      "bg-cyan-100 text-cyan-800 border-cyan-200",
  AWAITING_CUSTOMER:  "bg-orange-100 text-orange-800 border-orange-200",
  CUSTOMER_ACCEPTED:  "bg-lime-100 text-lime-800 border-lime-200",
  READY_TO_CONFIRM:   "bg-emerald-100 text-emerald-800 border-emerald-200",
  CONFIRMED:          "bg-green-100 text-green-800 border-green-200",
  IN_PROGRESS:        "bg-teal-100 text-teal-800 border-teal-200",
  COMPLETED:          "bg-gray-100 text-gray-700 border-gray-200",
  CANCELLED:          "bg-rose-100 text-rose-800 border-rose-200",
  DECLINED:           "bg-red-100 text-red-800 border-red-200"
};

export const PRIORITY_META = {
  LOW:    { label: "Low",    color: "bg-gray-100 text-gray-600" },
  NORMAL: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  HIGH:   { label: "High",   color: "bg-amber-100 text-amber-800" },
  URGENT: { label: "Urgent", color: "bg-red-100 text-red-800" }
};

// ─────────────────────────────────────────────
// TRANSITION ENGINE
// ─────────────────────────────────────────────

/**
 * Checks if transitioning from currentStatus to nextStatus is valid.
 */
export function isValidTransition(currentStatus, nextStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

/**
 * Returns all valid next statuses from the current status.
 */
export function getValidNextStatuses(currentStatus) {
  return VALID_TRANSITIONS[currentStatus] || [];
}

/**
 * Returns the pipeline sequence (excluding cancel/decline terminal states).
 */
export function getPipelineSteps() {
  return [
    "RECEIVED",
    "UNDER_REVIEW",
    "AVAILABILITY_CHECK",
    "PRICE_PENDING",
    "PROPOSAL_SENT",
    "AWAITING_CUSTOMER",
    "CUSTOMER_ACCEPTED",
    "READY_TO_CONFIRM",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED"
  ];
}

/**
 * Returns the pipeline step index (0-based) for progress display.
 */
export function getPipelineIndex(status) {
  return getPipelineSteps().indexOf(status);
}

/**
 * Returns true if a status is terminal (no further transitions).
 */
export function isTerminalStatus(status) {
  return (VALID_TRANSITIONS[status] || []).length === 0;
}

/**
 * Returns true if a status is a cancellation/decline state.
 */
export function isCancelledOrDeclined(status) {
  return status === "CANCELLED" || status === "DECLINED";
}

/**
 * Returns whether all operations checks pass for confirmation readiness.
 */
export function checkConfirmationGate(bookingRecord) {
  const checks = {
    accommodationVerified: bookingRecord.accommodation?.verificationStatus === "CONFIRMED",
    transportVerified: bookingRecord.transportation?.verificationStatus === "CONFIRMED",
    permitsChecked: !bookingRecord.requiresPermit || bookingRecord.permits?.every(
      p => p.status !== "REQUIRED" && p.status !== "DOCUMENTS_PENDING"
    ),
    itineraryReviewed: (bookingRecord.itineraryVersions?.length || 0) > 0,
    priceApproved: bookingRecord.quotes?.some(q =>
      q.status === "CUSTOMER_ACCEPTED" || q.status === "INTERNAL_REVIEW"
    ),
    customerAccepted: bookingRecord.customerApproval?.accepted === true,
    proposalSent: bookingRecord.proposals?.some(p =>
      p.status === "SENT" || p.status === "CUSTOMER_ACCEPTED"
    )
  };

  const allPassed = Object.values(checks).every(Boolean);
  return { checks, allPassed };
}

export { BOOKING_STATUSES };
