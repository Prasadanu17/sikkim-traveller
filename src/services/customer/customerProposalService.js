/**
 * Customer Proposal Service — Module 11
 * Manages customer proposal review, version checking, and stale approval detection.
 * Enforces strict proposal version alignment: if Operations creates Proposal v4,
 * previous approval on Proposal v3 is invalidated and prominently flagged.
 */

/**
 * Returns latest proposal object from a customer-safe booking model.
 * @param {object} booking
 */
export function getLatestProposal(booking) {
  return booking?.proposal || null;
}

/**
 * Verifies whether customer approval is valid for the current proposal version.
 * @param {object} booking
 * @returns {object} { isValid: boolean, status: string, message: string }
 */
export function verifyProposalApprovalStatus(booking) {
  if (!booking || !booking.proposal) {
    return {
      isValid: false,
      status: "NO_PROPOSAL",
      message: "No proposal has been issued yet for this trip request."
    };
  }

  const currentVersion = booking.proposal.version || 1;
  const approval = booking.customerApproval;

  if (!approval || !approval.accepted) {
    return {
      isValid: false,
      status: "AWAITING_APPROVAL",
      message: `Proposal v${currentVersion} is ready and awaiting your approval.`
    };
  }

  // Check version match
  if (approval.proposalVersion && approval.proposalVersion !== currentVersion) {
    return {
      isValid: false,
      status: "STALE_APPROVAL",
      message: `Your previous approval was for Proposal v${approval.proposalVersion}. A newer proposal (v${currentVersion}) is now available and requires your review.`
    };
  }

  return {
    isValid: true,
    status: "APPROVED",
    message: `Proposal v${currentVersion} was accepted by ${approval.customerName || "you"} on ${approval.acceptedAt ? new Date(approval.acceptedAt).toLocaleDateString() : "file"}.`
  };
}

/**
 * Checks if a proposal is within its valid date window.
 * @param {object} proposal
 */
export function isProposalActive(proposal) {
  if (!proposal || !proposal.validUntil) return true;
  const validUntilDate = new Date(proposal.validUntil);
  return validUntilDate >= new Date();
}
