/**
 * backend/src/middleware/security.js
 * Security middleware — Helmet, CORS, rate limiting, request size limits.
 */

import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import env from '../config/env.js';

/** Allowed origins from CORS_ORIGIN env var (comma-separated) */
const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", ...allowedOrigins],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Supabase Storage
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, curl in dev)
    if (!origin && env.NODE_ENV === 'development') return callback(null, true);
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Ops-Token', 'X-Ops-Mock', 'X-Ops-Role', 'X-Ops-User-Id', 'Idempotency-Key'],
});

/** General API rate limit */
export const generalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } }
});

/** Strict limit for token verification — prevents brute force */
export const tokenVerifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many verification attempts. Please wait before trying again.' } },
  keyGenerator: (req) => req.ip
});

/** Strict limit for journey creation */
export const journeyCreateRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many journey creation requests.' } },
  keyGenerator: (req) => req.ip
});

/** Strict limit for payment endpoints */
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many payment requests.' } }
});

/** Endpoint-specific rate limiter for AI generation and Copilot */
export const aiRateLimit = rateLimit({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS || 60000,
  max: env.AI_RATE_LIMIT_MAX_REQUESTS || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'AI request limit reached. Please wait before generating again.' } },
  keyGenerator: (req) => req.ip
});
