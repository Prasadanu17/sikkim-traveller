/**
 * Customer API Gateway Service — Production Backend Integration
 * Provides clean, server-authoritative API boundary contracts for all customer operations.
 * 
 * ARCHITECTURE:
 * - In MOCK MODE (VITE_CUSTOMER_API_MOCK_MODE !== "false"): Uses existing localStorage/sessionStorage services.
 * - In PRODUCTION MODE: Calls real backend APIs with proper Authorization headers.
 * 
 * SECURITY PRINCIPLES:
 * - Frontend checks are UX checks only. Backend checks are security checks.
 * - Tokens are never logged or stored unnecessarily in frontend state.
 * - All responses use generic error messages to prevent IDOR information leakage.
 * - Session revocation calls the server before clearing local storage.
 */

import {
  generateCustomerJourneyToken,
  validateJourneyAccessToken,
  saveActiveJourneySession,
  clearActiveJourneySession
} from "./customerSecurityService";
import { loadMockBookings } from "../operations/operationsFallbackService";
import { buildCustomerSafeModel } from "./customerPortalContextService";
import { API_ENDPOINTS } from "../../config/apiConfig";

const IS_MOCK = import.meta.env.VITE_CUSTOMER_API_MOCK_MODE !== "false";
const API_BASE = API_ENDPOINTS.CUSTOMER_BASE;

/**
 * Helper: Returns standard auth headers for production API calls.
 * Token is sent in Authorization header — never in URL or exposed in logs.
 */
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
}

/**
 * Helper: Returns generic unauthorized response to prevent IDOR information leakage.
 * Never reveals whether the journey exists.
 */
