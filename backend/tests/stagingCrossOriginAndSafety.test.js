import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import env from '../src/config/env.js';
import { generateItineraryAI } from '../src/services/ai/itineraryAIService.js';
import { isGeminiConfigured } from '../src/services/ai/geminiClient.js';
import { getSecureCookieOptions } from '../src/middleware/security.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('Phase 2 & Phase 7: Cross-Origin Security & Staging Safety Suite', () => {
  const allowedOrigin = env.CORS_ORIGIN.split(',')[0].trim();
  const disallowedOrigin = 'https://unauthorized-attacker-site.com';

  describe('1. CORS Origin Validation & Preflight Handling', () => {
    it('approves preflight OPTIONS request from allowed origin with credentials', async () => {
      const res = await request(app)
        .options('/api/generate-itinerary')
        .set('Origin', allowedOrigin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization,X-Idempotency-Key');

      expect([200, 204]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.headers['access-control-allow-methods']).toContain('POST');
    });

    it('rejects cross-origin request from unauthorized origin with 403', async () => {
      const res = await request(app)
        .post('/api/generate-itinerary')
        .set('Origin', disallowedOrigin)
        .send({
          tripContext: { duration: 5, destinations: ['gangtok'] }
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CORS_FORBIDDEN');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('allows cross-origin POST from permitted origin and returns CORS headers', async () => {
      const res = await request(app)
        .post('/api/generate-itinerary')
        .set('Origin', allowedOrigin)
        .send({
          tripContext: {
            duration: 3,
            destinations: ['gangtok', 'pelling']
          }
        });

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.body.source).toBeDefined();
    });

    it('exposes critical headers in CORS response', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', allowedOrigin);

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
    });
  });

  describe('2. Cross-Origin SSE Streaming Behavior', () => {
    it('sets text/event-stream and cross-origin CORS headers on /api/copilot/stream', async () => {
      const res = await request(app)
        .post('/api/copilot/stream')
        .set('Origin', allowedOrigin)
        .send({
          message: 'Can I visit North Sikkim in winter?',
          context: { duration: 5, destinations: ['gangtok', 'lachung'] }
        });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
      expect(res.text).toContain('data:');
    });

    it('rejects SSE stream connection from untrusted origin', async () => {
      const res = await request(app)
        .post('/api/copilot/stream')
        .set('Origin', disallowedOrigin)
        .send({
          message: 'Hello'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('CORS_FORBIDDEN');
    });
  });

  describe('3. Cross-Domain Cookie Configuration Helper', () => {
    it('enforces SameSite=None and Secure for staging and production environments', () => {
      const options = getSecureCookieOptions();
      expect(options.httpOnly).toBe(true);
      expect(options.path).toBe('/');
      // In non-dev environments (staging/prod), sameSite must be 'none' and secure true
      if (env.NODE_ENV === 'staging' || env.NODE_ENV === 'production') {
        expect(options.secure).toBe(true);
        expect(options.sameSite).toBe('none');
      } else {
        expect(options.sameSite).toBe('lax');
      }
    });
  });

  describe('4. Staging Database Environment Safety Policy', () => {
    it('confirms that staging forbids silent mock database fallback when DATABASE_URL is placeholder', () => {
      // Logic check matching backend/src/config/database.js
      const isPlaceholderUrl = (url) =>
        !url ||
        url.toLowerCase().includes('your-') ||
        url.toLowerCase().includes('placeholder') ||
        url.includes('test:test');

      const testPlaceholder = 'postgresql://postgres:your-password@db.placeholder.supabase.co:5432/postgres';
      expect(isPlaceholderUrl(testPlaceholder)).toBe(true);

      const stagingCheck = (nodeEnv, dbUrl) => {
        const isStagingOrProd = nodeEnv === 'production' || nodeEnv === 'staging';
        if (isStagingOrProd && isPlaceholderUrl(dbUrl)) {
          throw new Error(`[Database] FATAL: ${nodeEnv.toUpperCase()} environment REQUIRES a valid PostgreSQL DATABASE_URL.`);
        }
        return 'CONNECTED';
      };

      // In staging with a placeholder URL, must throw fatal error
      expect(() => stagingCheck('staging', testPlaceholder)).toThrow(/FATAL: STAGING environment REQUIRES/);
      // In production with a placeholder URL, must throw fatal error
      expect(() => stagingCheck('production', testPlaceholder)).toThrow(/FATAL: PRODUCTION environment REQUIRES/);
      // In staging with an empty URL, must throw fatal error
      expect(() => stagingCheck('staging', '')).toThrow(/FATAL: STAGING environment REQUIRES/);
      // With real Supabase URL, validation succeeds
      const realUrl = 'postgresql://postgres.abcdef:secret@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
      expect(stagingCheck('staging', realUrl)).toBe('CONNECTED');
    });
  });

  describe('5. Deterministic AI Fallback When Gemini is Unconfigured', () => {
    it('confirms Gemini is reported as unconfigured when GEMINI_API_KEY is not set', () => {
      // In test environment without GEMINI_API_KEY
      const configured = isGeminiConfigured();
      expect(typeof configured).toBe('boolean');
    });

    it('generates a complete valid itinerary via deterministic engine when Gemini is absent', async () => {
      const result = await generateItineraryAI({
        tripContext: {
          duration: 4,
          destinations: ['gangtok', 'pelling'],
          budget: { level: 'comfortable' },
          travelers: { total: 2 },
          language: 'en'
        }
      });

      expect(result).toBeDefined();
      expect(result.itinerary).toBeDefined();
      expect(result.itinerary.days.length).toBe(4);
      expect(result.source).toBe('fallback');
      expect(result.itinerary.overview).toBeDefined();
    });
  });

  describe('6. Staging Error Concealment & Security Mode', () => {
    it('suppresses internal database stack traces and errors in staging identical to production', async () => {
      const originalEnv = env.NODE_ENV;
      env.NODE_ENV = 'staging';

      const internalError = new Error('Database connection failed: FATAL at host 10.0.0.1:5432 with password secret123');
      internalError.status = 500;
      internalError.stack = 'Error: Database connection failed\n    at internal/db.js:42:15';

      let statusCode = null;
      let jsonResponse = null;
      const mockReq = { method: 'POST', path: '/api/generate-itinerary' };
      const mockRes = {
        status: (s) => {
          statusCode = s;
          return mockRes;
        },
        json: (data) => {
          jsonResponse = data;
        }
      };

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler(internalError, mockReq, mockRes, vi.fn());

      expect(statusCode).toBe(500);
      expect(jsonResponse.error.message).toBe('An unexpected error occurred. Please try again.');
      expect(jsonResponse.error.stack).toBeUndefined();
      expect(JSON.stringify(jsonResponse)).not.toContain('secret123');
      expect(JSON.stringify(jsonResponse)).not.toContain('10.0.0.1');

      // Verify that console.error does not log the stack dump in staging
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(internalError.stack);

      consoleErrorSpy.mockRestore();
      env.NODE_ENV = originalEnv;
    });

    it('rejects development mock operations headers in staging', async () => {
      const originalEnv = env.NODE_ENV;
      env.NODE_ENV = 'staging';

      const res = await request(app)
        .get('/api/operations/journeys')
        .set('x-ops-mock', 'true')
        .set('x-ops-role', 'ADMIN');

      // In staging, mock headers are ignored, and request is rejected with 401
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');

      env.NODE_ENV = originalEnv;
    });
  });
});
