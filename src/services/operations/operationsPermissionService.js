/**
 * Operations Permission Service — Module 10
 * Defines role-based permissions for the internal command center.
 * Permissions are enforced client-side for UI gating only.
 * Backend MUST re-verify all critical mutations (confirm, price, status).
 *
 * Roles: ADMIN | OPERATIONS_MANAGER | TRAVEL_OPERATOR | SALES | VIEWER
 */

// ─────────────────────────────────────────────
// CURRENT SESSION (MOCK DEV MODE ONLY)
// ─────────────────────────────────────────────

/**
 * Returns the current mock session user.
 * In production, this comes from the backend auth token — never from env/localStorage.
 */
export function getCurrentMockUser() {
  const isMockMode = import.meta.env.VITE_OPERATIONS_MOCK_MODE !== "false";
  if (!isMockMode) {
    return null; // Production: user is set by server session
  }

  return {
    id: "dev-operator-001",
    name: import.meta.env.VITE_OPS_MOCK_USER || "Dev Operator",
    role: import.meta.env.VITE_OPS_MOCK_ROLE || "OPERATIONS_MANAGER",
    isMock: true
  };
}

// ─────────────────────────────────────────────
// PERMISSION MATRIX
// ─────────────────────────────────────────────

const PERMISSIONS = {
  ADMIN: {
    canViewDashboard: true,
    canViewInbox: true,
    canViewBookingDetail: true,
    canViewPII: true,                  // name, email, phone
    canViewDriverPII: true,            // driver contact info
    canViewInternalNotes: true,
    canEditBooking: true,
    canAssignStaff: true,
    canChangeStatus: true,
    canAddQuote: true,
    canSendProposal: true,
    canConfirm: true,                  // CONFIRM JOURNEY
    canCancel: true,
    canDecline: true,
    canAddInternalNote: true,
    canAddCustomerNote: true,
    canVerifyAccommodation: true,
    canVerifyTransport: true,
    canUpdatePermit: true,             // Permit status changes (NOT APPROVED — backend only)
    canExportData: true,
    canViewAuditLog: true,
    canUseAI: true,
    canCreateInvoice: true,
    canRecordManualPayment: true,
    canVerifyPayment: true,
    canIssueRefund: true,
    canViewFinancialLedger: true,
    canCancelInvoice: true
  },

  OPERATIONS_MANAGER: {
    canViewDashboard: true,
    canViewInbox: true,
    canViewBookingDetail: true,
    canViewPII: true,
    canViewDriverPII: true,
    canViewInternalNotes: true,
    canEditBooking: true,
    canAssignStaff: true,
    canChangeStatus: true,
    canAddQuote: true,
    canSendProposal: true,
    canConfirm: true,
    canCancel: true,
    canDecline: true,
    canAddInternalNote: true,
    canAddCustomerNote: true,
    canVerifyAccommodation: true,
    canVerifyTransport: true,
    canUpdatePermit: true,
    canExportData: true,
    canViewAuditLog: true,
    canUseAI: true,
    canCreateInvoice: true,
    canRecordManualPayment: true,
    canVerifyPayment: true,
    canIssueRefund: true,
    canViewFinancialLedger: true,
    canCancelInvoice: true
  },

  TRAVEL_OPERATOR: {
    canViewDashboard: true,
    canViewInbox: true,
    canViewBookingDetail: true,
    canViewPII: true,
    canViewDriverPII: false,           // Not exposed to operators by default
    canViewInternalNotes: true,
    canEditBooking: false,
    canAssignStaff: false,
    canChangeStatus: true,             // Limited transitions only
    canAddQuote: false,
    canSendProposal: false,
    canConfirm: false,                 // Cannot confirm
    canCancel: false,
    canDecline: false,
    canAddInternalNote: true,
    canAddCustomerNote: false,
    canVerifyAccommodation: true,
    canVerifyTransport: true,
    canUpdatePermit: true,
    canExportData: false,
    canViewAuditLog: true,
    canUseAI: true,
    canCreateInvoice: false,
    canRecordManualPayment: false,
    canVerifyPayment: false,
    canIssueRefund: false,
    canViewFinancialLedger: true,
    canCancelInvoice: false
  },

  SALES: {
    canViewDashboard: true,
    canViewInbox: true,
    canViewBookingDetail: true,
    canViewPII: true,
    canViewDriverPII: false,
    canViewInternalNotes: false,       // Sales cannot see internal ops notes
    canEditBooking: false,
    canAssignStaff: false,
    canChangeStatus: false,
    canAddQuote: true,
    canSendProposal: true,
    canConfirm: false,
    canCancel: false,
    canDecline: false,
    canAddInternalNote: false,
    canAddCustomerNote: true,
    canVerifyAccommodation: false,
    canVerifyTransport: false,
    canUpdatePermit: false,
    canExportData: false,
    canViewAuditLog: false,
    canUseAI: true,
    canCreateInvoice: true,
    canRecordManualPayment: false,
    canVerifyPayment: false,
    canIssueRefund: false,
    canViewFinancialLedger: true,
    canCancelInvoice: false
  },

  VIEWER: {
    canViewDashboard: true,
    canViewInbox: true,
    canViewBookingDetail: true,
    canViewPII: false,                 // PII hidden from viewers
    canViewDriverPII: false,
    canViewInternalNotes: false,
    canEditBooking: false,
    canAssignStaff: false,
    canChangeStatus: false,
    canAddQuote: false,
    canSendProposal: false,
    canConfirm: false,
    canCancel: false,
    canDecline: false,
    canAddInternalNote: false,
    canAddCustomerNote: false,
    canVerifyAccommodation: false,
    canVerifyTransport: false,
    canUpdatePermit: false,
    canExportData: false,
    canViewAuditLog: true,
    canUseAI: false,
    canCreateInvoice: false,
    canRecordManualPayment: false,
    canVerifyPayment: false,
    canIssueRefund: false,
    canViewFinancialLedger: false,
    canCancelInvoice: false
  }
};

