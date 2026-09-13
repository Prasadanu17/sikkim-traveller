/**
 * backend/src/audit/auditLogger.js
 * Structured audit logging — records all security-relevant events.
 * NEVER logs: raw tokens, passwords, payment secrets, full PII.
 */

import prisma from '../config/database.js';

export const AUDIT_ACTIONS = {
  // Journey lifecycle
  JOURNEY_CREATED:       'JOURNEY_CREATED',
  JOURNEY_VIEWED:        'JOURNEY_VIEWED',
  // Token/session
  TOKEN_VERIFIED:        'TOKEN_VERIFIED',
  SESSION_CREATED:       'SESSION_CREATED',
  SESSION_REVOKED:       'SESSION_REVOKED',
  SECURITY_REJECTION:    'SECURITY_REJECTION',
  // Proposals
  PROPOSAL_CREATED:      'PROPOSAL_CREATED',
  PROPOSAL_SENT:         'PROPOSAL_SENT',
  PROPOSAL_APPROVED:     'PROPOSAL_APPROVED',
  PROPOSAL_INVALIDATED:  'PROPOSAL_INVALIDATED',
  PROPOSAL_DECLINED:     'PROPOSAL_DECLINED',
  // Status
  STATUS_CHANGED:        'STATUS_CHANGED',
  // Payments
  PAYMENT_CREATED:       'PAYMENT_CREATED',
  PAYMENT_WEBHOOK:       'PAYMENT_WEBHOOK',
  PAYMENT_VERIFIED:      'PAYMENT_VERIFIED',
  PAYMENT_FAILED:        'PAYMENT_FAILED',
  // Change requests
  CHANGE_REQUEST_SUBMITTED: 'CHANGE_REQUEST_SUBMITTED',
  CHANGE_REQUEST_UPDATED:   'CHANGE_REQUEST_UPDATED',
  // Permits
  PERMIT_UPDATED:        'PERMIT_UPDATED',
  // Documents
  DOCUMENT_ACCESSED:     'DOCUMENT_ACCESSED',
  // Notifications
  NOTIFICATION_SENT:     'NOTIFICATION_SENT',
  // Operations
  OPS_ACTION:            'OPS_ACTION',
};

/**
 * Records an audit event in the database.
 * Non-blocking — errors are logged but don't fail the request.
 *
 * @param {object} opts
 * @param {string} [opts.journeyId]
 * @param {string} [opts.actorId]
 * @param {string} [opts.actorRole]
 * @param {string} opts.action
 * @param {string} [opts.previousValue]
 * @param {string} [opts.newValue]
 * @param {string} [opts.message]
 * @param {string} [opts.ipAddress]
 */
export async function auditLog(opts) {
  try {
    await prisma.auditLog.create({
      data: {
        journeyId:     opts.journeyId ?? 'SYSTEM',
        actorId:       opts.actorId,
        actorRole:     opts.actorRole,
        action:        opts.action,
        previousValue: opts.previousValue?.toString().substring(0, 500),
        newValue:      opts.newValue?.toString().substring(0, 500),
        message:       opts.message?.substring(0, 1000),
        ipAddress:     opts.ipAddress?.substring(0, 45),
      }
    });
  } catch (err) {
    // Never fail a request because audit logging failed — log to console only
    console.error('[AuditLog] Failed to write audit record:', err.message);
  }
}

/**
 * Audit log middleware factory — logs route access for protected endpoints.
 * @param {string} action
 */
export function auditMiddleware(action) {
  return async (req, res, next) => {
    const originalSend = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400) {
        auditLog({
          journeyId: req.customer?.journeyId,
          actorId: req.opsUser?.id || req.customer?.sessionId,
          actorRole: req.opsUser?.role,
          action,
          message: `${req.method} ${req.path}`,
          ipAddress: req.ip
        });
      }
      return originalSend(body);
    };
    next();
  };
}
