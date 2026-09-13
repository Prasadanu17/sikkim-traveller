/**
 * Customer Booking Service — Module 11
 * Handles customer-initiated actions on bookings: retrieval, submitting change requests,
 * and refreshing status.
 * All mutations are sanitized and do NOT directly modify operational status without Ops review.
 */

import { verifyTrackingAccess } from "./customerAccessService";
import { sanitizeChangeRequest, sanitizeText } from "./customerPortalSanitizationService";
import { getMockBookingByToken, updateMockBooking } from "./customerPortalFallbackService";
import { buildCustomerSafeModel } from "./customerPortalContextService";

/**
 * Retrieves the normalized customer-safe booking model.
 * @param {string} trackingToken
 */
export async function getCustomerBooking(trackingToken) {
  return verifyTrackingAccess(trackingToken);
}

/**
 * Submits a customer change request.
 * Creates visible status: "CHANGE REQUEST RECEIVED" and alerts operations desk.
 * Does NOT directly mutate operational pricing/itinerary without operator review.
 * @param {string} trackingToken
 * @param {object} rawChangePayload - { category, description }
 */
export async function submitChangeRequest(trackingToken, rawChangePayload) {
  const cleanToken = sanitizeText(trackingToken);
  const { isValid, sanitized, error } = sanitizeChangeRequest(rawChangePayload);

  if (!isValid) {
    throw new Error(error || "Invalid change request data.");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const record = getMockBookingByToken(cleanToken);
    if (!record) {
      throw new Error(`Booking record "${cleanToken}" not found.`);
    }

    const newRequestEntry = {
      id: `CR-${Date.now().toString().slice(-4)}`,
      category: sanitized.category,
      description: sanitized.description,
      status: "UNDER_REVIEW",
      requestedAt: sanitized.requestedAt
    };

    // Add customer message notifying about change request
    const customerMsg = {
      id: `MSG-${Date.now()}`,
      sender: "customer",
      senderName: record.customer?.firstName || "You",
      text: `[Change Request: ${sanitized.category}] ${sanitized.description}`,
      timestamp: sanitized.requestedAt
    };

    // Auto-ack message from operations
    const opsAckMsg = {
      id: `MSG-${Date.now() + 1}`,
      sender: "operations",
      senderName: "Operations Desk",
      text: `We have received your change request regarding ${sanitized.category.toLowerCase().replace(/_/g, " ")}. Our destination specialist is reviewing the adjustments and will update your proposal shortly.`,
      timestamp: new Date(Date.now() + 1000).toISOString()
    };

    const updated = {
      ...record,
      hasPendingChangeRequest: true,
      lastChangeRequest: newRequestEntry,
      customerMessages: [...(record.customerMessages || []), customerMsg, opsAckMsg],
      updatedAt: new Date().toISOString()
    };

    const saved = updateMockBooking(updated);
    return {
      success: true,
      message: "Change request submitted successfully. Our operations desk is reviewing your adjustments.",
      booking: buildCustomerSafeModel(saved)
    };
  }

  // Production API boundary
  const response = await fetch(`/api/customer/booking/${encodeURIComponent(cleanToken)}/change-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(sanitized)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to submit change request to server.");
  }

  const result = await response.json();
  return {
    success: true,
    message: result.message || "Change request submitted successfully.",
    booking: buildCustomerSafeModel(result.booking)
  };
}
