/**
 * Operations Audit Service — Module 10
 * Manages append-only audit logs per booking request.
 * Audit events are never deleted — only appended.
 */

import { buildAuditEvent, buildActivityEvent } from "./operationsContextService";

// ─────────────────────────────────────────────
// AUDIT EVENT TYPES
// ─────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  RECORD_CREATED:       "RECORD_CREATED",
  STATUS_CHANGED:       "STATUS_CHANGED",
  ASSIGNED:             "ASSIGNED",
  QUOTE_ADDED:          "QUOTE_ADDED",
  QUOTE_STATUS_CHANGED: "QUOTE_STATUS_CHANGED",
  PROPOSAL_CREATED:     "PROPOSAL_CREATED",
  PROPOSAL_SENT:        "PROPOSAL_SENT",
  CUSTOMER_ACCEPTED:    "CUSTOMER_ACCEPTED",
  CUSTOMER_DECLINED:    "CUSTOMER_DECLINED",
  CUSTOMER_APPROVAL_INVALIDATED: "CUSTOMER_APPROVAL_INVALIDATED",
  NOTE_ADDED:           "NOTE_ADDED",
  PERMIT_UPDATED:       "PERMIT_UPDATED",
  ACCOMMODATION_UPDATED:"ACCOMMODATION_UPDATED",
  TRANSPORT_UPDATED:    "TRANSPORT_UPDATED",
  ITINERARY_REVISED:    "ITINERARY_REVISED",
  CONFIRMED:            "CONFIRMED",
  CANCELLED:            "CANCELLED",
  DECLINED:             "DECLINED",
  COMPLETED:            "COMPLETED",
  REALTIME_REFRESHED:   "REALTIME_REFRESHED"
};

// ─────────────────────────────────────────────
// AUDIT APPEND
// ─────────────────────────────────────────────

/**
 * Appends a new audit event to a booking record. Returns the updated record.
 */
export function appendAuditEvent(bookingRecord, actorId, actorRole, action, previousValue, newValue) {
  const event = buildAuditEvent(
    bookingRecord.requestId,
    actorId,
    actorRole,
    action,
    previousValue,
    newValue
  );

  return {
    ...bookingRecord,
    auditLog: [...(bookingRecord.auditLog || []), event]
  };
}

/**
 * Appends a new activity timeline event to a booking record.
 */
export function appendActivityEvent(bookingRecord, type, actorId, actorName, message) {
  const event = buildActivityEvent(type, actorId, actorName, message);

  return {
    ...bookingRecord,
    activityLog: [...(bookingRecord.activityLog || []), event]
  };
}

/**
 * Records both an audit and activity event atomically on a record.
 */
export function recordEvent(bookingRecord, { actorId, actorRole, actorName, action, previousValue, newValue, activityMessage }) {
  let updated = bookingRecord;

  updated = appendAuditEvent(updated, actorId, actorRole, action, previousValue, newValue);
  updated = appendActivityEvent(updated, action, actorId, actorName || actorId, activityMessage || `${action} by ${actorName || actorId}`);

  return updated;
}

// ─────────────────────────────────────────────
// AUDIT FORMATTERS
// ─────────────────────────────────────────────

export function formatAuditAction(action) {
  const labels = {
    RECORD_CREATED: "Record Created",
    STATUS_CHANGED: "Status Changed",
    ASSIGNED: "Staff Assigned",
    QUOTE_ADDED: "Quote Added",
    QUOTE_STATUS_CHANGED: "Quote Status Updated",
    PROPOSAL_CREATED: "Proposal Created",
    PROPOSAL_SENT: "Proposal Sent to Customer",
    CUSTOMER_ACCEPTED: "Customer Accepted Proposal",
    CUSTOMER_DECLINED: "Customer Declined Proposal",
    CUSTOMER_APPROVAL_INVALIDATED: "Customer Approval Invalidated",
    NOTE_ADDED: "Note Added",
    PERMIT_UPDATED: "Permit Record Updated",
    ACCOMMODATION_UPDATED: "Accommodation Updated",
    TRANSPORT_UPDATED: "Transportation Updated",
    ITINERARY_REVISED: "Itinerary Revision Added",
    CONFIRMED: "Journey Confirmed",
    CANCELLED: "Booking Cancelled",
    DECLINED: "Booking Declined",
    COMPLETED: "Trip Completed",
    REALTIME_REFRESHED: "Realtime Intelligence Refreshed"
  };
  return labels[action] || action;
}
