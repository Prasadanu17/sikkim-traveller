/**
 * Financial Payment Service — Module 12
 * Coordinates payment intents, idempotency duplicate checks, gateway simulation,
 * payment verification, manual wire recording, and receipt generation.
 * Follows strict pipeline:
 * PAYMENT_PENDING → PAYMENT_PROCESSING → PAYMENT_VERIFIED → PAYMENT_RECEIVED
 */

import {
  buildPaymentTransaction,
  buildPaymentReceipt,
  PAYMENT_STATUSES,
  INVOICE_STATUSES
} from "./financialContextService";
import { getFinancialStore, saveFinancialStore } from "./financialFallbackService";
import { recordLedgerTransaction } from "./financialLedgerService";
import { validatePaymentAmount, validateIdempotencyKey } from "./financialValidationService";
import { sanitizeText } from "../customer/customerPortalSanitizationService";

// In-flight payment lock to prevent fast double-clicks/duplicate submissions
const IN_FLIGHT_IDEMPOTENCY_LOCKS = new Set();

/**
 * Initiates a payment intent with idempotency guard.
 */
export async function createPaymentIntent({
  bookingId,
  trackingToken,
  invoiceId,
  amount,
  currency = "INR",
  paymentType = "ADVANCE",
  paymentMethod = "UPI",
  idempotencyKey,
  payerName = "Traveler",
  payerContact = ""
}) {
  const store = getFinancialStore();

  // 1. Validate idempotency key
  if (!validateIdempotencyKey(idempotencyKey)) {
    throw new Error("Invalid or missing idempotency key. Please refresh and try again.");
  }

  // 2. Check in-flight lock
  if (IN_FLIGHT_IDEMPOTENCY_LOCKS.has(idempotencyKey)) {
    throw new Error("A payment request with this idempotency token is already processing. Please do not submit twice.");
  }

  // 3. Check if transaction with this idempotency key already exists in store
  const existingTxn = (store.transactions || []).find(t => t.idempotencyKey === idempotencyKey);
  if (existingTxn) {
    if (existingTxn.status === PAYMENT_STATUSES.PAYMENT_RECEIVED || existingTxn.status === PAYMENT_STATUSES.PAYMENT_VERIFIED) {
      return {
        alreadyProcessed: true,
        transaction: existingTxn,
        message: "Payment has already been successfully verified and recorded."
      };
    }
  }

  // 4. Validate Invoice
  const invoice = (store.invoices || []).find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
  if (!invoice) {
    throw new Error(`Invoice "${invoiceId}" could not be found.`);
  }

  if (invoice.paymentStatus === INVOICE_STATUSES.PAID) {
    throw new Error("This invoice is already fully paid.");
  }

  if (invoice.paymentStatus === INVOICE_STATUSES.CANCELLED) {
    throw new Error("Cannot make payment against a cancelled invoice.");
  }

  // 5. Validate Amount against Balance Due
  const { isValid, amount: validAmount, error } = validatePaymentAmount(amount, invoice.balanceDue);
  if (!isValid) {
    throw new Error(error || "Invalid payment amount.");
  }

  // Acquire lock
  IN_FLIGHT_IDEMPOTENCY_LOCKS.add(idempotencyKey);

  try {
    const isMockMode = import.meta.env.VITE_PAYMENT_MOCK_MODE !== "false";

    if (isMockMode) {
      // Step 1: Create transaction in PAYMENT_PENDING
      const transaction = buildPaymentTransaction({
        bookingId,
        trackingToken,
        invoiceId: invoice.id,
        amount: validAmount,
        currency,
        paymentType,
        paymentMethod,
        idempotencyKey,
        payerName: sanitizeText(payerName),
        payerContact: sanitizeText(payerContact)
      });

      // Step 2: Transition to PAYMENT_PROCESSING
      transaction.status = PAYMENT_STATUSES.PAYMENT_PROCESSING;
      transaction.gatewayReference = `MOCK-RZP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const updatedStore = {
        ...store,
        transactions: [...(store.transactions || []), transaction]
      };
      saveFinancialStore(updatedStore);

      return {
        success: true,
        transactionId: transaction.transactionId,
        gatewayReference: transaction.gatewayReference,
        status: transaction.status,
        amount: validAmount,
        currency,
        isMockMode: true,
        simulationNotice: "DEVELOPMENT SIMULATION — MOCK PAYMENT (No real funds charged)."
      };
    }

    // Production API boundary
    const response = await fetch("/api/financial/payments/intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        bookingId,
        trackingToken,
        invoiceId: invoice.id,
        amount: validAmount,
        currency,
        paymentType,
        paymentMethod,
        idempotencyKey,
        payerName,
        payerContact
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || "Payment intent creation failed.");
    }

    return response.json();
  } finally {
    // Release lock after a short buffer
    setTimeout(() => {
      IN_FLIGHT_IDEMPOTENCY_LOCKS.delete(idempotencyKey);
    }, 2000);
  }
}

/**
 * Verifies a payment transaction (simulates webhook or server signature check)
 * and records it into the invoice and ledger.
 */
export async function verifyPayment(transactionId, verificationToken = "mock_valid_signature") {
  const store = getFinancialStore();
  const txns = store.transactions || [];
  const txnIndex = txns.findIndex(t => t.id === transactionId || t.transactionId === transactionId);

  if (txnIndex === -1) {
    throw new Error(`Transaction "${transactionId}" not found.`);
  }

  const transaction = txns[txnIndex];
  if (transaction.status === PAYMENT_STATUSES.PAYMENT_RECEIVED) {
    return {
      success: true,
      alreadyVerified: true,
      transaction,
      receipt: (store.receipts || []).find(r => r.transactionId === transaction.transactionId)
    };
  }

  const isMockMode = import.meta.env.VITE_PAYMENT_MOCK_MODE !== "false";

  if (isMockMode) {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Step 3: Transition to PAYMENT_VERIFIED
    transaction.status = PAYMENT_STATUSES.PAYMENT_VERIFIED;
    transaction.verifiedAt = new Date().toISOString();

    // Step 4: Finalize to PAYMENT_RECEIVED
    transaction.status = PAYMENT_STATUSES.PAYMENT_RECEIVED;
    transaction.completedAt = new Date().toISOString();
    txns[txnIndex] = transaction;

    // Update Invoice balance & status
    const invoices = store.invoices || [];
    const invoiceIndex = invoices.findIndex(i => i.id === transaction.invoiceId);
    let updatedInvoice = null;

    if (invoiceIndex !== -1) {
      const inv = invoices[invoiceIndex];
      const newPaid = inv.amountPaid + transaction.amount;
      const newBalance = Math.max(0, inv.totalAmount - newPaid);
      const newStatus = newBalance === 0 ? INVOICE_STATUSES.PAID : INVOICE_STATUSES.PARTIALLY_PAID;

      updatedInvoice = {
        ...inv,
        amountPaid: newPaid,
        balanceDue: newBalance,
        paymentStatus: newStatus,
        lastPaidAt: transaction.completedAt
      };
      invoices[invoiceIndex] = updatedInvoice;
    }

    // Generate Official Receipt
    const receipt = buildPaymentReceipt({
      transaction,
      invoice: updatedInvoice,
      remainingBalance: updatedInvoice ? updatedInvoice.balanceDue : 0
    });

    const receipts = [...(store.receipts || []), receipt];

    saveFinancialStore({
      ...store,
      transactions: txns,
      invoices,
      receipts
    });

    // Record Immutable Ledger Entry
    recordLedgerTransaction({
      bookingId: transaction.bookingId,
      trackingToken: transaction.trackingToken,
      entryType: "PAYMENT_RECEIVED",
      amount: transaction.amount,
      debitCredit: "CREDIT",
      referenceId: transaction.transactionId,
      actorId: "GATEWAY_WEBHOOK",
      actorRole: "SYSTEM",
      description: `${transaction.paymentType} payment of ₹${transaction.amount.toLocaleString("en-IN")} received via ${transaction.paymentMethod} (Ref: ${transaction.gatewayReference})`
    });

    return {
      success: true,
      transaction,
      receipt,
      invoice: updatedInvoice,
      message: "Payment successfully verified and credited."
    };
  }

  // Production API boundary
  const response = await fetch(`/api/financial/payments/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ transactionId, verificationToken })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Payment verification failed.");
  }

  return response.json();
}

