/**
 * backend/src/config/env.js
 * Validates all required environment variables at startup.
 * The server refuses to start if critical variables are missing.
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:                      z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT:                          z.string().default('3001'),
  FRONTEND_URL:                  z.string().default('http://localhost:5173'),
  CORS_ORIGIN:                   z.string().default('http://localhost:5173'),
  DATABASE_URL:                  z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL:                    z.string().optional(),
  SUPABASE_URL:                  z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY:     z.string().optional(),
  SUPABASE_STORAGE_BUCKET:       z.string().default('sikkim-traveller-documents'),
  CUSTOMER_TOKEN_PEPPER:         z.string().min(32, 'CUSTOMER_TOKEN_PEPPER must be at least 32 chars'),
  CUSTOMER_TOKEN_HASH_ALGORITHM: z.string().default('sha256'),
  OPS_SESSION_SECRET:            z.string().min(32, 'OPS_SESSION_SECRET must be at least 32 chars'),
  JOURNEY_TOKEN_EXPIRY_DAYS:     z.coerce.number().default(365),
  SESSION_EXPIRY_HOURS:          z.coerce.number().default(24),
  RAZORPAY_KEY_ID:               z.string().optional(),
  RAZORPAY_KEY_SECRET:           z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET:       z.string().optional(),
  OPEN_METEO_BASE_URL:           z.string().default('https://api.open-meteo.com/v1'),
  WEATHER_CACHE_TTL_MINUTES:     z.coerce.number().default(30),
  GEMINI_API_KEY:                z.string().optional(),
  GEMINI_MODEL:                  z.string().default('gemini-2.5-flash'),
  AI_RATE_LIMIT_WINDOW_MS:       z.coerce.number().default(60000),
  AI_RATE_LIMIT_MAX_REQUESTS:    z.coerce.number().default(20),
  RATE_LIMIT_WINDOW_MS:          z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS:       z.coerce.number().default(60),
  LOG_LEVEL:                     z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

let env;

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch (_) {}
}

// Pre-normalize environment variable aliases before Zod validation
const rawEnv = {
  ...process.env,
  PORT: process.env.PORT || process.env.API_PORT || '3001',
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173',
  CUSTOMER_TOKEN_PEPPER: process.env.CUSTOMER_TOKEN_PEPPER || process.env.CUSTOMER_TOKEN_HMAC_SECRET,
  OPS_SESSION_SECRET: process.env.OPS_SESSION_SECRET || process.env.SESSION_SECRET
};

try {
  // If in test mode, merge defaults first so missing env vars don't throw ZodError
  if (process.env.NODE_ENV === 'test') {
    env = envSchema.parse({
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      CUSTOMER_TOKEN_PEPPER: 'test-pepper-64-character-length-very-long-secret-key-salt-pepper',
      OPS_SESSION_SECRET: 'test-ops-secret-64-character-length-very-long-signing-key-secret',
      RAZORPAY_WEBHOOK_SECRET: 'test-razorpay-webhook-secret-long-key',
      ...rawEnv
    });
  } else {
    env = envSchema.parse(rawEnv);
  }
} catch (err) {
  console.error('[Config] ❌ Environment validation failed:');
  err.errors?.forEach(e => console.error(`  - ${e.path.join('.')}: ${e.message}`));
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export default env;
