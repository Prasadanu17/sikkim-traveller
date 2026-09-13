/**
 * backend/src/routes/operations.js
 * Operations Command Center API routes — RBAC protected.
 */

import { Router } from 'express';
import { opsAuth, requirePermission } from '../middleware/opsAuth.js';
import * as opsController from '../controllers/operationsController.js';

const router = Router();

// All operations routes require opsAuth
router.use(opsAuth);

/** GET /api/operations/journeys — Operations inbox */
router.get('/journeys', requirePermission('canViewInbox'), opsController.listJourneys);

/** GET /api/operations/journeys/:id — Booking detail */
router.get('/journeys/:id', requirePermission('canViewBookingDetail'), opsController.getJourney);

/** POST /api/operations/journeys/:id/status — Status transition */
router.post('/journeys/:id/status', requirePermission('canChangeStatus'), opsController.updateStatus);

/** POST /api/operations/quotes — Create quote */
router.post('/quotes', requirePermission('canAddQuote'), opsController.createQuote);

/** POST /api/operations/proposals — Create/publish proposal */
router.post('/proposals', requirePermission('canSendProposal'), opsController.createProposal);

/** POST /api/operations/change-requests/:id/review — Approve/decline change request */
router.post('/change-requests/:id/review', requirePermission('canEditBooking'), opsController.reviewChangeRequest);

/** POST /api/operations/journeys/:id/notes — Add internal note */
router.post('/journeys/:id/notes', requirePermission('canAddInternalNote'), opsController.addNote);

/** GET /api/operations/journeys/:id/audit — Audit log (admin/manager only) */
router.get('/journeys/:id/audit', requirePermission('canViewAuditLog'), opsController.getAuditLog);

/** POST /api/operations/auth/token — Get ops session token (dev: accepts mock headers) */
router.post('/auth/token', opsController.getOpsToken);

export default router;
