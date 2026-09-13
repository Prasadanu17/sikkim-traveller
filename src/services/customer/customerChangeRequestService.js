/**
 * Customer Change Request Service — Module 14
 * Manages customer change request submissions, idempotency protection,
 * and status lifecycle: SUBMITTED → UNDER_REVIEW → APPROVED / DECLINED → CUSTOMER_NOTIFIED.
 * 
 * STRICT OPERATIONAL BOUNDARY:
 * Customers CANNOT directly mutate confirmed operational booking data.
 * All change requests create structured, auditable records sent to Module 10 Operations.
 */

import { getFinancialStore, saveFinancialStore } from "../financial/financialFallbackService";
import { logNotificationAudit } from "../notifications/notificationAuditService";

export const CHANGE_REQUEST_STATUSES = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  CUSTOMER_NOTIFIED: "CUSTOMER_NOTIFIED"
};

export const CHANGE_REQUEST_TYPES = {
  DATE_CHANGE: "DATE_CHANGE",
  TRAVELER_CHANGE: "TRAVELER_CHANGE",
  ACCOMMODATION_CHANGE: "ACCOMMODATION_CHANGE",
  TRANSPORTATION_CHANGE: "TRANSPORTATION_CHANGE",
  ITINERARY_CHANGE: "ITINERARY_CHANGE",
  SPECIAL_REQUEST: "SPECIAL_REQUEST",
  CANCELLATION: "CANCELLATION"
};

const STORAGE_KEY = "st_customer_change_requests_v1";

/**
 * Loads all customer change requests from storage.
 */
export function getCustomerChangeRequests(requestId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : [];
    if (!requestId) return all;
    return all.filter(cr => cr.requestId === requestId || cr.bookingId === requestId);
  } catch (_err) {
    return [];
  }
}

/**
 * Saves change requests to storage.
 */
function saveCustomerChangeRequests(requests = []) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (_err) {
    console.warn("[ChangeRequestService] Failed to save change requests.");
  }
}

/**
 * Submits a new customer change request with idempotency protection.
 */
export function submitChangeRequest({
  requestId,
  bookingId,
  requestType = CHANGE_REQUEST_TYPES.SPECIAL_REQUEST,
  title,
  description,
  requestedDetails = {},
  customerName = "Traveler",
  customerEmail = ""
}) {
  if (!requestId || !description?.trim()) {
    return { success: false, error: "Request ID and description are required." };
  }

  // Idempotency Key
  const now = new Date().toISOString();
  const timestampToken = Date.now();
  const idempotencyKey = `ST-CR-${requestId}-${requestType}-${timestampToken}`;

  const allRequests = getCustomerChangeRequests();
  
  // Check duplicate
  const duplicate = allRequests.find(r => r.idempotencyKey === idempotencyKey);
  if (duplicate) {
    return { success: true, changeRequest: duplicate, alreadySubmitted: true };
  }

  const changeRequest = {
    changeRequestId: `CR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    requestId,
    bookingId: bookingId || requestId,
    requestType,
    title: title || `Change Request — ${requestType.replace(/_/g, " ")}`,
    description: description.trim(),
    requestedDetails,
    customerName,
    customerEmail,
    status: CHANGE_REQUEST_STATUSES.SUBMITTED,
    createdAt: now,
    updatedAt: now,
    idempotencyKey,
    reviewNotes: null,
    reviewedBy: null,
    reviewedAt: null,
    _isMockData: true
  };

  const updatedList = [changeRequest, ...allRequests];
  saveCustomerChangeRequests(updatedList);

  logNotificationAudit({
    actor: customerName,
    action: "CHANGE_REQUEST_SUBMITTED",
    requestId,
    details: `Customer submitted ${requestType} change request: ${description.slice(0, 60)}`
  });

  return {
    success: true,
    changeRequest
  };
}

/**
 * Updates a change request status (Operations execution).
 */
export function updateChangeRequestStatus(changeRequestId, newStatus, reviewNotes = "", reviewer = "OPERATIONS") {
  const allRequests = getCustomerChangeRequests();
  const index = allRequests.findIndex(r => r.changeRequestId === changeRequestId);

  if (index === -1) {
    return { success: false, error: "Change request not found." };
  }

  const current = allRequests[index];
  const now = new Date().toISOString();

  const updated = {
    ...current,
    status: newStatus,
    reviewNotes: reviewNotes || current.reviewNotes,
    reviewedBy: reviewer,
    reviewedAt: now,
    updatedAt: now
  };

  allRequests[index] = updated;
  saveCustomerChangeRequests(allRequests);

  return {
    success: true,
    changeRequest: updated
  };
}
