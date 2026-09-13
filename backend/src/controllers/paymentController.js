/**
 * backend/src/controllers/paymentController.js
 */

import * as paymentService from '../services/customer/paymentService.js';

export async function getPayments(req, res, next) {
  try {
    const data = await paymentService.getPayments(req.customer.journeyId);
    return res.json({ success: true, ...data });
  } catch (err) { next(err); }
}

export async function createPayment(req, res, next) {
  try {
    const { milestone, amount } = req.body;
    if (!milestone || !amount) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'milestone and amount are required.' } });
    }
    const result = await paymentService.createPaymentIntent(req.customer.journeyId, milestone, amount);
    return res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
}

/** Webhook — raw body required for Razorpay signature verification */
export async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody; // set by express.raw() middleware on this route
    const payload = req.body;

    const result = await paymentService.handleWebhook(rawBody || JSON.stringify(payload), signature, payload);
    return res.json(result);
  } catch (err) { next(err); }
}
