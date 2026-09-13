/**
 * backend/src/middleware/auth.js
 * Customer journey authentication middleware.
 *
 * FLOW:
 * Authorization: Bearer <rawToken>
 *     ↓
 * hash(rawToken) → DB lookup in JourneyAccessToken
 *     ↓
 * check: not expired, not revoked
 *     ↓
 * find active CustomerSession for this token
 *     ↓
 * attach req.customer = { journeyId, sessionId, tokenId }
 *     ↓
 * NEVER trust req.body.journeyId or req.query.journeyId
 *
 * IDOR GUARANTEE:
 * All controllers must use req.customer.journeyId exclusively.
 * Journey ownership is resolved server-side from the verified token.
 */

import prisma from '../config/database.js';
import { hashToken, isValidTokenFormat } from '../security/tokenGenerator.js';
import { auditLog, AUDIT_ACTIONS } from '../audit/auditLogger.js';

/** Generic response — never reveals whether journey exists */
const UNAUTHORIZED = {
  authorized: false,
  message: 'Journey access could not be verified.'
};

/**
 * Customer authentication middleware.
 * Populates req.customer on success or returns 401.
 */
export async function customerAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(UNAUTHORIZED);
  }

  const rawToken = authHeader.slice(7).trim();

  // Basic format sanity — don't even hash garbage
  if (!rawToken || rawToken.length < 10) {
    return res.status(401).json(UNAUTHORIZED);
  }

  try {
    const tokenHash = hashToken(rawToken);

    // DB lookup by hash only — raw token is never stored
    const accessToken = await prisma.journeyAccessToken.findUnique({
      where: { tokenHash },
      include: { journey: { select: { id: true, status: true, requestId: true } } }
    });

    if (!accessToken) {
      await auditLog({ action: AUDIT_ACTIONS.SECURITY_REJECTION, message: 'Token hash not found', ipAddress: req.ip });
      return res.status(401).json(UNAUTHORIZED);
    }

    // Check expiry
    if (accessToken.expiresAt < new Date()) {
      await auditLog({ journeyId: accessToken.journeyId, action: AUDIT_ACTIONS.SECURITY_REJECTION, message: 'Token expired', ipAddress: req.ip });
      return res.status(401).json(UNAUTHORIZED);
    }

    // Check revocation
    if (accessToken.revokedAt) {
      await auditLog({ journeyId: accessToken.journeyId, action: AUDIT_ACTIONS.SECURITY_REJECTION, message: 'Token revoked', ipAddress: req.ip });
      return res.status(401).json(UNAUTHORIZED);
    }

    // Find the most recent active session for this token
    const session = await prisma.customerSession.findFirst({
      where: {
        tokenId: accessToken.id,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!session) {
      // Auto-create a new session if token is valid but no session exists
      const newSession = await createSession(accessToken, req);
      req.customer = {
        journeyId: accessToken.journeyId,
        sessionId: newSession.id,
        tokenId: accessToken.id,
        requestId: accessToken.journey.requestId
      };
    } else {
      req.customer = {
        journeyId: accessToken.journeyId,
        sessionId: session.id,
        tokenId: accessToken.id,
        requestId: accessToken.journey.requestId
      };
    }

    // Update lastUsedAt (non-blocking)
    prisma.journeyAccessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() }
    }).catch(() => {});

    next();
  } catch (err) {
    console.error('[customerAuth] Error:', err.message);
    return res.status(401).json(UNAUTHORIZED);
  }
}

async function createSession(accessToken, req) {
  const env = (await import('../config/env.js')).default;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + env.SESSION_EXPIRY_HOURS);

  return prisma.customerSession.create({
    data: {
      journeyId: accessToken.journeyId,
      tokenId: accessToken.id,
      expiresAt,
      ipAddress: req.ip?.substring(0, 45),
      userAgent: req.headers['user-agent']?.substring(0, 255)
    }
  });
}