/**
 * Records a manual payment (direct wire transfer, cash, or cheque) by operations.
 */
export async function recordManualPayment(bookingId, {
  invoiceId,
  amount,
  paymentMethod = "BANK_TRANSFER",
  referenceNumber = "",
  notes = "",
  actorId = "OPERATIONS_OFFICER",
  actorRole = "OPERATIONS_MANAGER"
}) {
  const store = getFinancialStore();
  const invoice = (store.invoices || []).find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  const { isValid, amount: validAmount, error } = validatePaymentAmount(amount, invoice.balanceDue);
  if (!isValid) {
    throw new Error(error || "Invalid manual payment amount.");
  }

  const cleanRef = sanitizeText(referenceNumber || `WIRE-${Date.now()}`);
  const cleanNotes = sanitizeText(notes);

  const transaction = {
    id: `TXN-MANUAL-${Date.now()}`,
    transactionId: `TXN-MANUAL-${Date.now()}`,
    idempotencyKey: `IDEMP-MANUAL-${Date.now()}`,
    invoiceId: invoice.id,
    bookingId: invoice.bookingId,
    trackingToken: invoice.trackingToken,
    amount: validAmount,
    currency: "INR",
    paymentType: validAmount >= invoice.balanceDue ? "FULL" : "PARTIAL",
    paymentMethod,
    status: PAYMENT_STATUSES.PAYMENT_RECEIVED,
    payerName: invoice.recipient?.name || "Customer",
    initiatedAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    gatewayReference: cleanRef,
    notes: cleanNotes,
    recordedBy: actorId,
    recordedByRole: actorRole,
    _isManualEntry: true,
    _isMockData: true
  };

  // Update Invoice
  const invoices = store.invoices || [];
  const invoiceIndex = invoices.findIndex(i => i.id === invoice.id);
  const newPaid = invoice.amountPaid + validAmount;
  const newBalance = Math.max(0, invoice.totalAmount - newPaid);
  const newStatus = newBalance === 0 ? INVOICE_STATUSES.PAID : INVOICE_STATUSES.PARTIALLY_PAID;

  const updatedInvoice = {
    ...invoice,
    amountPaid: newPaid,
    balanceDue: newBalance,
    paymentStatus: newStatus,
    lastPaidAt: new Date().toISOString()
  };
  invoices[invoiceIndex] = updatedInvoice;

  // Receipt
  const receipt = buildPaymentReceipt({
    transaction,
    invoice: updatedInvoice,
    remainingBalance: newBalance
  });

  saveFinancialStore({
    ...store,
    transactions: [...(store.transactions || []), transaction],
    invoices,
    receipts: [...(store.receipts || []), receipt]
  });

  // Record Ledger Entry
  recordLedgerTransaction({
    bookingId: invoice.bookingId,
    trackingToken: invoice.trackingToken,
    entryType: "PAYMENT_RECEIVED",
    amount: validAmount,
    debitCredit: "CREDIT",
    referenceId: cleanRef,
    actorId,
    actorRole,
    description: `Manual payment of ₹${validAmount.toLocaleString("en-IN")} recorded via ${paymentMethod} (Ref: ${cleanRef})`
  });

  return {
    success: true,
    transaction,
    receipt,
    invoice: updatedInvoice
  };
}

/**
 * Retrieves receipts for a booking or tracking token.
 */
export function getReceipts(identifier) {
  if (!identifier) return [];
  const store = getFinancialStore();
  const clean = identifier.trim().toUpperCase();

  return (store.receipts || [])
    .filter(r => r.bookingId?.toUpperCase() === clean || r.trackingToken?.toUpperCase() === clean)
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
}

/**
 * Retrieves transactions for a booking or tracking token.
 */
export function getTransactions(identifier) {
  if (!identifier) return [];
  const store = getFinancialStore();
  const clean = identifier.trim().toUpperCase();

  return (store.transactions || [])
    .filter(t => t.bookingId?.toUpperCase() === clean || t.trackingToken?.toUpperCase() === clean)
    .sort((a, b) => new Date(b.initiatedAt) - new Date(a.initiatedAt));
}
