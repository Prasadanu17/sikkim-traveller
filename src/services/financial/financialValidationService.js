/**
 * Financial Validation Service — Module 12
 * Validates financial inputs: amounts, idempotency keys, invoice items, and payment methods.
 * Sanitizes all descriptions and notes to prevent injection.
 */

import { sanitizeText } from "../customer/customerPortalSanitizationService";

export const PAYMENT_METHODS = [
  "UPI",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "NET_BANKING",
  "BANK_TRANSFER",
  "CASH"
];

export const PAYMENT_TYPES = [
  "ADVANCE",
  "PARTIAL",
  "FINAL_BALANCE",
  "FULL"
];

/**
 * Validates an amount value (must be a positive number up to max allowed).
 * @param {number|string} amount
 * @param {number} maxAllowed
 * @returns {object} { isValid: boolean, amount: number, error?: string }
 */
export function validatePaymentAmount(amount, maxAllowed = 10000000) {
  const num = typeof amount === "number" ? amount : parseFloat(amount);

  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, amount: 0, error: "Please enter a valid numeric payment amount." };
  }

  if (num <= 0) {
    return { isValid: false, amount: 0, error: "Payment amount must be greater than zero." };
  }

  if (num > maxAllowed) {
    return { isValid: false, amount: num, error: `Payment amount exceeds maximum allowable balance (₹${maxAllowed.toLocaleString("en-IN")}).` };
  }

  // Round to nearest integer (paisa precision not needed for whole INR travel packages)
  return { isValid: true, amount: Math.round(num) };
}

/**
 * Validates an idempotency key.
 * @param {string} key
 * @returns {boolean}
 */
export function validateIdempotencyKey(key) {
  if (!key || typeof key !== "string") return false;
  const clean = key.trim();
  return clean.length >= 10 && clean.length <= 64;
}

/**
 * Validates invoice line items.
 * @param {Array} items
 * @returns {object} { isValid: boolean, sanitizedItems: Array, subtotal: number, error?: string }
 */
export function validateInvoiceItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, sanitizedItems: [], subtotal: 0, error: "Invoice must contain at least one line item." };
  }

  let subtotal = 0;
  const sanitizedItems = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const desc = sanitizeText(item.description || item.title || `Item ${i + 1}`);
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const unitPrice = Math.max(0, parseFloat(item.unitPrice || item.price || item.amount) || 0);
    const lineTotal = Math.round(qty * unitPrice);

    if (unitPrice < 0) {
      return { isValid: false, sanitizedItems: [], subtotal: 0, error: `Invalid unit price for item "${desc}".` };
    }

    subtotal += lineTotal;
    sanitizedItems.push({
      id: item.id || `ITEM-${i + 1}`,
      description: desc,
      category: item.category || "Tour Package",
      quantity: qty,
      unitPrice: Math.round(unitPrice),
      total: lineTotal
    });
  }

  return { isValid: true, sanitizedItems, subtotal };
}
