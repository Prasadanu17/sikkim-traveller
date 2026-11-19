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
import { prisma } from './config/database.js';

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
app.options('*', corsMiddleware);

// Mount production routes
app.use('/api', aiRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/realtime', realtimeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// Readiness probe endpoint — executes real database query
app.get('/ready', async (req, res) => {
  try {
    if (typeof prisma.$queryRaw === 'function') {
      await prisma.$queryRaw`SELECT 1`;
    } else if (typeof prisma.$connect === 'function') {
      await prisma.$connect();
    }
    res.status(200).json({
      status: 'READY',
      database: 'CONNECTED',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'NOT_READY',
      database: 'DISCONNECTED',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Handle unknown routes
app.use(notFoundHandler);

// Handle global exceptions / normalize stack traces
app.use(errorHandler);

export default app;
