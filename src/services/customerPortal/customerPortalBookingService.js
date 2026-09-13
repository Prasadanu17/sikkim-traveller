/**
 * Customer Portal Booking Service — Module 11
 * Handles booking-specific customer actions: accepting proposals and change requests.
 * Enforces ownership check against current session.
 */

import { canAccessBooking, getCustomerSession } from "./customerPortalAuthService";
import { buildCustomerPortalContext } from "./customerPortalContextService";

// ─────────────────────────────────────────────
// FETCH OPERATIONS
// ─────────────────────────────────────────────

/**
 * Retrieves the normalized booking data safe for client rendering.
 * @param {string} bookingId
 */
export async function getAuthorizedBooking(bookingId) {
  // 1. Session check to protect against IDOR leakage
  if (!canAccessBooking(bookingId)) {
    throw new Error("Access Denied: Session unauthorized or expired.");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    const { getBookingById } = await import("../operations/operationsBookingService");
    const record = getBookingById(bookingId);
    if (!record) {
      throw new Error(`Booking request "${bookingId}" could not be found.`);
    }

    // Return client-safe mapped model
    return buildCustomerPortalContext(record);
  }

  // Production API boundary
  const session = getCustomerSession();
  const response = await fetch(`/api/customer/bookings/${bookingId}`, {
    headers: { "Authorization": `Bearer ${session?.token}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to load booking. Server status ${response.status}`);
  }

  const data = await response.json();
  return buildCustomerPortalContext(data);
}

// ─────────────────────────────────────────────
// MUTATION OPERATIONS (Proposal Accept / Change Request)
// ─────────────────────────────────────────────

/**
 * Submits customer acceptance of proposal.
 */
export async function acceptProposal(bookingId, customerName) {
  if (!canAccessBooking(bookingId)) {
    throw new Error("Access Denied: Unauthorized request.");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    const { getBookingById } = await import("../operations/operationsBookingService");
    const record = getBookingById(bookingId);
    if (!record) throw new Error("Booking not found.");

    // Execute proposal acceptance in operations context
    const { recordCustomerAcceptance } = await import("../operations/operationsProposalService");
    const updatedRecord = recordCustomerAcceptance(record, customerName, "customer", "CUSTOMER");

    // Persist mock database state
    const { saveMockBookings, loadMockBookings } = await import("../operations/operationsFallbackService");
    const all = loadMockBookings();
    const idx = all.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      all[idx] = updatedRecord;
      saveMockBookings(all);
    }

    return { success: true, message: "MOCK CUSTOMER APPROVAL recorded." };
  }

  // Production API boundary
  const session = getCustomerSession();
  const response = await fetch(`/api/customer/bookings/${bookingId}/proposal/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.token}`
    },
    body: JSON.stringify({ customerName })
  });

  if (!response.ok) {
    throw new Error("Failed to submit proposal acceptance.");
  }

  return response.json();
}

/**
 * Customer submits change request.
 */
export async function requestChanges(bookingId, category, reasonText) {
  if (!canAccessBooking(bookingId)) {
    throw new Error("Access Denied: Unauthorized request.");
  }

  // Input Sanitization (XSS and HTML protection)
  const cleanReason = sanitizeInputText(reasonText);
  if (!cleanReason.trim()) {
    throw new Error("Change request reason cannot be empty.");
  }

  if (cleanReason.length > 1000) {
    throw new Error("Reason exceeds limit of 1000 characters.");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    const { getBookingById } = await import("../operations/operationsBookingService");
    const record = getBookingById(bookingId);
    if (!record) throw new Error("Booking not found.");

    // In mock mode, update status and append customer-visible change request note
    const { recordEvent, AUDIT_ACTIONS } = await import("../operations/operationsAuditService");

    const noteText = `[CHANGE REQUESTED: ${category.toUpperCase()}] ${cleanReason}`;
    const customerNote = {
      id: `CNOTE-${Date.now()}`,
      text: noteText,
      addedBy: "customer",
      addedByName: record.customer?.name || "Customer",
      addedByRole: "CUSTOMER",
      addedAt: new Date().toISOString(),
      isInternal: false
    };

    let updated = {
      ...record,
      status: "UNDER_REVIEW", // Set status back to review for operations team
      notes: {
        ...record.notes,
        customerVisible: [...(record.notes?.customerVisible || []), customerNote]
      }
    };

    updated = recordEvent(updated, {
      actorId: "customer",
      actorRole: "CUSTOMER",
      actorName: record.customer?.name || "Customer",
      action: AUDIT_ACTIONS.CUSTOMER_REQUESTED_CHANGE,
      previousValue: record.status,
      newValue: "UNDER_REVIEW",
      activityMessage: `Customer requested changes on ${category}: "${cleanReason}"`
    });

    const { saveMockBookings, loadMockBookings } = await import("../operations/operationsFallbackService");
    const all = loadMockBookings();
    const idx = all.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      all[idx] = updated;
      saveMockBookings(all);
    }

    return { success: true, message: "Change request submitted successfully." };
  }

  // Production API boundary
  const session = getCustomerSession();
  const response = await fetch(`/api/customer/bookings/${bookingId}/change-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.token}`
    },
    body: JSON.stringify({ category, reason: cleanReason })
  });

  if (!response.ok) {
    throw new Error("Failed to submit change request.");
  }

  return response.json();
}

// ─────────────────────────────────────────────
// XSS PROTECTION HELPERS
// ─────────────────────────────────────────────

export function sanitizeInputText(str) {
  if (!str) return "";
  // Strip tags and escape XML/HTML special characters
  return str
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}
