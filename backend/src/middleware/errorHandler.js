/**
 * backend/src/middleware/errorHandler.js
 * Global error handler — normalizes all errors, never exposes stack traces in production.
 */

import env from '../config/env.js';

/**
 * Central Express error handler.
 * Must be registered LAST: app.use(errorHandler)
 */
export function errorHandler(err, req, res, next) {
  // Determine HTTP status and code
  let status = err.status || err.statusCode || 500;
  let code = err.code || 'SERVER_ERROR';

  if (err.message && err.message.startsWith('CORS:')) {
    status = 403;
    code = 'CORS_FORBIDDEN';
  }

  // Log internally with full details
  console.error(`[ErrorHandler] ${req.method} ${req.path} → ${status}:`, err.message);
  if (env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Generic response — never expose stack traces or internal details
  const body = {
    error: {
      code,
      message: status < 500
        ? (err.message || 'Bad request.')
        : 'An unexpected error occurred. Please try again.'
    }
  };

  res.status(status).json(body);
}

/**
 * 404 handler — catches requests to unknown routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.'
    }
  });
}

/**
 * Creates a typed API error with HTTP status and code.
 * @param {string} message
 * @param {number} status
 * @param {string} code
 */
export function createError(message, status = 400, code = 'BAD_REQUEST') {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}
