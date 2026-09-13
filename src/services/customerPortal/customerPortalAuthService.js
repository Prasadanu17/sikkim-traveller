/**
 * Customer Portal Auth Service — Module 11
 * Handles customer authentication, verification, and session control.
 * Implements mock OTP gates in mock mode, and links to production boundary APIs.
 */

const SESSION_KEY = "st_customer_session";

// ─────────────────────────────────────────────
// AUTHENTICATION INTERFACE
// ─────────────────────────────────────────────

/**
 * Initiates the OTP / Magic link request.
 * @param {string} bookingId - E.g. ST-REQ-20260819-1042
 * @param {string} emailOrPhone
 */
export async function requestSecureAccess(bookingId, emailOrPhone) {
  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Verify booking actually exists in mock DB
    const { getBookingById } = await import("../operations/operationsBookingService");
    const record = getBookingById(bookingId);
    if (!record) {
      throw new Error(`Booking request "${bookingId}" could not be found.`);
    }

    // Return mock success details
    return {
      success: true,
      message: "Development Mode: Mock secure verification code sent.",
      mockCode: "123456" // Simple mock verification code
    };
  }

  // Production API boundary
  const response = await fetch("/api/customer/auth/request-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, contact: emailOrPhone })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to request access code.");
  }

  return response.json();
}

/**
 * Verifies the 6-digit OTP code.
 */
export async function verifySecureAccessCode(bookingId, emailOrPhone, code) {
  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (code === "123456") {
      const session = {
        bookingId,
        emailOrPhone,
        token: `mock-token-${Date.now()}`,
        loginTime: new Date().toISOString()
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, session };
    }
    throw new Error("Invalid verification code. Enter '123456' for mock login.");
  }

  // Production API boundary
  const response = await fetch("/api/customer/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, contact: emailOrPhone, code })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Invalid access code.");
  }

  const result = await response.json();
  if (result.token) {
    const session = {
      bookingId,
      emailOrPhone,
      token: result.token,
      loginTime: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, session };
  }

  throw new Error("Auth token missing from verification response.");
}

/**
 * Returns current customer session if present.
 */
export function getCustomerSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
}

/**
 * Clears current session (logs out).
 */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Checks if session matches booking access scope.
 */
export function canAccessBooking(bookingId) {
  const session = getCustomerSession();
  if (!session) return false;
  return session.bookingId === bookingId;
}
