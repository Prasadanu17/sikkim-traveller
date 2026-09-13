/**
 * backend/src/controllers/tokenController.js
 * Token verification — compatible with frontend customerAPIGateway.js verifyJourneyToken()
 */

import prisma from '../config/database.js';
import { hashToken } from '../security/tokenGenerator.js';
import { getCustomerSafeJourney } from '../services/customer/journeyService.js';
import { auditLog, AUDIT_ACTIONS } from '../audit/auditLogger.js';
import env from '../config/env.js';

const UNAUTHORIZED = { authorized: false, message: 'Journey access could not be verified.' };

export async function verifyToken(req, res, next) {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string' || token.trim().length < 10) {
      return res.status(401).json(UNAUTHORIZED);
    }

    const cleanToken = token.trim();
    const tokenHash = hashToken(cleanToken);

    const accessToken = await prisma.journeyAccessToken.findUnique({
      where: { tokenHash }
    });

    if (!accessToken || accessToken.expiresAt < new Date() || accessToken.revokedAt) {
      await auditLog({ action: AUDIT_ACTIONS.SECURITY_REJECTION, message: 'Token verify failed', ipAddress: req.ip });
      return res.status(401).json(UNAUTHORIZED);
    }

    // Create a new session
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setHours(sessionExpiresAt.getHours() + env.SESSION_EXPIRY_HOURS);

    const session = await prisma.customerSession.create({
      data: {
        journeyId: accessToken.journeyId,
        tokenId: accessToken.id,
        expiresAt: sessionExpiresAt,
        ipAddress: req.ip?.substring(0, 45),
        userAgent: req.headers['user-agent']?.substring(0, 255),
      }
    });

    // Update lastUsedAt
    await prisma.journeyAccessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() }
    });

    const journey = await getCustomerSafeJourney(accessToken.journeyId);

    await auditLog({
      journeyId: accessToken.journeyId,
      action: AUDIT_ACTIONS.TOKEN_VERIFIED,
      message: 'Customer token verified, session created',
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      authorized: true,
      journey,
      sessionId: session.id,
    });
  } catch (err) {
    next(err);
  }
}
