/**
 * backend/src/controllers/journeyController.js
 */

import { createJourney as createJourneyService, getCustomerSafeJourney } from '../services/customer/journeyService.js';

export async function createJourney(req, res, next) {
  try {
    const idempotencyKey = req.headers['idempotency-key'] || null;
    const { plannerState, travelerInfo, preferences } = req.body;

    const result = await createJourneyService({ plannerState, travelerInfo, preferences, idempotencyKey });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getJourney(req, res, next) {
  try {
    // IDOR: journeyId ALWAYS comes from req.customer (verified token), never from browser
    const journey = await getCustomerSafeJourney(req.customer.journeyId);
    if (!journey) return res.status(404).json({ authorized: false, message: 'Journey not found.' });
    return res.json({ success: true, authorized: true, journey });
  } catch (err) {
    next(err);
  }
}
