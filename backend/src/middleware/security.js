/**
 * backend/src/middleware/security.js
 * Security middleware — Helmet, CORS, rate limiting, request size limits.
 */

import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import env from '../config/env.js';

/** Allowed origins from CORS_ORIGIN env var (comma-separated, normalized without trailing slash) */
const normalizeOrigin = (o) => (o ? o.trim().replace(/\/+$/, '') : '');
const allowedOrigins = env.CORS_ORIGIN.split(',').map(normalizeOrigin).filter(Boolean);

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
    // Allow non-browser requests with no origin (e.g., Postman, health probes, curl)
    if (!origin) return callback(null, true);
    const cleanOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    const err = new Error(`CORS: origin ${origin} not allowed by security policy.`);
    err.status = 403;
    err.code = 'CORS_FORBIDDEN';
    callback(err);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Ops-Token',
    'X-Ops-Mock',
    'X-Ops-Role',
    'X-Ops-User-Id',
    'Idempotency-Key',
    'X-Idempotency-Key',
    'Last-Event-ID',
    'Cache-Control',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Type', 'Authorization', 'X-Total-Count', 'X-Idempotency-Key'],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 204
});

/**
 * Helper: Secure cookie configuration for cross-domain staging and production deployments.
 * Enforces SameSite=None and Secure for separate-domain architectures (e.g. staging frontend + api backend).
 */
export function getSecureCookieOptions(custom = {}) {
  const isCrossDomain = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';
  return {
    httpOnly: true,
    secure: isCrossDomain,
    sameSite: isCrossDomain ? 'none' : 'lax',
    path: '/',
    maxAge: (env.SESSION_EXPIRY_HOURS || 24) * 3600 * 1000,
    ...custom
  };
}

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
