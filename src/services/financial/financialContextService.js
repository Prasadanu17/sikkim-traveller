/**
 * Financial Context Service — Module 12
 * Defines data structures, status pipelines, tax engines, and financial lifecycle states.
 * Follows strict payment pipeline:
 * PAYMENT_PENDING → PAYMENT_PROCESSING → PAYMENT_VERIFIED → PAYMENT_RECEIVED
 */

// ─────────────────────────────────────────────
// PAYMENT STATUS DEFINITIONS
// ─────────────────────────────────────────────

export const PAYMENT_STATUSES = {
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_PROCESSING: "PAYMENT_PROCESSING",
  PAYMENT_VERIFIED: "PAYMENT_VERIFIED",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED"
};

export const PAYMENT_STATUS_META = {
  PAYMENT_PENDING: {
    label: "Payment Pending",
    description: "Awaiting payment initiation.",
    color: "amber",
    badgeClass: "bg-amber-950/60 text-amber-300 border-amber-700/50"
  },
  PAYMENT_PROCESSING: {
    label: "Processing Payment",
    description: "Transaction initiated with payment gateway.",
    color: "cyan",
    badgeClass: "bg-cyan-950/60 text-cyan-300 border-cyan-700/50"
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    description: "Cryptographic signature / webhook verified.",
    color: "lime",
    badgeClass: "bg-lime-950/60 text-lime-300 border-lime-700/50"
  },
  PAYMENT_RECEIVED: {
    label: "Payment Received",
    description: "Funds received and credited to booking ledger.",
    color: "emerald",
    badgeClass: "bg-emerald-950/60 text-emerald-200 border-emerald-600/60"
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    description: "Gateway declined or authorization timed out.",
    color: "rose",
    badgeClass: "bg-rose-950/60 text-rose-300 border-rose-700/50"
  },
  REFUNDED: {
    label: "Fully Refunded",
    description: "Funds returned to traveler.",
    color: "purple",
    badgeClass: "bg-purple-950/60 text-purple-300 border-purple-700/50"
  },
  PARTIALLY_REFUNDED: {
    label: "Partially Refunded",
    description: "Partial refund issued against transaction.",
    color: "purple",
    badgeClass: "bg-purple-950/60 text-purple-300 border-purple-700/50"
  }
};

export const INVOICE_STATUSES = {
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED"
};

export const INVOICE_STATUS_META = {
  UNPAID: { label: "Unpaid", badgeClass: "bg-amber-950/60 text-amber-300 border-amber-800" },
  PARTIALLY_PAID: { label: "Partially Paid", badgeClass: "bg-blue-950/60 text-blue-300 border-blue-800" },
  PAID: { label: "Fully Paid", badgeClass: "bg-emerald-950/60 text-emerald-300 border-emerald-800" },
  OVERDUE: { label: "Overdue", badgeClass: "bg-rose-950/60 text-rose-300 border-rose-800" },
  CANCELLED: { label: "Cancelled", badgeClass: "bg-slate-800 text-slate-400 border-slate-700" }
};

// Standard GST on Tour Packages in India is 5%
export const TOUR_PACKAGE_GST_RATE = 0.05;

// ─────────────────────────────────────────────
// DATA BUILDERS
// ─────────────────────────────────────────────

/**
 * Builds an Invoice model.
 */
