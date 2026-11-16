/**
 * backend/src/app.js
 * Express Application setup and routing entry point.
 */

import express from 'express';
import { helmetMiddleware, corsMiddleware } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import customerRoutes from './routes/customer.js';
import operationsRoutes from './routes/operations.js';
import realtimeRoutes from './routes/realtime.js';
import aiRoutes from './routes/ai.js';

const app = express();

// Enable raw body parsing for Razorpay Webhooks (needs raw body buffer for verification)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/customer/payments/webhook') {
    express.raw({ type: 'application/json' })(req, res, (err) => {
      if (err) return next(err);
      if (Buffer.isBuffer(req.body)) {
        req.rawBody = req.body.toString('utf8');
        try {
          req.body = JSON.parse(req.rawBody);
        } catch (_) {
          req.body = {};
        }
      }
      next();
    });
  } else {
    express.json({ limit: '100kb' })(req, res, next);
  }
});

// Parse urlencoded bodies
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Apply security headers and CORS policy
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Mount production routes
app.use('/api', aiRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/realtime', realtimeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// Readiness probe endpoint
app.get('/ready', (req, res) => {
  res.json({ status: 'READY', timestamp: new Date().toISOString() });
});

// Handle unknown routes
app.use(notFoundHandler);

// Handle global exceptions / normalize stack traces
app.use(errorHandler);

export default app;
