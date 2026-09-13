/**
 * Notification Template Service — Module 13
 * Manages versioned notification templates, safe variable interpolation,
 * and input escaping to prevent XSS injection.
 */

import { NOTIFICATION_EVENTS, NOTIFICATION_CHANNELS } from "./notificationContextService";

// Built-in standard template definitions
const TEMPLATE_REGISTRY = {
  // Booking events
  [`${NOTIFICATION_EVENTS.BOOKING_RECEIVED}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_BOOKING_RECEIVED_IN_APP",
    templateVersion: "1.0",
    subject: "Booking Request Received — {{requestId}}",
    body: "Hi {{customerName}}, your booking request {{requestId}} for {{destination}} ({{tripDates}}) has been received. Our operations team is creating your custom itinerary proposal."
  },
  [`${NOTIFICATION_EVENTS.BOOKING_RECEIVED}_${NOTIFICATION_CHANNELS.EMAIL}`]: {
    templateId: "TPL_BOOKING_RECEIVED_EMAIL",
    templateVersion: "1.0",
    subject: "We Received Your Sikkim Journey Request [{{requestId}}]",
    body: "Dear {{customerName}},\n\nThank you for choosing Sikkim Traveller! We have received your trip request {{requestId}} for {{destination}} starting on {{startDate}}.\n\nOur team is working on your personalized proposal. We will notify you as soon as it's ready.\n\nBest regards,\nSikkim Traveller Operations Team"
  },
  [`${NOTIFICATION_EVENTS.BOOKING_STATUS_CHANGED}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_BOOKING_STATUS_IN_APP",
    templateVersion: "1.0",
    subject: "Booking Update — {{requestId}}",
    body: "Your booking status has been updated to {{status}}. Check details in your portal."
  },

  // Proposals & Quotes
  [`${NOTIFICATION_EVENTS.PROPOSAL_SENT}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_PROPOSAL_SENT_IN_APP",
    templateVersion: "1.0",
    subject: "Proposal Ready for Review — {{requestId}}",
    body: "Your custom journey proposal for {{destination}} is ready! Total: ₹{{amount}}. Click here to review and accept."
  },
  [`${NOTIFICATION_EVENTS.PROPOSAL_SENT}_${NOTIFICATION_CHANNELS.WHATSAPP}`]: {
    templateId: "TPL_PROPOSAL_SENT_WA",
    templateVersion: "1.0",
    subject: "Proposal Ready",
    body: "Namaste {{customerName}}! 🌄 Your custom Sikkim proposal ({{requestId}}) is ready. Total: ₹{{amount}}, valid until {{validUntil}}. Track your booking here: {{portalUrl}}"
  },

  // Payments & Financials
  [`${NOTIFICATION_EVENTS.PAYMENT_RECEIVED}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_PAYMENT_RECEIVED_IN_APP",
    templateVersion: "1.0",
    subject: "Payment Confirmed! — ₹{{amount}}",
    body: "Payment of ₹{{amount}} received for request {{requestId}}. Official receipt #{{receiptNumber}} is generated."
  },
  [`${NOTIFICATION_EVENTS.PAYMENT_RECEIVED}_${NOTIFICATION_CHANNELS.EMAIL}`]: {
    templateId: "TPL_PAYMENT_RECEIVED_EMAIL",
    templateVersion: "1.0",
    subject: "Payment Receipt — {{requestId}}",
    body: "Dear {{customerName}},\n\nWe have received your payment of ₹{{amount}} for {{requestId}} via {{paymentMethod}}.\nReceipt #: {{receiptNumber}}.\nBalance Due: ₹{{balanceDue}}.\n\nThank you!"
  },
  [`${NOTIFICATION_EVENTS.INVOICE_CREATED}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_INVOICE_CREATED_IN_APP",
    templateVersion: "1.0",
    subject: "New Invoice Issued — {{invoiceNumber}}",
    body: "Invoice {{invoiceNumber}} for ₹{{amount}} has been issued for booking {{requestId}}."
  },

  // Realtime Weather & Permits
  [`${NOTIFICATION_EVENTS.WEATHER_ALERT}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_WEATHER_ALERT_IN_APP",
    templateVersion: "1.0",
    subject: "⚠️ Weather Advisory — {{destination}}",
    body: "Travel alert for {{destination}}: {{alertMessage}}. Operations is monitoring your route."
  },
  [`${NOTIFICATION_EVENTS.PERMIT_REQUIRED}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_PERMIT_REQUIRED_IN_APP",
    templateVersion: "1.0",
    subject: "Action Required: Permit Documents Needed",
    body: "Please upload ID & pass photos for your {{permitType}} permit for {{destination}}."
  },

  // Reminders & Follow-up
  [`${NOTIFICATION_EVENTS.PRE_TRIP_REMINDER}_${NOTIFICATION_CHANNELS.IN_APP}`]: {
    templateId: "TPL_PRE_TRIP_IN_APP",
    templateVersion: "1.0",
    subject: "Trip Reminder — {{daysLeft}} Days to Sikkim!",
    body: "Your trip to {{destination}} starts on {{startDate}}. Don't forget your warm layers and permit IDs!"
  },
  [`${NOTIFICATION_EVENTS.TRIP_STARTING}_${NOTIFICATION_CHANNELS.WHATSAPP}`]: {
    templateId: "TPL_TRIP_STARTING_WA",
    templateVersion: "1.0",
    subject: "Welcome to Sikkim!",
    body: "Welcome {{customerName}}! Your Sikkim adventure begins today. Your driver {{driverName}} ({{driverPhone}}) is ready for your pickup."
  }
};

/**
 * Escapes HTML characters to prevent XSS injection.
 */
export function escapeHtml(str = "") {
  if (typeof str !== "string") return String(str || "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Renders a template safely by interpolating variables.
 */
export function renderNotificationTemplate(eventType, channel, variables = {}) {
  const key = `${eventType}_${channel}`;
  const template = TEMPLATE_REGISTRY[key] || {
    templateId: `TPL_FALLBACK_${eventType}`,
    templateVersion: "1.0",
    subject: variables.subject || `${eventType.replace(/_/g, " ")} Notification`,
    body: variables.message || variables.body || `Notification regarding request ${variables.requestId || "your booking"}.`
  };

  const safeVars = {};
  Object.keys(variables).forEach(k => {
    safeVars[k] = escapeHtml(variables[k] !== undefined && variables[k] !== null ? String(variables[k]) : "");
  });

  const interpolate = (text) => {
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, varName) => {
      return safeVars[varName] !== undefined ? safeVars[varName] : "";
    });
  };

  return {
    templateId: template.templateId,
    templateVersion: template.templateVersion,
    renderedContent: {
      subject: interpolate(template.subject),
      body: interpolate(template.body)
    }
  };
}