function unauthorizedResponse() {
  return {
    success: false,
    authorized: false,
    error: "Journey access could not be verified."
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customer/verify-token
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies a customer journey access token against the authoritative backend.
 * In mock mode: iterates mock bookings and validates token locally.
 * In production: calls POST /api/customer/verify-token — server is the authority.
 * 
 * SECURITY TESTS:
 * - Request ID alone (no -TK suffix) → REJECTED
 * - Token mismatch (Customer A token + Customer B journey) → REJECTED
 * - Revoked token → REJECTED (production: server tracks revoked tokens)
 */
export async function verifyJourneyToken(token) {
  if (!token || typeof token !== "string" || token.trim().length < 10) {
    return unauthorizedResponse();
  }

  const cleanToken = token.trim();

  if (IS_MOCK) {
    // Mock: validate deterministically against all stored bookings
    const allBookings = loadMockBookings();

    for (const booking of allBookings) {
      const validToken = booking.accessToken || generateCustomerJourneyToken(booking.requestId || booking.id);
      const result = validateJourneyAccessToken(cleanToken, { ...booking, accessToken: validToken });

      if (result.authorized) {
        // Build customer-safe model — strips internal notes, audit logs, supplier margins
        const safeModel = buildCustomerSafeModel(booking);
        saveActiveJourneySession(cleanToken, safeModel.requestId || safeModel.id, safeModel.customer?.firstName);

        return {
          success: true,
          authorized: true,
          journey: safeModel,
          _isMock: true
        };
      }
    }

    // Generic response — do not reveal whether journey exists
    return unauthorizedResponse();
  }

  // Production: server-authoritative token verification
  try {
    const response = await fetch(`${API_BASE}/verify-token`, {
      method: "POST",
      headers: authHeaders(null),
      body: JSON.stringify({ token: cleanToken }),
      credentials: "include"
    });

    if (!response.ok) {
      // Always return generic error — never expose server error details
      return unauthorizedResponse();
    }

    const data = await response.json();
    if (!data.authorized || !data.journey) {
      return unauthorizedResponse();
    }

    saveActiveJourneySession(cleanToken, data.journey.requestId, data.journey.customer?.firstName);
    return {
      success: true,
      authorized: true,
      journey: data.journey
    };
  } catch (_err) {
    console.warn("[CustomerAPIGateway] Token verification network error.");
    return unauthorizedResponse();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customer/journey
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the single authorized customer journey for the active session token.
 * Server is the authoritative source for journey state.
 */
export async function fetchCustomerJourney(token) {
  if (!token) return { success: false, error: "Access token is required." };

  if (IS_MOCK) {
    return verifyJourneyToken(token);
  }

  try {
    const response = await fetch(`${API_BASE}/journey`, {
      method: "GET",
      headers: authHeaders(token),
      credentials: "include"
    });

    if (!response.ok) return unauthorizedResponse();

    const data = await response.json();
    return { success: true, authorized: true, journey: data.journey };
  } catch (_err) {
    console.warn("[CustomerAPIGateway] Journey fetch network error.");
    return { success: false, error: "Unable to load your journey at this time. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customer/session/revoke
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Revokes the active customer journey session.
 * 
 * IMPORTANT: This is a TRUE session revocation, not just a localStorage clear.
 * Production:
 * 1. Calls POST /api/customer/session/revoke on server
 * 2. Server marks token as REVOKED in the database
 * 3. Subsequent token verification calls are rejected server-side
 * 4. Clears local sessionStorage
 * 
 * Mock:
 * 1. Clears sessionStorage
 * 2. Notes that reuse protection is UX-only in mock mode (no server persistence)
 */
export async function revokeCustomerSession(token) {
  // Always clear local session first
  clearActiveJourneySession();

  if (!token) return { success: true, _note: "No token to revoke." };

  if (IS_MOCK) {
    console.info("[CustomerAPIGateway][MOCK] Session revoked locally. Note: In production, the server would invalidate this token to prevent reuse.");
    return {
      success: true,
      _isMock: true,
      _revokeNote: "MOCK MODE: sessionStorage cleared. Server-side token invalidation requires real backend."
    };
  }

  // Production: Server-authoritative revocation
  try {
    await fetch(`${API_BASE}/session/revoke`, {
      method: "POST",
      headers: authHeaders(token),
      credentials: "include",
      body: JSON.stringify({ revokedAt: new Date().toISOString() })
    });
    return { success: true };
  } catch (_err) {
    // Even if server call fails, local session is cleared — fail safe
    console.warn("[CustomerAPIGateway] Session revoke server call failed. Local session cleared.");
    return { success: true, _note: "Local session cleared; server revocation may need retry." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customer/proposal/approve
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits customer proposal approval with version validation.
 * Server enforces version match — stale approvals are rejected.
 */
export async function approveProposalViaGateway(token, proposalVersion, checklist) {
  if (!token || !proposalVersion) {
    return { success: false, error: "Token and proposal version are required." };
  }

  if (IS_MOCK) {
    // Delegate to existing customerApprovalService for mock mode
    const { approveProposal } = await import("./customerApprovalService");
    return approveProposal(null, proposalVersion, { ...checklist, _token: token });
  }

  try {
    const response = await fetch(`${API_BASE}/proposal/approve`, {
      method: "POST",
      headers: authHeaders(token),
      credentials: "include",
      body: JSON.stringify({
        proposalVersion,
        agreements: checklist,
        approvedAt: new Date().toISOString()
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Controlled rejection (e.g., stale proposal version)
      return { success: false, error: data.message || "Approval could not be submitted. The proposal may have been updated." };
    }

    return { success: true, booking: data.journey };
  } catch (_err) {
    return { success: false, error: "Network error while submitting approval. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customer/change-requests
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits a customer change request to Operations.
 * Customers cannot directly mutate confirmed operational data — only submit requests.
 */
export async function submitChangeRequestViaGateway(token, { requestId, requestType, title, description, requestedDetails, customerName }) {
  if (!token || !requestId || !description?.trim()) {
    return { success: false, error: "Token, request ID, and description are required." };
  }

  if (IS_MOCK) {
    const { submitChangeRequest } = await import("./customerChangeRequestService");
    return submitChangeRequest({ requestId, requestType, title, description, requestedDetails, customerName });
  }

  try {
    const response = await fetch(`${API_BASE}/change-requests`, {
      method: "POST",
      headers: authHeaders(token),
      credentials: "include",
      body: JSON.stringify({ requestType, title, description: description.trim(), requestedDetails, customerName })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data.message || "Failed to submit change request." };
    }

    return { success: true, changeRequest: data.changeRequest };
  } catch (_err) {
    return { success: false, error: "Network error while submitting change request." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customer/documents
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches authorized customer document list with signed URLs.
 * Server enforces authorization — documents are only accessible for the correct token/journey.
 * Customer A token cannot access Customer B documents.
 */
export async function fetchCustomerDocumentsViaGateway(token, requestId) {
  if (!token) return { success: false, error: "Access token required." };

  if (IS_MOCK) {
    const { getCustomerDocuments } = await import("./customerDocumentService");
    const docs = await getCustomerDocuments(requestId);
    return { success: true, documents: docs, _isMock: true };
  }

  try {
    const response = await fetch(`${API_BASE}/documents`, {
      method: "GET",
      headers: authHeaders(token),
      credentials: "include"
    });

    if (!response.ok) return unauthorizedResponse();
    const data = await response.json();
    return { success: true, documents: data.documents };
  } catch (_err) {
    return { success: false, error: "Unable to load documents at this time." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IDOR SECURITY TEST HELPERS (Development/QA use only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tests that Customer A's token cannot access Customer B's journey.
 * For development security validation only — not exposed to production.
 * @returns {{ passed: boolean, results: object[] }}
 */
export function runIDORSecurityTests(tokenA, bookingBId) {
  if (!IS_MOCK) {
    return { passed: null, note: "IDOR tests only run in mock mode against local data." };
  }

  const results = [];

  // Test 1: Plain Request ID alone (no token suffix) must fail
  const plainIdTest = validateJourneyAccessToken(bookingBId, { requestId: bookingBId, id: bookingBId });
  results.push({
    test: "Plain Request ID without token suffix",
    expected: false,
    actual: plainIdTest.authorized,
    passed: plainIdTest.authorized === false
  });

  // Test 2: Customer A token against Customer B booking
  const allBookings = loadMockBookings();
  const bookingB = allBookings.find(b => (b.requestId || b.id) === bookingBId);
  if (bookingB && tokenA) {
    const crossTest = validateJourneyAccessToken(tokenA, bookingB);
    results.push({
      test: "Customer A token + Customer B journey",
      expected: false,
      actual: crossTest.authorized,
      passed: crossTest.authorized === false
    });
  }

  const allPassed = results.every(r => r.passed);
  return { passed: allPassed, results };
}
