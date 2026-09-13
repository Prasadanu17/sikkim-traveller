/**
 * Financial Invoice Service — Module 12
 * Handles invoice generation from proposals/quotes, versioning, status updates, and cancellation.
 */

import { buildInvoice, INVOICE_STATUSES } from "./financialContextService";
import { getFinancialStore, saveFinancialStore } from "./financialFallbackService";
import { recordLedgerTransaction } from "./financialLedgerService";
import { validateInvoiceItems } from "./financialValidationService";
import { sanitizeText } from "../customer/customerPortalSanitizationService";

/**
 * Retrieves all invoices for a booking or tracking token.
 * @param {string} identifier
 */
export function getInvoices(identifier) {
  if (!identifier) return [];
  const store = getFinancialStore();
  const clean = identifier.trim().toUpperCase();

  return (store.invoices || [])
    .filter(inv => inv.bookingId?.toUpperCase() === clean || inv.trackingToken?.toUpperCase() === clean)
    .sort((a, b) => b.version - a.version);
}

/**
 * Gets active/latest unpaid or current invoice for a booking.
 */
export function getActiveInvoice(identifier) {
  const list = getInvoices(identifier);
  if (list.length === 0) return null;
  return list.find(inv => inv.paymentStatus !== INVOICE_STATUSES.CANCELLED) || list[0];
}

/**
 * Generates a new versioned invoice for a booking.
 */
export function generateInvoice(bookingRecord, {
  quoteId = null,
  proposalVersion = 1,
  items = [],
  dueDate = null,
  notes = "",
  actorId = "SYSTEM",
  actorRole = "OPERATIONS_MANAGER"
}) {
  if (!bookingRecord) {
    throw new Error("Booking context is required to generate an invoice.");
  }

  const { isValid, sanitizedItems, subtotal, error } = validateInvoiceItems(items);
  if (!isValid) {
    throw new Error(error || "Invalid invoice line items.");
  }

  const store = getFinancialStore();
  const existingInvoices = getInvoices(bookingRecord.requestId || bookingRecord.publicRequestId || bookingRecord.trackingToken);
  const nextVersion = existingInvoices.length + 1;

  const newInvoice = buildInvoice({
    bookingId: bookingRecord.requestId || bookingRecord.publicRequestId || bookingRecord.id || "ST-REQ-001",
    trackingToken: bookingRecord.trackingToken || "ST-TRK-DEMO",
    versionNumber: nextVersion,
    quoteId,
    proposalVersion,
    items: sanitizedItems,
    issuedBy: actorId,
    issuedByRole: actorRole,
    recipient: {
      name: bookingRecord.customer?.name || bookingRecord.customer?.fullName || bookingRecord.customer?.firstName || "Traveler",
      email: bookingRecord.customer?.email || "",
      phone: bookingRecord.customer?.phone || ""
    },
    dueDate,
    notes: sanitizeText(notes)
  });

  const updatedStore = {
    ...store,
    invoices: [...(store.invoices || []), newInvoice]
  };
  saveFinancialStore(updatedStore);

  // Append ledger entry
  recordLedgerTransaction({
    bookingId: newInvoice.bookingId,
    trackingToken: newInvoice.trackingToken,
    entryType: "INVOICE_ISSUED",
    amount: newInvoice.totalAmount,
    debitCredit: "DEBIT",
    referenceId: newInvoice.invoiceNumber,
    actorId,
    actorRole,
    description: `${newInvoice.versionLabel} (${newInvoice.invoiceNumber}) issued — Total: ₹${newInvoice.totalAmount.toLocaleString("en-IN")} (Advance Due: ₹${newInvoice.advanceRequired.toLocaleString("en-IN")})`
  });

  return newInvoice;
}

/**
 * Cancels an invoice.
 */
export function cancelInvoice(invoiceId, reason, actorId = "SYSTEM", actorRole = "OPERATIONS_MANAGER") {
  const store = getFinancialStore();
  const invoices = store.invoices || [];
  const index = invoices.findIndex(i => i.id === invoiceId || i.invoiceNumber === invoiceId);

  if (index === -1) {
    throw new Error(`Invoice "${invoiceId}" not found.`);
  }

  const invoice = invoices[index];
  if (invoice.paymentStatus === INVOICE_STATUSES.PAID) {
    throw new Error("Cannot cancel a fully paid invoice. Process a refund instead.");
  }

  const updatedInvoice = {
    ...invoice,
    paymentStatus: INVOICE_STATUSES.CANCELLED,
    cancelledAt: new Date().toISOString(),
    cancelledBy: actorId,
    cancellationReason: sanitizeText(reason || "Operational adjustment")
  };

  invoices[index] = updatedInvoice;
  saveFinancialStore({ ...store, invoices });

  // Record ledger adjustment
  recordLedgerTransaction({
    bookingId: invoice.bookingId,
    trackingToken: invoice.trackingToken,
    entryType: "INVOICE_CANCELLED",
    amount: invoice.balanceDue,
    debitCredit: "CREDIT",
    referenceId: invoice.invoiceNumber,
    actorId,
    actorRole,
    description: `${invoice.versionLabel} cancelled — Reversed balance: ₹${invoice.balanceDue.toLocaleString("en-IN")}`
  });

  return updatedInvoice;
}
