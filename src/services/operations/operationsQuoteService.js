/**
 * Operations Quote Service — Module 10
 * Manages versioned quote creation and lifecycle.
 * Quotes are append-only — previous versions are never overwritten.
 */

import { buildQuote } from "./operationsContextService";
import { recordEvent, AUDIT_ACTIONS } from "./operationsAuditService";

// ─────────────────────────────────────────────
// QUOTE VERSIONING
// ─────────────────────────────────────────────

/**
 * Adds a new versioned quote to a booking record.
 * Returns updated booking record.
 */
export function addQuote(bookingRecord, breakdown, createdBy, createdByRole, reason = "") {
  const existingCount = (bookingRecord.quotes || []).length;
  const versionNumber = existingCount + 1;
  const versionLabel = `Quote v${versionNumber}`;

  const quote = buildQuote(bookingRecord.requestId, breakdown, createdBy, createdByRole, reason);
  quote.versionLabel = versionLabel;

  let updated = {
    ...bookingRecord,
    quotes: [...(bookingRecord.quotes || []), quote],
    budget: {
      ...bookingRecord.budget,
      operationsQuote: quote.total
    },
    updatedAt: new Date().toISOString()
  };

  updated = recordEvent(updated, {
    actorId: createdBy,
    actorRole: createdByRole,
    actorName: createdBy,
    action: AUDIT_ACTIONS.QUOTE_ADDED,
    previousValue: existingCount > 0 ? `Quote v${existingCount}` : null,
    newValue: versionLabel,
    activityMessage: `${versionLabel} added — Total: ₹${quote.total.toLocaleString("en-IN")}`
  });

  return updated;
}

/**
 * Updates a quote's status. Does NOT change the amount — amount changes require a new quote version.
 */
export function updateQuoteStatus(bookingRecord, quoteId, newStatus, actorId, actorRole) {
  const quotes = bookingRecord.quotes || [];
  const quoteIndex = quotes.findIndex(q => q.id === quoteId);
  if (quoteIndex === -1) return bookingRecord;

  const oldStatus = quotes[quoteIndex].status;
  const updatedQuotes = quotes.map((q, i) =>
    i === quoteIndex ? { ...q, status: newStatus } : q
  );

  let updated = {
    ...bookingRecord,
    quotes: updatedQuotes,
    updatedAt: new Date().toISOString()
  };

  updated = recordEvent(updated, {
    actorId,
    actorRole,
    actorName: actorId,
    action: AUDIT_ACTIONS.QUOTE_STATUS_CHANGED,
    previousValue: oldStatus,
    newValue: newStatus,
    activityMessage: `${quotes[quoteIndex].versionLabel} status changed: ${oldStatus} → ${newStatus}`
  });

  return updated;
}

/**
 * Returns the latest accepted or most recent quote.
 */
export function getActiveQuote(bookingRecord) {
  const quotes = bookingRecord.quotes || [];
  return quotes.filter(q => q.status === "CUSTOMER_ACCEPTED").pop()
    || quotes.filter(q => q.status === "SENT_TO_CUSTOMER").pop()
    || quotes[quotes.length - 1]
    || null;
}

/**
 * Formats a price breakdown into a display-ready summary.
 */
export function formatBreakdown(quote) {
  if (!quote) return [];
  const { breakdown } = quote;
  const lines = [
    { label: "Accommodation", value: breakdown.accommodation },
    { label: "Transport", value: breakdown.transport },
    { label: "Meals", value: breakdown.meals },
    { label: "Permits", value: breakdown.permits },
    { label: "Activities", value: breakdown.activities },
    { label: "Guide", value: breakdown.guide },
    { label: "Taxes & Fees", value: breakdown.taxes },
    { label: "Other", value: breakdown.other }
  ].filter(l => l.value > 0);

  return lines;
}
