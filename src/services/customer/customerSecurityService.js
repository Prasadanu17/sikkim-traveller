/**
 * Customer Security Service — Module 14 & 16
 * Enforces passwordless token validation, IDOR protection, session scoping,
 * PII masking, anti-tamper guards, and document authorization checks.
 */

import { sanitizeText } from "./customerPortalSanitizationService";

const SESSION_STORAGE_KEY = "st_active_journey_session_v1";

/**
 * Generates a deterministic secure access token for a booking request.
 * e.g. ST-REQ-20260823-1042 -> ST-REQ-20260823-1042-TK89F2A1
 */
export function generateCustomerJourneyToken(requestId) {
  if (!requestId) return null;
  const cleanId = String(requestId).trim().toUpperCase();

  // Simple deterministic hash for development/mock mode stability
  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    hash = (hash << 5) - hash + cleanId.charCodeAt(i);
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, "89F2A1");

  return `${cleanId}-TK${hexHash.slice(0, 6)}`;
}

/**
 * Validates access token against booking data.
 * Request ID alone WITHOUT secret token suffix is strictly REJECTED.
 */
export function validateJourneyAccessToken(inputToken, requestedBooking) {
  if (!inputToken || !requestedBooking) {
    return { authorized: false, error: "Journey access could not be verified." };
  }

  const cleanInput = sanitizeText(inputToken).trim().toUpperCase();
  const validToken = requestedBooking.accessToken || generateCustomerJourneyToken(requestedBooking.requestId || requestedBooking.id);
  const cleanValidToken = String(validToken).trim().toUpperCase();

  // REJECT plain request ID alone
  const plainReqId = String(requestedBooking.requestId || requestedBooking.id || "").trim().toUpperCase();
  if (cleanInput === plainReqId) {
    return {
      authorized: false,
      error: "Journey access could not be verified. A full secure Journey Token is required."
    };
  }

  if (cleanInput === cleanValidToken) {
    return {
      authorized: true,
      requestId: plainReqId,
      booking: requestedBooking
    };
  }

  return {
    authorized: false,
    error: "Journey access could not be verified."
  };
}

/**
 * Retrieves current active journey session from sessionStorage.
 */
export function getActiveJourneySession() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
}

/**
 * Saves authenticated journey session to sessionStorage.
 */
export function saveActiveJourneySession(token, requestId, customerName) {
  try {
    const sessionData = {
      token,
      requestId,
      customerName: customerName || "Traveler",
      authenticatedAt: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    return sessionData;
  } catch (_err) {
    console.warn("[CustomerSecurity] Failed to save session to sessionStorage.");
    return null;
  }
}

/**
 * Clears active journey session from sessionStorage.
 */
export function clearActiveJourneySession() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (_err) {
    console.warn("[CustomerSecurity] Failed to clear sessionStorage.");
  }
}

/**
 * Validates tracking token and session ownership to prevent IDOR access.
 */
export function validateCustomerSessionOwnership(sessionToken, requestedBooking) {
  if (!sessionToken || !requestedBooking) {
    return { authorized: false, reason: "Invalid or missing tracking token session." };
  }

  const result = validateJourneyAccessToken(sessionToken, requestedBooking);
  if (result.authorized) {
    return { authorized: true, reason: "Session authorized" };
  }

  return {
    authorized: false,
    reason: result.error || "Unauthorized access: You do not have permission to access this booking record."
  };
}

/**
 * Masks sensitive Customer PII for security display.
 */
export function maskCustomerPII(customer = {}) {
  const email = customer.email || "";
  const phone = customer.phone || "";

  const maskedEmail = email.replace(/(^.{2})(.*)(?=@)/, (_, g1, g2) => g1 + "*".repeat(Math.max(3, g2.length)));
  const maskedPhone = phone.length > 5 ? phone.slice(0, 3) + "****" + phone.slice(-3) : phone;

  return {
    ...customer,
    name: customer.name || customer.fullName || "Valued Guest",
    email: maskedEmail,
    phone: maskedPhone
  };
}

/**
 * Validates document authorization before exposing download links.
 */
export function isDocumentAuthorizedForCustomer(documentType, bookingStatus) {
  const RESTRICTED_DOCS = {
    "CONFIRMATION_VOUCHER": ["CONFIRMED"],
    "PERMIT_PASS": ["CONFIRMED", "READY_TO_CONFIRM"],
    "FINAL_RECEIPT": ["CONFIRMED", "PROPOSAL_SENT"]
  };

  const allowedStatuses = RESTRICTED_DOCS[documentType];
  if (!allowedStatuses) return true;

  return allowedStatuses.includes(bookingStatus);
}
