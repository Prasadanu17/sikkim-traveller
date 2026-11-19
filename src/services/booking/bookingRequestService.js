import { API_ENDPOINTS } from "../../config/apiConfig";

/**
 * Booking Request Service.
 * Manages transmission of finalized booking payloads to the backend API,
 * providing double-submission protection and secure local mock generation when offline.
 */

/**
 * Submits the normalized and sanitized booking payload to the secure backend.
 * Uses an idempotency key to prevent double processing of identical requests.
 */
export async function submitBookingRequest(bookingPayload, idempotencyKey) {
  if (!bookingPayload) {
    throw new Error("Missing booking payload data.");
  }

  const apiEndpoint = API_ENDPOINTS.BOOKING_REQUEST;

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey
      },
      credentials: "include",
      body: JSON.stringify(bookingPayload)
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        requestId: result.requestId || `ST-REQ-${Date.now()}`,
        status: result.status || "RECEIVED",
        submittedAt: result.submittedAt || new Date().toISOString()
      };
    } else {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP Error ${response.status}`);
    }
  } catch (err) {
    console.error("[BookingRequestService] Booking submission failed:", err.message);
    // Never simulate fake success when backend persistence fails.
    // Propagate error to the caller so the user is truthfully informed.
    throw err;
  }
}
