/**
 * Financial Ledger Service — Module 12
 * Maintains an append-only financial ledger and audit log for all debits, credits, invoices, and refunds.
 */

import { buildLedgerEntry } from "./financialContextService";
import { getFinancialStore, saveFinancialStore } from "./financialFallbackService";

/**
 * Retrieves all ledger entries for a booking or tracking token.
 * @param {string} identifier - bookingId or trackingToken
 */
export function getLedgerEntries(identifier) {
  if (!identifier) return [];
  const store = getFinancialStore();
  const clean = identifier.trim().toUpperCase();

  return (store.ledgerEntries || [])
    .filter(e => e.bookingId?.toUpperCase() === clean || e.trackingToken?.toUpperCase() === clean)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Appends a new immutable ledger record.
 */
export function recordLedgerTransaction({
  bookingId,
  trackingToken,
  entryType,
  amount,
  debitCredit,
  referenceId,
  actorId,
  actorRole,
  description
}) {
  const store = getFinancialStore();
  const existingEntries = store.ledgerEntries || [];

  // Compute running balance for this booking
  const bookingEntries = existingEntries.filter(
    e => e.bookingId === bookingId || e.trackingToken === trackingToken
  );

  let currentBalance = 0;
  bookingEntries.forEach(e => {
    if (e.debitCredit === "DEBIT") currentBalance += e.amount;
    else if (e.debitCredit === "CREDIT") currentBalance -= e.amount;
  });

  if (debitCredit === "DEBIT") currentBalance += amount;
  else if (debitCredit === "CREDIT") currentBalance -= amount;

  const newEntry = buildLedgerEntry({
    bookingId,
    trackingToken,
    entryType,
    amount,
    debitCredit,
    runningBalance: currentBalance,
    referenceId,
    actorId,
    actorRole,
    description
  });

  const updatedStore = {
    ...store,
    ledgerEntries: [...existingEntries, newEntry]
  };

  saveFinancialStore(updatedStore);
  return newEntry;
}
