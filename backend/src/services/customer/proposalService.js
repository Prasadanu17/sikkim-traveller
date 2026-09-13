/**
 * backend/src/services/customer/proposalService.js
 * Customer proposal service — enforces version integrity and stale approval protection.
 */

import prisma from '../../config/database.js';
import { sanitizeText } from '../../security/sanitizer.js';
import { auditLog, AUDIT_ACTIONS } from '../../audit/auditLogger.js';

/**
 * Gets the latest proposal for an authorized journey.
 * @param {string} journeyId - From authenticated session (never from browser)
 */
export async function getLatestProposal(journeyId) {
  const proposal = await prisma.proposal.findFirst({
    where: { journeyId },
    orderBy: { version: 'desc' },
    include: {
      approval: true,
      quote: true,
    }
  });

  if (!proposal) return null;

  return {
    id: proposal.id,
    version: proposal.version,
    versionLabel: proposal.versionLabel,
    status: proposal.status,
    summary: proposal.summary,
    inclusions: proposal.inclusions,
    exclusions: proposal.exclusions,
    validUntil: proposal.validUntil?.toISOString(),
    price: proposal.quote?.finalPrice ?? 0,
    currency: 'INR',
    updatedAt: proposal.updatedAt.toISOString(),
    approval: proposal.approval ? {
      accepted: proposal.approval.invalidatedAt == null,
      proposalVersion: proposal.approval.proposalVersion,
      customerName: proposal.approval.customerName,
      acceptedAt: proposal.approval.acceptedAt.toISOString(),
      invalidatedAt: proposal.approval.invalidatedAt?.toISOString() ?? null,
    } : null,
  };
}

/**
 * Records customer approval of a specific proposal version.
 * ENFORCES: version must match the latest active proposal.
 * ENFORCES: all 4 agreement checklist items must be true.
 *
 * @param {string} journeyId - From authenticated session
 * @param {string} sessionId - Customer session ID
 * @param {number} proposalVersion - Frontend-supplied version (server VERIFIES this)
 * @param {object} agreements - { reviewedDetails, reviewedPrice, understoodAvailability, agreedToProceed }
 * @param {string} customerName
 * @param {string} ipAddress
 */
export async function approveProposal(journeyId, sessionId, proposalVersion, agreements, customerName, ipAddress) {
  // Validate agreements
  const { reviewedDetails, reviewedPrice, understoodAvailability, agreedToProceed } = agreements || {};
  if (!reviewedDetails || !reviewedPrice || !understoodAvailability || !agreedToProceed) {
    throw Object.assign(
      new Error('Please complete all four confirmation checklist items before submitting your approval.'),
      { status: 400, code: 'VALIDATION_ERROR' }
    );
  }

  const cleanName = sanitizeText(customerName || 'Traveler');

  // Server-authoritative: get the latest proposal (NOT from browser)
  const latestProposal = await prisma.proposal.findFirst({
    where: { journeyId },
    orderBy: { version: 'desc' },
    include: { approval: true }
  });

  if (!latestProposal) {
    throw Object.assign(new Error('No proposal found for this journey.'), { status: 404, code: 'NOT_FOUND' });
  }

  // Version integrity check — reject stale approvals
  if (proposalVersion !== latestProposal.version) {
    throw Object.assign(
      new Error(`Approval version mismatch. You are approving v${proposalVersion}, but the latest proposal is v${latestProposal.version}. Please refresh and review the latest proposal.`),
      { status: 409, code: 'VERSION_MISMATCH' }
    );
  }

  // Check if already approved (idempotent)
  if (latestProposal.approval?.acceptedAt && !latestProposal.approval?.invalidatedAt) {
    return {
      success: true,
      message: 'Proposal was already approved.',
      _idempotent: true,
    };
  }

  // Write approval in transaction
  await prisma.$transaction(async (tx) => {
    // Create/update approval record
    await tx.proposalApproval.upsert({
      where: { proposalId: latestProposal.id },
      create: {
        proposalId: latestProposal.id,
        proposalVersion: latestProposal.version,
        customerName: cleanName,
        acceptedAt: new Date(),
        agreements: { reviewedDetails, reviewedPrice, understoodAvailability, agreedToProceed },
        sessionId,
      },
      update: {
        customerName: cleanName,
        acceptedAt: new Date(),
        invalidatedAt: null,
        invalidationReason: null,
        agreements: { reviewedDetails, reviewedPrice, understoodAvailability, agreedToProceed },
        sessionId,
      }
    });

    // Update journey status
    await tx.customerJourney.update({
      where: { id: journeyId },
      data: { status: 'CUSTOMER_ACCEPTED', updatedAt: new Date() }
    });

    // Audit
    await tx.auditLog.create({
      data: {
        journeyId,
        action: AUDIT_ACTIONS.PROPOSAL_APPROVED,
        newValue: latestProposal.versionLabel,
        message: `${cleanName} approved ${latestProposal.versionLabel}`,
        ipAddress: ipAddress?.substring(0, 45),
      }
    });
  });

  return {
    success: true,
    message: 'Proposal approved successfully! Our operations desk is preparing your confirmation.',
    status: 'CUSTOMER_ACCEPTED',
  };
}