export function buildInvoice({
  bookingId,
  trackingToken,
  versionNumber = 1,
  quoteId = null,
  proposalVersion = 1,
  items = [],
  taxRate = TOUR_PACKAGE_GST_RATE,
  issuedBy = "Sikkim Operations Desk",
  issuedByRole = "OPERATIONS_MANAGER",
  recipient = {},
  dueDate = null,
  notes = ""
}) {
  const invoiceId = `INV-${bookingId.replace(/[^A-Za-z0-9]/g, "")}-${versionNumber}`;
  const invoiceNumber = `ST-INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  let subtotal = 0;
  const sanitizedItems = items.map((item, idx) => {
    const qty = item.quantity || 1;
    const unitPrice = item.unitPrice || 0;
    const lineTotal = qty * unitPrice;
    subtotal += lineTotal;
    return {
      id: item.id || `ITEM-${idx + 1}`,
      description: item.description || "Himalayan Tour Package Arrangement",
      category: item.category || "Tour Package",
      quantity: qty,
      unitPrice,
      total: lineTotal
    };
  });

  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  // Advance deposit requirement (typically 30% of total)
  const advanceRequired = Math.round(totalAmount * 0.30);

  return {
    id: invoiceId,
    invoiceNumber,
    version: versionNumber,
    versionLabel: `Invoice v${versionNumber}`,
    bookingId,
    trackingToken,
    quoteId,
    proposalVersion,
    items: sanitizedItems,
    subtotal,
    taxRate,
    taxAmount,
    cgstAmount: Math.round(taxAmount / 2),
    sgstAmount: Math.round(taxAmount / 2),
    totalAmount,
    currency: "INR",
    advanceRequired,
    amountPaid: 0,
    balanceDue: totalAmount,
    paymentStatus: INVOICE_STATUSES.UNPAID,
    issuedAt: new Date().toISOString(),
    issuedBy,
    issuedByRole,
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    recipient: {
      name: recipient.name || "Traveler",
      email: recipient.email || "",
      phone: recipient.phone || ""
    },
    notes: notes || "Payment terms: 30% deposit to confirm hotel and vehicle allotments. Balance due 10 days before departure.",
    terms: "All payments are subject to Sikkim Department of Tourism travel policies. Protected Area Permits are filed upon advance clearance."
  };
}

/**
 * Builds a Payment Intent / Transaction record.
 */
export function buildPaymentTransaction({
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
  const transactionId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  return {
    id: transactionId,
    transactionId,
    idempotencyKey,
    invoiceId,
    bookingId,
    trackingToken,
    amount: Math.round(amount),
    currency,
    paymentType,
    paymentMethod,
    status: PAYMENT_STATUSES.PAYMENT_PENDING,
    payerName,
    payerContact,
    initiatedAt: new Date().toISOString(),
    verifiedAt: null,
    completedAt: null,
    gatewayReference: null,
    _isMockPayment: true,
    simulationNotice: "DEVELOPMENT SIMULATION — MOCK PAYMENT (No real funds charged)."
  };
}

/**
 * Builds a Payment Receipt.
 */
export function buildPaymentReceipt({
  transaction,
  invoice,
  booking,
  remainingBalance
}) {
  const receiptNumber = `ST-REC-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;

  return {
    id: `REC-${transaction.transactionId}`,
    receiptNumber,
    transactionId: transaction.transactionId,
    invoiceId: invoice?.id || transaction.invoiceId,
    invoiceNumber: invoice?.invoiceNumber || "ST-INV-CURRENT",
    bookingId: transaction.bookingId,
    trackingToken: transaction.trackingToken,
    amountPaid: transaction.amount,
    currency: transaction.currency || "INR",
    paymentType: transaction.paymentType,
    paymentMethod: transaction.paymentMethod,
    remainingBalance: Math.max(0, remainingBalance),
    paidAt: transaction.completedAt || new Date().toISOString(),
    payerName: transaction.payerName || booking?.customer?.firstName || "Traveler",
    gatewayReference: transaction.gatewayReference || `MOCK-RZP-${Date.now()}`,
    status: "ISSUED",
    downloadUrl: "#",
    _isMockReceipt: true
  };
}

/**
 * Builds a Financial Ledger Entry (Append-only).
 */
export function buildLedgerEntry({
  bookingId,
  trackingToken,
  entryType, // INVOICE_ISSUED | PAYMENT_RECEIVED | REFUND_PROCESSED | INVOICE_CANCELLED
  amount,
  debitCredit = "CREDIT",
  runningBalance = 0,
  referenceId,
  actorId = "SYSTEM",
  actorRole = "SYSTEM",
  description = ""
}) {
  return {
    id: `LEDGER-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    bookingId,
    trackingToken,
    entryType,
    amount: Math.round(amount),
    debitCredit,
    runningBalance: Math.round(runningBalance),
    referenceId,
    actorId,
    actorRole,
    description,
    timestamp: new Date().toISOString()
  };
}
