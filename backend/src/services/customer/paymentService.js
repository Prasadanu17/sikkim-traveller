/**
 * backend/src/services/customer/paymentService.js
 * Razorpay payment service — provider-abstracted, webhook-verified.
 *
 * SECURITY RULE: Frontend payment "success" is NEVER trusted.
 * All payment confirmation is based on server-side Razorpay webhook verification.
 */

import crypto from 'crypto';
import prisma from '../../config/database.js';
import { auditLog, AUDIT_ACTIONS } from '../../audit/auditLogger.js';
import env from '../../config/env.js';

// Lazy-load Razorpay to avoid startup crash if not configured
let razorpayInstance = null;
async function getRazorpay() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(new Error('Payment gateway not configured.'), { status: 503, code: 'PAYMENT_UNAVAILABLE' });
  }
  if (!razorpayInstance) {
    // Dynamic import to support ESM
    const Razorpay = (await import('razorpay')).default;
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

/**
 * Gets payment history for an authorized journey.
 * @param {string} journeyId - From authenticated session
 */
export async function getPayments(journeyId) {
  const payments = await prisma.payment.findMany({
    where: { journeyId },
    orderBy: { createdAt: 'desc' },
    include: { invoice: true }
  });

  const totalInvoiced = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalInvoiced - totalPaid;

  return {
    payments: payments.map(p => ({
      id: p.id,
      milestone: p.milestone,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt?.toISOString(),
      razorpayPaymentId: p.razorpayPaymentId, // safe to expose
      invoice: p.invoice ? {
        id: p.invoice.id,
        invoiceNo: p.invoice.invoiceNo,
        total: p.invoice.total,
        issuedAt: p.invoice.issuedAt.toISOString(),
      } : null,
    })),
    summary: {
      totalInvoiced,
      totalPaid,
      remaining,
      currency: 'INR',
    }
  };
}

/**
 * Creates a Razorpay payment order.
 * @param {string} journeyId - From authenticated session
 * @param {string} milestone - ADVANCE_DEPOSIT | MIDPOINT_PAYMENT | FINAL_PAYMENT
 * @param {number} amount - In INR
 */
export async function createPaymentIntent(journeyId, milestone, amount) {
  if (!amount || amount <= 0) {
    throw Object.assign(new Error('Invalid payment amount.'), { status: 400, code: 'VALIDATION_ERROR' });
  }

  const rz = await getRazorpay();
  const amountPaise = Math.round(amount * 100); // Razorpay uses paise

  const order = await rz.orders.create({
    amount: amountPaise,
    currency: 'INR',
    notes: {
      journeyId: journeyId.substring(0, 40), // Safe to include — not a secret
      milestone,
    }
  });

  // Create pending payment record
  const payment = await prisma.payment.create({
    data: {
      journeyId,
      milestone,
      amount,
      currency: 'INR',
      status: 'PENDING',
      razorpayOrderId: order.id,
    }
  });

  await auditLog({
    journeyId,
    action: AUDIT_ACTIONS.PAYMENT_CREATED,
    newValue: `${milestone}: ₹${amount}`,
    message: `Razorpay order ${order.id} created`,
  });

  return {
    orderId: order.id,
    amount: amountPaise,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID, // Public key — safe to send to frontend
    paymentId: payment.id,
  };
}

/**
 * Verifies Razorpay webhook signature and marks payment as COMPLETED.
 * This is the AUTHORITATIVE payment confirmation path.
 *
 * @param {string} rawBody - Raw webhook body string (for signature verification)
 * @param {string} signature - X-Razorpay-Signature header
 * @param {object} payload - Parsed webhook payload
 */
export async function handleWebhook(rawBody, signature, payload) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw Object.assign(new Error('Webhook secret not configured.'), { status: 500, code: 'CONFIG_ERROR' });
  }

  // Verify HMAC-SHA256 signature
  const expectedSig = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSig) {
    await auditLog({
      action: AUDIT_ACTIONS.PAYMENT_FAILED,
      message: 'Razorpay webhook signature mismatch — rejected',
    });
    throw Object.assign(new Error('Invalid webhook signature.'), { status: 400, code: 'INVALID_SIGNATURE' });
  }

  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;

  if (!paymentEntity) return { acknowledged: true };

  const orderId = paymentEntity.order_id;
  const razorpayPaymentId = paymentEntity.id;
  const razorpaySignature = paymentEntity.signature || '';

  if (event === 'payment.captured') {
    // Find the pending payment by order ID
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (!payment) return { acknowledged: true }; // Idempotent

    if (payment.status === 'COMPLETED') return { acknowledged: true }; // Already processed

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId,
          razorpaySignature,
          webhookVerified: true,
          paidAt: new Date(),
        }
      });

      await tx.auditLog.create({
        data: {
          journeyId: payment.journeyId,
          action: AUDIT_ACTIONS.PAYMENT_VERIFIED,
          newValue: `₹${payment.amount} — ${payment.milestone}`,
          message: `Razorpay payment ${razorpayPaymentId} verified via webhook`,
        }
      });
    });
  }

  if (event === 'payment.failed') {
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: paymentEntity.error_description }
      });
    }
  }

  return { acknowledged: true };
}
