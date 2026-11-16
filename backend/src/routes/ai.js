/**
 * backend/src/routes/ai.js
 * AI endpoints powering the AI Trip Planner and Trip Copilot.
 * Protected with dedicated rate-limiting and request validation.
 */

import { Router } from 'express';
import { aiRateLimit } from '../middleware/security.js';
import {
  handleGenerateItinerary,
  handleRefineItinerary,
  handleCopilot
} from '../controllers/aiController.js';

const router = Router();

/** POST /api/generate-itinerary — Generate day-by-day Sikkim trip itinerary */
router.post('/generate-itinerary', aiRateLimit, handleGenerateItinerary);

/** POST /api/refine-itinerary — Refine or patch existing itinerary */
router.post('/refine-itinerary', aiRateLimit, handleRefineItinerary);

/** POST /api/copilot — Conversational Copilot assistant */
router.post('/copilot', aiRateLimit, handleCopilot);

export default router;

