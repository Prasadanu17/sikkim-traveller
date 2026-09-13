/**
 * Customer Communication Service — Module 11
 * Handles direct messaging between traveler and Sikkim operations team.
 * Enforces text sanitization. NEVER exposes internal staff notes or comments.
 */

import { sanitizeText } from "./customerPortalSanitizationService";
import { getMockBookingByToken, updateMockBooking } from "./customerPortalFallbackService";
import { buildCustomerSafeModel } from "./customerPortalContextService";

/**
 * Retrieves the customer-visible message history.
 * @param {string} trackingToken
 */
export async function getCustomerMessages(trackingToken) {
  const cleanToken = sanitizeText(trackingToken);
  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    const record = getMockBookingByToken(cleanToken);
    return record?.customerMessages || [];
  }

  // Production API boundary
  const response = await fetch(`/api/customer/booking/${encodeURIComponent(cleanToken)}/messages`, {
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve messages from server.");
  }

  return response.json();
}

/**
 * Sends a message from the customer to the operations desk.
 * @param {string} trackingToken
 * @param {string} rawText
 * @param {string} customerName
 */
export async function sendCustomerMessage(trackingToken, rawText, customerName = "You") {
  const cleanToken = sanitizeText(trackingToken);
  const cleanText = sanitizeText(rawText);
  const cleanName = sanitizeText(customerName);

  if (!cleanText || cleanText.length < 2) {
    throw new Error("Please type a message before sending.");
  }

  if (cleanText.length > 1500) {
    throw new Error("Message is too long (maximum 1,500 characters).");
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const record = getMockBookingByToken(cleanToken);
    if (!record) {
      throw new Error(`Booking record "${cleanToken}" not found.`);
    }

    const newMsg = {
      id: `MSG-${Date.now()}`,
      sender: "customer",
      senderName: cleanName,
      text: cleanText,
      timestamp: new Date().toISOString()
    };

    const updated = {
      ...record,
      customerMessages: [...(record.customerMessages || []), newMsg],
      updatedAt: new Date().toISOString()
    };

    const saved = updateMockBooking(updated);
    return {
      success: true,
      message: newMsg,
      booking: buildCustomerSafeModel(saved)
    };
  }

  // Production API boundary
  const response = await fetch(`/api/customer/booking/${encodeURIComponent(cleanToken)}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      text: cleanText,
      senderName: cleanName,
      sentAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to send message.");
  }

  const result = await response.json();
  return {
    success: true,
    message: result.message,
    booking: buildCustomerSafeModel(result.booking)
  };
}
