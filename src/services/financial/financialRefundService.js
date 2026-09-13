/**
 * Financial Refund Service — Module 12
 * Role-gated refund workflow. Only ADMIN or OPERATIONS_MANAGER roles can authorize refunds.
 * Generates negative ledger adjustment and updates invoice paid balance.
 */

import { getFinancialStore, saveFinancialStore } from "./financialFallbackService";
import { recordLedgerTransaction } from "./financialLedgerService";
import { validatePaymentAmount } from "./financialValidationService";
import { sanitizeText } from "../customer/customerPortalSanitizationService";
import { PAYMENT_STATUSES } from "./financialContextService";

/**
 * Checks if the role has refund authorization privileges.
 */
export function canAuthorizeRefund(role) {
  return role === "ADMIN" || role === "OPERATIONS_MANAGER";
}

/**
 * Initiates and processes a customer refund.
 */
export async function processRefund({
  bookingId,
  transactionId,
  amount,
  reason,
  actorId = "SYSTEM",
  actorRole = "OPERATIONS_MANAGER"
}) {
  if (!canAuthorizeRefund(actorRole)) {
    throw new Error("Access Denied: Refund authorization requires Operations Manager or Admin privileges.");
  }

  const store = getFinancialStore();
  const txns = store.transactions || [];
  const txnIndex = txns.findIndex(t => t.id === transactionId || t.transactionId === transactionId);

  if (txnIndex === -1) {
    throw new Error("Transaction not found.");
  }

  const transaction = txns[txnIndex];
  const { isValid, amount: validAmount, error } = validatePaymentAmount(amount, transaction.amount);
  if (!isValid) {
    throw new Error(error || "Invalid refund amount.");
  }

  const cleanReason = sanitizeText(reason || "Customer cancellation / adjustment");
  const refundId = `REF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const refundRecord = {
    id: refundId,
    refundId,
    transactionId: transaction.transactionId,
    invoiceId: transaction.invoiceId,
    bookingId: transaction.bookingId,
    trackingToken: transaction.trackingToken,
    amount: validAmount,
    currency: transaction.currency || "INR",
    reason: cleanReason,
    status: "PROCESSED",
    authorizedBy: actorId,
    authorizedByRole: actorRole,
    processedAt: new Date().toISOString(),
    _isMockRefund: true
  };

  // Update Transaction Status
  const isFullRefund = validAmount >= transaction.amount;
  transaction.status = isFullRefund ? PAYMENT_STATUSES.REFUNDED : PAYMENT_STATUSES.PARTIALLY_REFUNDED;
  txns[txnIndex] = transaction;

  // Update Invoice Paid Amount and Balance
  const invoices = store.invoices || [];
  const invoiceIndex = invoices.findIndex(i => i.id === transaction.invoiceId);
  if (invoiceIndex !== -1) {
    const inv = invoices[invoiceIndex];
    const newPaid = Math.max(0, inv.amountPaid - validAmount);
    const newBalance = inv.totalAmount - newPaid;
    invoices[invoiceIndex] = {
      ...inv,
      amountPaid: newPaid,
      balanceDue: newBalance,
      paymentStatus: newPaid === 0 ? "UNPAID" : "PARTIALLY_PAID"
    };
  }

  saveFinancialStore({
    ...store,
    transactions: txns,
    invoices,
    refunds: [...(store.refunds || []), refundRecord]
  });

  // Record Negative Ledger Entry
  recordLedgerTransaction({
    bookingId: transaction.bookingId,
    trackingToken: transaction.trackingToken,
    entryType: "REFUND_PROCESSED",
    amount: validAmount,
    debitCredit: "DEBIT",
    referenceId: refundId,
    actorId,
    actorRole,
    description: `Refund of ₹${validAmount.toLocaleString("en-IN")} processed against ${transaction.transactionId} (${cleanReason})`
  });

  return {
    success: true,
    refund: refundRecord,
    message: `Refund of ₹${validAmount.toLocaleString("en-IN")} successfully processed.`
  };
}

/**
 * Retrieves refunds for a booking or tracking token.
 */
export function getRefunds(identifier) {
  if (!identifier) return [];
  const store = getFinancialStore();
  const clean = identifier.trim().toUpperCase();

  return (store.refunds || [])
    .filter(r => r.bookingId?.toUpperCase() === clean || r.trackingToken?.toUpperCase() === clean)
    .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));
}
