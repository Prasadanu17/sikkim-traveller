/**
 * Customer Document Service — Module 11
 * Manages travel vouchers, itineraries, permit PDFs, and payment receipts.
 * In development mock mode, provides safe demo previews.
 * In production mode, interacts with GET /api/customer/booking/:trackingToken/documents.
 */

import { sanitizeText } from "./customerPortalSanitizationService";
import { getMockBookingByToken } from "./customerPortalFallbackService";

export const DOCUMENT_CATEGORIES = [
  "Booking confirmation",
  "Final itinerary",
  "Accommodation voucher",
  "Transport voucher",
  "Permit document",
  "Payment receipt",
  "Other"
];

/**
 * Fetches the customer-safe documents list for a booking.
 * @param {string} trackingToken
 */
export async function getCustomerDocuments(trackingToken) {
  const cleanToken = sanitizeText(trackingToken);
  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    const record = getMockBookingByToken(cleanToken);
    return record?.documents || [];
  }

  // Production API boundary
  const response = await fetch(`/api/customer/booking/${encodeURIComponent(cleanToken)}/documents`, {
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) {
    throw new Error("Failed to load documents list from server.");
  }

  return response.json();
}

/**
 * Returns safe demo document preview content for modal viewing.
 * @param {object} doc
 * @param {object} booking
 */
export function getMockDocumentPreviewContent(doc, booking) {
  if (!doc) return null;

  return {
    title: doc.name || "Sikkim Travel Document",
    type: doc.type || "Document",
    status: doc.status || "ISSUED",
    date: doc.date || new Date().toISOString().split("T")[0],
    version: doc.version || "v1",
    bookingRef: booking?.publicRequestId || "ST-REQ-0001",
    travelerName: booking?.customer?.firstName || "Traveler",
    destinations: (booking?.trip?.destinations || []).join(" → "),
    travelDates: `${booking?.trip?.startDate || "TBD"} to ${booking?.trip?.endDate || "TBD"}`,
    issuer: "Sikkim Traveller Operations Desk, Gangtok, Sikkim",
    isSamplePreview: true,
    sampleWatermark: "VERIFIED TRAVEL DOCUMENT — SIKKIM TRAVELLER"
  };
}
