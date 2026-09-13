/**
 * backend/src/middleware/opsAuth.js
 * Operations staff RBAC middleware.
 *
 * In mock/dev mode: reads X-Ops-User-Id and X-Ops-Role headers (dev only, disabled in production)
 * In production: validates a signed ops session JWT
 *
 * RBAC hierarchy:
 * ADMIN > OPERATIONS_MANAGER > TRAVEL_OPERATOR > SALES > VIEWER
 */

import crypto from 'crypto';
import env from '../config/env.js';

// Role permission matrix — mirrors frontend operationsPermissionService.js
const ROLE_PERMISSIONS = {
  ADMIN: {
    canViewDashboard: true, canViewInbox: true, canViewBookingDetail: true,
    canViewPII: true, canViewDriverPII: true, canViewInternalNotes: true,
    canEditBooking: true, canAssignStaff: true, canChangeStatus: true,
    canAddQuote: true, canSendProposal: true, canConfirm: true,
    canCancel: true, canDecline: true, canAddInternalNote: true,
    canAddCustomerNote: true, canVerifyAccommodation: true,
    canVerifyTransport: true, canUpdatePermit: true,
    canExportData: true, canViewAuditLog: true, canUseAI: true,
    canCreateInvoice: true,
  },
  OPERATIONS_MANAGER: {
    canViewDashboard: true, canViewInbox: true, canViewBookingDetail: true,
    canViewPII: true, canViewDriverPII: false, canViewInternalNotes: true,
    canEditBooking: true, canAssignStaff: false, canChangeStatus: true,
    canAddQuote: true, canSendProposal: true, canConfirm: true,
    canCancel: true, canDecline: true, canAddInternalNote: true,
    canAddCustomerNote: true, canVerifyAccommodation: true,
    canVerifyTransport: true, canUpdatePermit: true,
    canExportData: false, canViewAuditLog: true, canUseAI: true,
    canCreateInvoice: true,
  },
  TRAVEL_OPERATOR: {
    canViewDashboard: true, canViewInbox: true, canViewBookingDetail: true,
    canViewPII: false, canViewDriverPII: false, canViewInternalNotes: false,
    canEditBooking: true, canAssignStaff: false, canChangeStatus: true,
    canAddQuote: false, canSendProposal: false, canConfirm: false,
    canCancel: false, canDecline: false, canAddInternalNote: true,
    canAddCustomerNote: true, canVerifyAccommodation: true,
    canVerifyTransport: true, canUpdatePermit: true,
    canExportData: false, canViewAuditLog: false, canUseAI: false,
    canCreateInvoice: false,
  },
  SALES: {
    canViewDashboard: true, canViewInbox: true, canViewBookingDetail: true,
    canViewPII: false, canViewDriverPII: false, canViewInternalNotes: false,
    canEditBooking: false, canAssignStaff: false, canChangeStatus: false,
    canAddQuote: true, canSendProposal: true, canConfirm: false,
    canCancel: false, canDecline: false, canAddInternalNote: false,
    canAddCustomerNote: true, canVerifyAccommodation: false,
    canVerifyTransport: false, canUpdatePermit: false,
    canExportData: false, canViewAuditLog: false, canUseAI: true,
    canCreateInvoice: true,
  },
  VIEWER: {
    canViewDashboard: true, canViewInbox: true, canViewBookingDetail: true,
    canViewPII: false, canViewDriverPII: false, canViewInternalNotes: false,
    canEditBooking: false, canAssignStaff: false, canChangeStatus: false,
    canAddQuote: false, canSendProposal: false, canConfirm: false,
    canCancel: false, canDecline: false, canAddInternalNote: false,
    canAddCustomerNote: false, canVerifyAccommodation: false,
    canVerifyTransport: false, canUpdatePermit: false,
    canExportData: false, canViewAuditLog: false, canUseAI: false,
    canCreateInvoice: false,
  }
};

/**
 * Generates a simple signed ops token for development.
 * In production this should be replaced with a proper JWT or SSO.
 */
export function signOpsToken(userId, role) {
  const payload = JSON.stringify({ userId, role, iat: Date.now() });
  const sig = crypto
    .createHmac('sha256', env.OPS_SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64');
}

function verifyOpsToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const lastDot = decoded.lastIndexOf('.');
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expectedSig = crypto
      .createHmac('sha256', env.OPS_SESSION_SECRET)
      .update(payload)
      .digest('hex');
    if (sig !== expectedSig) return null;
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Operations authentication middleware.
 * Accepts signed ops token in Authorization: Bearer header or X-Ops-Token header.
 */
export function opsAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const opsTokenHeader = req.headers['x-ops-token'] || '';
  const rawToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : opsTokenHeader;

  if (!rawToken) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Operations authentication required.' } });
  }

  // In development mock mode accept simple header (NEVER in production)
  if (env.NODE_ENV === 'development' && req.headers['x-ops-mock'] === 'true') {
    const role = req.headers['x-ops-role'] || 'VIEWER';
    const userId = req.headers['x-ops-user-id'] || 'dev-operator';
    req.opsUser = { id: userId, role, permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER };
    return next();
  }

  const payload = verifyOpsToken(rawToken);
  if (!payload) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid operations session.' } });
  }

  const role = payload.role;
  if (!ROLE_PERMISSIONS[role]) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Role not recognized.' } });
  }

  req.opsUser = {
    id: payload.userId,
    role,
    permissions: ROLE_PERMISSIONS[role]
  };

  next();
}

/**
 * Permission gate factory — returns middleware that checks a specific permission.
 * Usage: router.post('/confirm', opsAuth, requirePermission('canConfirm'), controller)
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.opsUser?.permissions?.[permission]) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Your role does not have permission to perform this action.'
        }
      });
    }
    next();
  };
}

export { ROLE_PERMISSIONS };
