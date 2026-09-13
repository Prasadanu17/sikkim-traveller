/**
 * backend/src/routes/customer.js
 * All customer-facing API routes.
 * Matches contracts expected by existing frontend customerAPIGateway.js
 */

import { Router } from 'express';
import { customerAuth } from '../middleware/auth.js';
import { tokenVerifyRateLimit, journeyCreateRateLimit, paymentRateLimit } from '../middleware/security.js';
import * as journeyController    from '../controllers/journeyController.js';
import * as tokenController      from '../controllers/tokenController.js';
import * as proposalController   from '../controllers/proposalController.js';
import * as paymentController    from '../controllers/paymentController.js';
import * as documentController   from '../controllers/documentController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as changeRequestController from '../controllers/changeRequestController.js';
import * as permitController     from '../controllers/permitController.js';
import * as realtimeController   from '../controllers/realtimeController.js';
import * as sessionController    from '../controllers/sessionController.js';

const router = Router();

// ── UNAUTHENTICATED ──────────────────────────────────────────────────────────

/** POST /api/customer/journeys — Create new journey (from AI Planner) */
router.post('/journeys', journeyCreateRateLimit, journeyController.createJourney);

/** POST /api/customer/verify-token — Verify journey access token */
router.post('/verify-token', tokenVerifyRateLimit, tokenController.verifyToken);

// ── AUTHENTICATED (requires valid journey access token) ──────────────────────

/** GET /api/customer/journey — Get authorized journey (IDOR: journeyId from token) */
router.get('/journey', customerAuth, journeyController.getJourney);

/** POST /api/customer/session/revoke — Revoke active session */
router.post('/session/revoke', customerAuth, sessionController.revokeSession);

/** GET /api/customer/proposal — Get latest versioned proposal */
router.get('/proposal', customerAuth, proposalController.getProposal);

/** POST /api/customer/proposal/approve — Approve proposal (version-verified) */
router.post('/proposal/approve', customerAuth, proposalController.approveProposal);

/** GET /api/customer/payments — Get payment history */
router.get('/payments', customerAuth, paymentController.getPayments);

/** POST /api/customer/payments/create — Create Razorpay payment order */
router.post('/payments/create', customerAuth, paymentRateLimit, paymentController.createPayment);

/** POST /api/customer/payments/webhook — Razorpay webhook (no auth, raw body) */
router.post('/payments/webhook', paymentController.handleWebhook);

/** GET /api/customer/documents — Get document list */
router.get('/documents', customerAuth, documentController.getDocuments);

/** GET /api/customer/documents/:id/download — Get signed download URL */
router.get('/documents/:id/download', customerAuth, documentController.getSignedUrl);

/** GET /api/customer/notifications — Get in-app notifications */
router.get('/notifications', customerAuth, notificationController.getNotifications);

/** GET /api/customer/notifications/preferences — Get notification preferences */
router.get('/notifications/preferences', customerAuth, notificationController.getPreferences);

/** PUT /api/customer/notifications/preferences — Update notification preferences */
router.put('/notifications/preferences', customerAuth, notificationController.updatePreferences);

/** GET /api/customer/permits — Get permit status */
router.get('/permits', customerAuth, permitController.getPermits);

/** GET /api/customer/change-requests — Get change request history */
router.get('/change-requests', customerAuth, changeRequestController.getChangeRequests);

/** POST /api/customer/change-requests — Submit new change request */
router.post('/change-requests', customerAuth, changeRequestController.submitChangeRequest);

/** GET /api/customer/realtime — Get realtime weather/advisory for trip */
router.get('/realtime', customerAuth, realtimeController.getCustomerRealtime);

export default router;
