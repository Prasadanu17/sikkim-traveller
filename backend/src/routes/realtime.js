/**
 * backend/src/routes/realtime.js
 * Realtime weather and advisory routes.
 * Proxies Open-Meteo — API keys stay server-side only.
 */

import { Router } from 'express';
import { generalRateLimit } from '../middleware/security.js';
import * as realtimeController from '../controllers/realtimeController.js';

const router = Router();

/** GET /api/realtime/weather?dest=:slug — Weather for a destination */
router.get('/weather', generalRateLimit, realtimeController.getWeather);

/** GET /api/realtime/advisories — Travel advisories */
router.get('/advisories', generalRateLimit, realtimeController.getAdvisories);

export default router;
