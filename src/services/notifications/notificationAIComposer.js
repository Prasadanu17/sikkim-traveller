/**
 * Notification AI Composer Service — Module 13
 * Integrates with Module 8 AI Copilot to assist staff and travelers in drafting,
 * rewriting, and summarizing notification messages.
 * 
 * STRICT SECURITY GUARDRAIL:
 * AI may ONLY generate drafts tagged with `_isAIDraft: true`.
 * AI MUST NOT execute send actions or bypass staff/customer authorization.
 */

import { NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS } from "./notificationContextService";
import { renderNotificationTemplate } from "./notificationTemplateService";

/**
 * Generates an AI-assisted draft notification message based on context.
 */
export async function generateAIDraftMessage({
  requestId = "GENERAL",
  customerName = "Valued Guest",
  eventType = NOTIFICATION_EVENTS.MANUAL_MESSAGE,
  channel = NOTIFICATION_CHANNELS.WHATSAPP,
  instructions = "",
  bookingContext = {}
}) {
  const destination = (bookingContext.destinations || ["Sikkim"]).join(", ");
  const cleanInst = instructions.toLowerCase().trim();

  let subject = `Update regarding request ${requestId}`;
  let body = "";

  // Deterministic smart draft generation based on instruction keywords
  if (cleanInst.includes("proposal") || cleanInst.includes("quote")) {
    subject = `Your Custom Sikkim Journey Proposal [${requestId}]`;
    body = `Dear ${customerName},\n\nWe have finalized your updated journey proposal for ${destination}. The revised price breakdown and inclusions are ready for your review in your portal.\n\nPlease let us know if you'd like any modifications!`;
  } else if (cleanInst.includes("weather") || cleanInst.includes("road") || cleanInst.includes("snow")) {
    subject = `Weather Advisory for ${destination}`;
    body = `Namaste ${customerName}, please note there is active snow/rain reported on the route to ${destination}. Our team has arranged appropriate vehicle support for your safety.`;
  } else if (cleanInst.includes("permit") || cleanInst.includes("document")) {
    subject = `Permit Documents Needed for ${destination}`;
    body = `Hi ${customerName}, to issue your Protected Area Permits for ${destination}, we kindly request you to submit clear photo ID proofs in your portal.`;
  } else {
    // Fallback template rendering
    const rendered = renderNotificationTemplate(eventType, channel, {
      customerName,
      requestId,
      destination,
      amount: bookingContext.budget?.operationsQuote || bookingContext.budget?.estimatedRange?.min || "45000"
    });
    subject = rendered.renderedContent.subject;
    body = rendered.renderedContent.body;
  }

  // Mandatory AI draft metadata tagging
  return {
    subject,
    body,
    channel,
    eventType,
    requestId,
    isAIDraft: true,
    _isAIDraft: true, // Internal security marker
    aiNotice: "AI-generated draft — review before sending."
  };
}

/**
 * Summarizes communication history for staff overview.
 */
export function summarizeCommunicationHistory(notifications = []) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return "No prior communication records found for this booking.";
  }

  const delivered = notifications.filter(n => n.status === "DELIVERED" || n.status === "READ");
  const failed = notifications.filter(n => n.status === "FAILED" || n.status === "ABANDONED");

  return `Communication summary: ${delivered.length} message(s) delivered, ${failed.length} failed across ${new Set(notifications.map(n => n.channel)).size} channel(s).`;
}
