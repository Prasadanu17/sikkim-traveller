/**
 * Operations Proposal Service — Module 10
 * Manages versioned proposals, stale approval protection,
 * and customer acceptance workflow.
 */

import { buildProposal } from "./operationsContextService";
import { recordEvent, AUDIT_ACTIONS } from "./operationsAuditService";

// ─────────────────────────────────────────────
// PROPOSAL CREATION
// ─────────────────────────────────────────────

/**
 * Creates and appends a new versioned proposal to a booking record.
 */
export function addProposal(bookingRecord, { quoteId, inclusions, exclusions, validDays = 7, createdBy, createdByRole }) {
  const existingCount = (bookingRecord.proposals || []).length;
  const versionNumber = existingCount + 1;
  const versionLabel = `Proposal v${versionNumber}`;

  const proposal = buildProposal(
    bookingRecord.requestId,
    bookingRecord,
    quoteId,
    inclusions || [],
    exclusions || [],
    validDays,
    createdBy,
    createdByRole
  );
  proposal.versionLabel = versionLabel;

  // Invalidate any previous customer approval when a new proposal is created
  let customerApproval = bookingRecord.customerApproval;
  if (customerApproval?.accepted) {
    customerApproval = {
      ...customerApproval,
      accepted: false,
      invalidatedAt: new Date().toISOString(),
      invalidationReason: `New ${versionLabel} created — previous approval no longer valid.`
    };
  }

  let updated = {
    ...bookingRecord,
    proposals: [...(bookingRecord.proposals || []), proposal],
    customerApproval,
    updatedAt: new Date().toISOString()
  };

  updated = recordEvent(updated, {
    actorId: createdBy,
    actorRole: createdByRole,
    actorName: createdBy,
    action: AUDIT_ACTIONS.PROPOSAL_CREATED,
    previousValue: existingCount > 0 ? `Proposal v${existingCount}` : null,
    newValue: versionLabel,
    activityMessage: `${versionLabel} created. Valid until ${new Date(proposal.validUntil).toLocaleDateString()}.`
  });

  return updated;
}

/**
 * Marks the latest proposal as sent. Updates booking status to PROPOSAL_SENT.
 */
export function markProposalSent(bookingRecord, actorId, actorRole) {
  const proposals = bookingRecord.proposals || [];
  if (proposals.length === 0) return bookingRecord;

  const updatedProposals = proposals.map((p, i) =>
    i === proposals.length - 1 ? { ...p, status: "SENT", sentAt: new Date().toISOString() } : p
  );

  let updated = {
    ...bookingRecord,
    proposals: updatedProposals,
    status: "PROPOSAL_SENT",
    updatedAt: new Date().toISOString()
  };

  updated = recordEvent(updated, {
    actorId,
    actorRole,
    actorName: actorId,
    action: AUDIT_ACTIONS.PROPOSAL_SENT,
    previousValue: "DRAFT",
    newValue: "SENT",
    activityMessage: `${updatedProposals[updatedProposals.length - 1].versionLabel} sent to customer.`
  });

  return updated;
}

/**
 * Records customer acceptance of the latest proposal version.
 * Moves booking to CUSTOMER_ACCEPTED status.
 */
export function recordCustomerAcceptance(bookingRecord, acceptedBy, actorId, actorRole) {
  const proposals = bookingRecord.proposals || [];
  const latestProposal = proposals[proposals.length - 1];
  if (!latestProposal) return bookingRecord;

  const approval = {
    accepted: true,
    proposalVersion: latestProposal.versionLabel,
    proposalId: latestProposal.id,
    acceptedBy,
    acceptedAt: new Date().toISOString(),
    invalidatedAt: null,
    invalidationReason: null
  };

  const updatedProposals = proposals.map((p, i) =>
    i === proposals.length - 1 ? { ...p, status: "CUSTOMER_ACCEPTED" } : p
  );

  let updated = {
    ...bookingRecord,
    proposals: updatedProposals,
    customerApproval: approval,
    status: "CUSTOMER_ACCEPTED",
    updatedAt: new Date().toISOString()
  };

  updated = recordEvent(updated, {
    actorId,
    actorRole,
    actorName: actorId,
    action: AUDIT_ACTIONS.CUSTOMER_ACCEPTED,
    previousValue: "AWAITING_CUSTOMER",
    newValue: "CUSTOMER_ACCEPTED",
    activityMessage: `Customer accepted ${latestProposal.versionLabel}.`
  });

  return updated;
}

/**
 * Records customer declining the proposal.
 */
export function recordCustomerDecline(bookingRecord, reason, actorId, actorRole) {
  const proposals = bookingRecord.proposals || [];
  const latestProposal = proposals[proposals.length - 1];

  const updatedProposals = proposals.map((p, i) =>
    i === proposals.length - 1 ? { ...p, status: "CUSTOMER_DECLINED" } : p
  );

  let updated = {
    ...bookingRecord,
    proposals: updatedProposals,
    customerApproval: null,
    status: "AWAITING_CUSTOMER",
    updatedAt: new Date().toISOString()
  };

  updated = recordEvent(updated, {
    actorId,
    actorRole,
    actorName: actorId,
    action: AUDIT_ACTIONS.CUSTOMER_DECLINED,
    previousValue: latestProposal?.versionLabel,
    newValue: `DECLINED: ${reason}`,
    activityMessage: `Customer declined ${latestProposal?.versionLabel}: ${reason}`
  });

  return updated;
}

/**
 * Checks if the current customer approval is fresh (matches latest proposal).
 */
export function checkApprovalFreshness(bookingRecord) {
  const { customerApproval, proposals } = bookingRecord;
  if (!customerApproval?.accepted) return { fresh: false, reason: "No customer approval on record." };

  const latestProposal = proposals?.[proposals.length - 1];
  if (!latestProposal) return { fresh: false, reason: "No proposal found." };

  if (customerApproval.proposalVersion !== latestProposal.versionLabel) {
    return {
      fresh: false,
      reason: `Customer approved ${customerApproval.proposalVersion} but latest is ${latestProposal.versionLabel}. Re-approval required.`
    };
  }

  if (customerApproval.invalidatedAt) {
    return { fresh: false, reason: customerApproval.invalidationReason || "Approval was invalidated." };
  }

  return { fresh: true };
}
