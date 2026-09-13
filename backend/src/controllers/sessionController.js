/**
 * backend/src/controllers/sessionController.js
 */

import prisma from '../config/database.js';
import { auditLog, AUDIT_ACTIONS } from '../audit/auditLogger.js';

export async function revokeSession(req, res, next) {
  try {
    const { journeyId, sessionId } = req.customer;

    // Revoke the current session
    await prisma.customerSession.updateMany({
      where: { journeyId, id: sessionId },
      data: { revokedAt: new Date() }
    });

    // Also revoke the access token to prevent new sessions
    await prisma.journeyAccessToken.updateMany({
      where: { id: req.customer.tokenId },
      data: { revokedAt: new Date(), revokedReason: 'Customer-initiated revocation' }
    });

    await auditLog({
      journeyId,
      action: AUDIT_ACTIONS.SESSION_REVOKED,
      message: 'Customer revoked their journey session',
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Session revoked successfully.' });
  } catch (err) {
    next(err);
  }
}
