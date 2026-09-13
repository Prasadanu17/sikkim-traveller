/**
 * Customer Portal Message Service — Module 11
 * Handles communication chat logs exchange between travelers and travel operations.
 * Implements input sanitization to block XSS and optimistic UI states.
 */

import { canAccessBooking, getCustomerSession } from "./customerPortalAuthService";
import { sanitizeInputText } from "./customerPortalBookingService";

// ─────────────────────────────────────────────
// FETCH CHAT MESSAGES
// ─────────────────────────────────────────────

/**
 * Fetches all communication messages for a booking request.
 */
export async function getBookingMessages(bookingId) {
  if (!canAccessBooking(bookingId)) {
    throw new Error("Access Denied: Session unauthorized.");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    const { getBookingById } = await import("../operations/operationsBookingService");
    const record = getBookingById(bookingId);
    if (!record) throw new Error("Booking not found.");

    // Filter customer visible notes and map to customer-safe message structure
    return (record.notes?.customerVisible || []).map(n => ({
      id: n.id,
      text: n.text,
      sender: n.addedByRole === "CUSTOMER" ? "customer" : "operations",
      senderName: n.addedByName || "Operations Team",
      timestamp: n.addedAt
    }));
  }

  // Production API boundary
  const session = getCustomerSession();
  const response = await fetch(`/api/customer/bookings/${bookingId}/messages`, {
    headers: { "Authorization": `Bearer ${session?.token}` }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch messages.");
  }

  return response.json();
}

// ─────────────────────────────────────────────
// SEND MESSAGE
// ─────────────────────────────────────────────

/**
 * Sends a message from the customer.
 */
export async function sendPortalMessage(bookingId, messageText) {
  if (!canAccessBooking(bookingId)) {
    throw new Error("Access Denied: Session unauthorized.");
  }

  const cleanText = sanitizeInputText(messageText);
  if (!cleanText.trim()) {
    throw new Error("Message text cannot be empty.");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    // Simulate short latency
    await new Promise(resolve => setTimeout(resolve, 600));

    const { getBookingById } = await import("../operations/operationsBookingService");
    const record = getBookingById(bookingId);
    if (!record) throw new Error("Booking not found.");

    const newMessage = {
      id: `CNOTE-${Date.now()}`,
      text: cleanText,
      addedBy: "customer",
      addedByName: record.customer?.name || "Customer",
      addedByRole: "CUSTOMER",
      addedAt: new Date().toISOString(),
      isInternal: false
    };

    // Add activity event for timeline logging
    const { recordEvent, AUDIT_ACTIONS } = await import("../operations/operationsAuditService");
    const updatedRecord = recordEvent(
      {
        ...record,
        notes: {
          ...record.notes,
          customerVisible: [...(record.notes?.customerVisible || []), newMessage]
        }
      },
      {
        actorId: "customer",
        actorRole: "CUSTOMER",
        actorName: record.customer?.name || "Customer",
        action: AUDIT_ACTIONS.CUSTOMER_SENT_MESSAGE,
        previousValue: null,
        newValue: null,
        activityMessage: `Customer sent message: "${cleanText.slice(0, 30)}..."`
      }
    );

    // Save mock updates
    const { saveMockBookings, loadMockBookings } = await import("../operations/operationsFallbackService");
    const all = loadMockBookings();
    const idx = all.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      all[idx] = updatedRecord;
      saveMockBookings(all);
    }

    return {
      success: true,
      message: {
        id: newMessage.id,
        text: newMessage.text,
        sender: "customer",
        senderName: newMessage.addedByName,
        timestamp: newMessage.addedAt
      }
    };
  }

  // Production API boundary
  const session = getCustomerSession();
  const response = await fetch(`/api/customer/bookings/${bookingId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.token}`
    },
    body: JSON.stringify({ message: cleanText })
  });

  if (!response.ok) {
    throw new Error("Message could not be sent.");
  }

  return response.json();
}