// ─────────────────────────────────────────────
// PERMISSION CHECKS
// ─────────────────────────────────────────────

/**
 * Returns the full permission set for a given role.
 */
export function getPermissions(role) {
  return PERMISSIONS[role] || PERMISSIONS["VIEWER"];
}

/**
 * Checks if a specific permission is granted for a role.
 */
export function hasPermission(role, permission) {
  const perms = getPermissions(role);
  return perms[permission] === true;
}

/**
 * Checks if a role can perform confirmation. Must be verified server-side.
 */
export function canConfirmJourney(role) {
  return hasPermission(role, "canConfirm");
}

/**
 * Checks if a role can view PII data.
 */
export function canViewPII(role) {
  return hasPermission(role, "canViewPII");
}

/**
 * Checks if a role can view driver/vendor contact info.
 */
export function canViewDriverPII(role) {
  return hasPermission(role, "canViewDriverPII");
}

/**
 * Returns redacted customer data if role lacks PII access.
 */
export function redactCustomerIfNeeded(customer, role) {
  if (canViewPII(role)) return customer;
  return {
    ...customer,
    email: "•••••@•••••",
    phone: "•••• •••• ••••",
    name: customer?.name?.split(" ")?.[0] + " •••"
  };
}

export const ROLE_LABELS = {
  ADMIN: "Administrator",
  OPERATIONS_MANAGER: "Operations Manager",
  TRAVEL_OPERATOR: "Travel Operator",
  SALES: "Sales",
  VIEWER: "Viewer"
};

export const ROLE_COLORS = {
  ADMIN: "bg-purple-100 text-purple-800",
  OPERATIONS_MANAGER: "bg-blue-100 text-blue-800",
  TRAVEL_OPERATOR: "bg-emerald-100 text-emerald-800",
  SALES: "bg-amber-100 text-amber-800",
  VIEWER: "bg-gray-100 text-gray-600"
};
