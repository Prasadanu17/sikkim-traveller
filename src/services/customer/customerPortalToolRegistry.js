/**
 * Customer Portal Tool Registry — Module 11
 * Restrictive, customer-scoped tool registry for the AI Assistant.
 * Strictly READ-ONLY. No tool is permitted to mutate booking records, approve permits,
 * alter pricing, or access internal notes.
 */

export const CUSTOMER_TOOLS = {
  getBookingStatus: {
    name: "getBookingStatus",
    description: "Returns the current customer-friendly tracking status and explanation of the trip request.",
    isReadOnly: true
  },
  getTripItinerary: {
    name: "getTripItinerary",
    description: "Returns the day-by-day itinerary breakdown, elevation, highlights, and planned daily activities.",
    isReadOnly: true
  },
  getLatestProposal: {
    name: "getLatestProposal",
    description: "Returns the current proposal version, total price, validity period, and summary.",
    isReadOnly: true
  },
  getInclusionsAndExclusions: {
    name: "getInclusionsAndExclusions",
    description: "Returns the explicit list of what is included and excluded in the current proposal.",
    isReadOnly: true
  },
  getRealtimeTravelAlerts: {
    name: "getRealtimeTravelAlerts",
    description: "Returns current Sikkim weather conditions, road advisories, and permit status for the trip.",
    isReadOnly: true
  },
  getDocumentsList: {
    name: "getDocumentsList",
    description: "Returns the list of ready and verified travel documents/vouchers available for download.",
    isReadOnly: true
  },
  getNextSteps: {
    name: "getNextSteps",
    description: "Explains what action is currently required from the customer or what operations is doing next.",
    isReadOnly: true
  },
  getPostApprovalProcess: {
    name: "getPostApprovalProcess",
    description: "Explains the exact steps that occur after the customer approves a trip proposal.",
    isReadOnly: true
  },
  getPaymentAndBillingStatus: {
    name: "getPaymentAndBillingStatus",
    description: "Returns the billing summary: total invoiced amount, amount paid to date, advance deposit required, remaining balance due, and payment due date.",
    isReadOnly: true
  },
  getPaymentReceipts: {
    name: "getPaymentReceipts",
    description: "Returns the list of verified payment receipts and transaction records for this trip.",
    isReadOnly: true
  }
};

/**
 * Returns available read-only customer assistant tools.
 */
export function getAvailableCustomerTools() {
  return Object.values(CUSTOMER_TOOLS);
}
