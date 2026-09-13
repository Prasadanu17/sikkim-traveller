/**
 * Customer Access Service — Module 11
 * Handles secure tracking access, token validation, and session management.
 * In development mock mode (VITE_CUSTOMER_PORTAL_MOCK_MODE=true), loads from seeded fallback storage.
 * In production mode, interacts with GET /api/customer/booking/:trackingToken.
 */

import { validateTrackingToken, sanitizeText } from "./customerPortalSanitizationService";
import { getMockBookingByToken } from "./customerPortalFallbackService";
import { buildCustomerSafeModel } from "./customerPortalContextService";

const SESSION_KEY = "st_active_tracking_session";

/**
 * Verifies tracking token and fetches the customer-safe booking model.
 * @param {string} trackingToken
 * @returns {Promise<object>} Customer-safe booking record
 */
export async function verifyTrackingAccess(trackingToken) {
  const cleanToken = sanitizeText(trackingToken);

  if (!validateTrackingToken(cleanToken)) {
    throw new Error("Invalid tracking token format. Tracking tokens are typically in format 'ST-TRK-XXXXX'.");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    // Simulate slight network latency for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 300));

    const record = getMockBookingByToken(cleanToken);
    if (!record) {
      throw new Error(`No booking found matching tracking token "${cleanToken}". Please check the token provided in your email or message.`);
    }

    const safeModel = buildCustomerSafeModel(record);
    saveTrackingSession({
      trackingToken: safeModel.trackingToken,
      publicRequestId: safeModel.publicRequestId,
      customerFirstName: safeModel.customer.firstName,
      accessedAt: new Date().toISOString()
    });

    return safeModel;
  }

  // Production API boundary
  try {
    const response = await fetch(`/api/customer/booking/${encodeURIComponent(cleanToken)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No trip booking was found with tracking token "${cleanToken}".`);
      }
      throw new Error(`Secure lookup failed (HTTP ${response.status}). Please try again shortly.`);
    }

    const rawData = await response.json();
    const safeModel = buildCustomerSafeModel(rawData);

    saveTrackingSession({
      trackingToken: safeModel.trackingToken,
      publicRequestId: safeModel.publicRequestId,
      customerFirstName: safeModel.customer.firstName,
      accessedAt: new Date().toISOString()
    });

    return safeModel;
  } catch (err) {
    if (err.message.includes("No trip booking") || err.message.includes("Invalid tracking")) {
      throw err;
    }
    throw new Error("Unable to establish secure connection to the customer travel server.");
  }
}

/**
 * Saves current active tracking session metadata in sessionStorage.
 * @param {object} sessionData
 */
export function saveTrackingSession(sessionData) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (_err) {
    // Ignore storage issues in private tabs
  }
}

/**
 * Returns current active tracking session metadata if present.
 */
export function getActiveTrackingSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
}

/**
 * Clears current tracking session.
 */
export function clearTrackingSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (_err) {
    // Ignore
  }
}
