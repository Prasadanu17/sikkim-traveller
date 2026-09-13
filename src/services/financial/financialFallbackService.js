/**
 * Financial Fallback Service — Module 12
 * LocalStorage mock persistence for invoices, payments, receipts, refunds, and ledger entries.
 * Storage key: st_financial_mock_v1
 * All records tagged with _isMockData: true.
 */

const STORAGE_KEY = "st_financial_mock_v1";

const SEED_FINANCIAL_DATA = {
  invoices: [
    // 1. Rahul Sharma (ST-TRK-88219 / ST-REQ-2026-0042)
    {
      id: "INV-ST-REQ-2026-0042-1",
      invoiceNumber: "ST-INV-2026-1042",
      version: 1,
      versionLabel: "Invoice v1",
      bookingId: "ST-REQ-2026-0042",
      trackingToken: "ST-TRK-88219",
      quoteId: "Q-001",
      proposalVersion: 2,
      items: [
        { id: "ITEM-1", description: "5 Nights Premium Accommodations (Gangtok & Lachung)", category: "Stay", quantity: 1, unitPrice: 22000, total: 22000 },
        { id: "ITEM-2", description: "Private Toyota Innova Crysta with Mountain Specialist Driver", category: "Transport", quantity: 1, unitPrice: 15524, total: 15524 },
        { id: "ITEM-3", description: "North Sikkim Protected Area Permits & Environmental Cess", category: "Permits", quantity: 2, unitPrice: 1000, total: 2000 }
      ],
      subtotal: 39524,
      taxRate: 0.05,
      taxAmount: 1976,
      cgstAmount: 988,
      sgstAmount: 988,
      totalAmount: 41500,
      currency: "INR",
      advanceRequired: 12450,
      amountPaid: 0,
      balanceDue: 41500,
      paymentStatus: "UNPAID",
      issuedAt: "2026-08-20T10:30:00Z",
      issuedBy: "Ankit Kumar",
      issuedByRole: "OPERATIONS_MANAGER",
      dueDate: "2026-09-02",
      recipient: { name: "Rahul Sharma", email: "rahul.s@example.com", phone: "+91 98765 43210" },
      notes: "Payment terms: 30% advance deposit (₹12,450) locks luxury suite and vehicle allotments. Balance due 7 days before journey.",
      _isMockData: true
    },

    // 2. Vikram Mehta (ST-TRK-44912 / ST-REQ-2026-0015 - Confirmed)
    {
      id: "INV-ST-REQ-2026-0015-1",
      invoiceNumber: "ST-INV-2026-1015",
      version: 1,
      versionLabel: "Invoice v1",
      bookingId: "ST-REQ-2026-0015",
      trackingToken: "ST-TRK-44912",
      quoteId: "Q-003",
      proposalVersion: 3,
      items: [
        { id: "ITEM-11", description: "6 Nights Mayfair & Yarlam Luxury Suites (2 Suites)", category: "Stay", quantity: 1, unitPrice: 38000, total: 38000 },
        { id: "ITEM-12", description: "Dedicated 4WD Mahindra Scorpio with Mountain Driver Tenzing", category: "Transport", quantity: 1, unitPrice: 22333, total: 22333 },
        { id: "ITEM-13", description: "Nathula Pass & Lachung Military & PAP Checkpoint Clearances", category: "Permits", quantity: 4, unitPrice: 750, total: 3000 }
      ],
      subtotal: 63333,
      taxRate: 0.05,
      taxAmount: 3167,
      cgstAmount: 1583,
      sgstAmount: 1584,
      totalAmount: 66500,
      currency: "INR",
      advanceRequired: 19950,
      amountPaid: 20000,
      balanceDue: 46500,
      paymentStatus: "PARTIALLY_PAID",
      issuedAt: "2026-08-18T14:00:00Z",
      issuedBy: "Ankit Kumar",
      issuedByRole: "OPERATIONS_MANAGER",
      dueDate: "2026-08-25",
      recipient: { name: "Vikram Mehta", email: "vikram.m@example.com", phone: "+91 96543 21098" },
      notes: "Advance deposit received. Balance due before airport reception.",
      _isMockData: true
    },

    // 3. Prashant Naidu (ST-TRK-99014 / ST-REQ-2026-0003 - Completed)
    {
      id: "INV-ST-REQ-2026-0003-1",
      invoiceNumber: "ST-INV-2026-1003",
      version: 1,
      versionLabel: "Invoice v1",
      bookingId: "ST-REQ-2026-0003",
      trackingToken: "ST-TRK-99014",
      quoteId: "Q-005",
      proposalVersion: 2,
      items: [
        { id: "ITEM-21", description: "3 Nights Norbu Ghang Resort Pelling", category: "Stay", quantity: 1, unitPrice: 14000, total: 14000 },
        { id: "ITEM-22", description: "Private Sedan Chauffeur with Sightseeing", category: "Transport", quantity: 1, unitPrice: 8381, total: 8381 }
      ],
      subtotal: 22381,
      taxRate: 0.05,
      taxAmount: 1119,
      cgstAmount: 559,
      sgstAmount: 560,
      totalAmount: 23500,
      currency: "INR",
      advanceRequired: 7050,
      amountPaid: 23500,
      balanceDue: 0,
      paymentStatus: "PAID",
      issuedAt: "2026-07-02T10:00:00Z",
      issuedBy: "Meera Devi",
      issuedByRole: "OPERATIONS_MANAGER",
      dueDate: "2026-07-08",
      recipient: { name: "Prashant Naidu", email: "prashant.n@example.com", phone: "+91 95432 10987" },
      notes: "Paid in full.",
      _isMockData: true
    }
  ],

  transactions: [
    // Vikram Mehta Advance Payment
    {
      id: "TXN-MOCK-001",
      transactionId: "TXN-MOCK-001",
      idempotencyKey: "IDEMP-VIKRAM-ADV-001",
      invoiceId: "INV-ST-REQ-2026-0015-1",
      bookingId: "ST-REQ-2026-0015",
      trackingToken: "ST-TRK-44912",
      amount: 20000,
      currency: "INR",
      paymentType: "ADVANCE",
      paymentMethod: "UPI",
      status: "PAYMENT_RECEIVED",
      payerName: "Vikram Mehta",
      initiatedAt: "2026-08-18T14:30:00Z",
      verifiedAt: "2026-08-18T14:30:15Z",
      completedAt: "2026-08-18T14:30:15Z",
      gatewayReference: "MOCK-UPI-RZP-987123654",
      _isMockPayment: true,
      _isMockData: true
    },
    // Prashant Naidu Full Payment
    {
      id: "TXN-MOCK-002",
      transactionId: "TXN-MOCK-002",
      idempotencyKey: "IDEMP-PRASHANT-FULL-001",
      invoiceId: "INV-ST-REQ-2026-0003-1",
      bookingId: "ST-REQ-2026-0003",
      trackingToken: "ST-TRK-99014",
      amount: 23500,
      currency: "INR",
      paymentType: "FULL",
      paymentMethod: "CREDIT_CARD",
      status: "PAYMENT_RECEIVED",
      payerName: "Prashant Naidu",
      initiatedAt: "2026-07-03T11:15:00Z",
      verifiedAt: "2026-07-03T11:15:20Z",
      completedAt: "2026-07-03T11:15:20Z",
      gatewayReference: "MOCK-CC-STRIPE-44912883",
      _isMockPayment: true,
      _isMockData: true
    }
  ],

  receipts: [
    {
      id: "REC-TXN-MOCK-001",
      receiptNumber: "ST-REC-2026-88192",
      transactionId: "TXN-MOCK-001",
      invoiceId: "INV-ST-REQ-2026-0015-1",
      invoiceNumber: "ST-INV-2026-1015",
      bookingId: "ST-REQ-2026-0015",
      trackingToken: "ST-TRK-44912",
      amountPaid: 20000,
      currency: "INR",
      paymentType: "ADVANCE",
      paymentMethod: "UPI",
      remainingBalance: 46500,
      paidAt: "2026-08-18T14:30:15Z",
      payerName: "Vikram Mehta",
      gatewayReference: "MOCK-UPI-RZP-987123654",
      status: "ISSUED",
      downloadUrl: "#",
      _isMockReceipt: true,
      _isMockData: true
    },
    {
      id: "REC-TXN-MOCK-002",
      receiptNumber: "ST-REC-2026-11928",
      transactionId: "TXN-MOCK-002",
      invoiceId: "INV-ST-REQ-2026-0003-1",
      invoiceNumber: "ST-INV-2026-1003",
      bookingId: "ST-REQ-2026-0003",
      trackingToken: "ST-TRK-99014",
      amountPaid: 23500,
      currency: "INR",
      paymentType: "FULL",
      paymentMethod: "CREDIT_CARD",
      remainingBalance: 0,
      paidAt: "2026-07-03T11:15:20Z",
      payerName: "Prashant Naidu",
      gatewayReference: "MOCK-CC-STRIPE-44912883",
      status: "ISSUED",
      downloadUrl: "#",
      _isMockReceipt: true,
      _isMockData: true
    }
  ],

  ledgerEntries: [
    {
      id: "LEDGER-001",
      bookingId: "ST-REQ-2026-0042",
      trackingToken: "ST-TRK-88219",
      entryType: "INVOICE_ISSUED",
      amount: 41500,
      debitCredit: "DEBIT",
      runningBalance: 41500,
      referenceId: "ST-INV-2026-1042",
      actorId: "Ankit Kumar",
      actorRole: "OPERATIONS_MANAGER",
      description: "Invoice v1 issued — Total: ₹41,500 (Advance Due: ₹12,450)",
      timestamp: "2026-08-20T10:30:00Z",
      _isMockData: true
    },
    {
      id: "LEDGER-002",
      bookingId: "ST-REQ-2026-0015",
      trackingToken: "ST-TRK-44912",
      entryType: "INVOICE_ISSUED",
      amount: 66500,
      debitCredit: "DEBIT",
      runningBalance: 66500,
      referenceId: "ST-INV-2026-1015",
      actorId: "Ankit Kumar",
      actorRole: "OPERATIONS_MANAGER",
      description: "Invoice v1 issued — Total: ₹66,500",
      timestamp: "2026-08-18T14:00:00Z",
      _isMockData: true
    },
    {
      id: "LEDGER-003",
      bookingId: "ST-REQ-2026-0015",
      trackingToken: "ST-TRK-44912",
      entryType: "PAYMENT_RECEIVED",
      amount: 20000,
      debitCredit: "CREDIT",
      runningBalance: 46500,
      referenceId: "TXN-MOCK-001",
      actorId: "GATEWAY_WEBHOOK",
      actorRole: "SYSTEM",
      description: "Advance payment of ₹20,000 received via UPI (Ref: MOCK-UPI-RZP-987123654)",
      timestamp: "2026-08-18T14:30:15Z",
      _isMockData: true
    }
  ],

  refunds: []
};

// ─────────────────────────────────────────────
// STORAGE CONTROLLERS
// ─────────────────────────────────────────────

export function initFinancialStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FINANCIAL_DATA));
      return SEED_FINANCIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.invoices) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FINANCIAL_DATA));
      return SEED_FINANCIAL_DATA;
    }
    return parsed;
  } catch (_err) {
    return SEED_FINANCIAL_DATA;
  }
}

export function getFinancialStore() {
  return initFinancialStorage();
}

export function saveFinancialStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (_err) {
    console.warn("[FinancialFallback] Failed to save store to localStorage");
  }
}
