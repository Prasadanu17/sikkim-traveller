/**
 * Customer Approval Service — Module 11
 * Handles formal customer approval of versioned proposals.
 * Requires 4 explicit checklist agreements before submission.
 * In mock mode: records MOCK_CUSTOMER_APPROVAL and moves status to CUSTOMER_ACCEPTED.
 * Never marks a trip CONFIRMED from customer frontend alone.
 */

import { sanitizeText } from "./customerPortalSanitizationService";
import { getMockBookingByToken, updateMockBooking } from "./customerPortalFallbackService";
import { buildCustomerSafeModel } from "./customerPortalContextService";
import { buildApiUrl } from "../../config/apiConfig";

/**
 * Submits customer approval for a specific proposal version.
 * @param {string} trackingToken
 * @param {number} proposalVersion
 * @param {object} checklist - { reviewedDetails: bool, reviewedPrice: bool, understoodAvailability: bool, agreedToProceed: bool, customerName?: string }
 */
export async function approveProposal(trackingToken, proposalVersion, checklist) {
  const cleanToken = sanitizeText(trackingToken);

  if (!checklist?.reviewedDetails || !checklist?.reviewedPrice || !checklist?.understoodAvailability || !checklist?.agreedToProceed) {
    throw new Error("Please complete all four confirmation checklist items before submitting your approval.");
  }

  const cleanName = sanitizeText(checklist.customerName || "Traveler");
  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const record = getMockBookingByToken(cleanToken);
    if (!record) {
      throw new Error(`Booking record "${cleanToken}" not found.`);
    }

    const currentProposalVersion = record.proposal?.version || (record.proposals?.length || 1);

    if (proposalVersion !== currentProposalVersion) {
      throw new Error(`Approval version mismatch. You are approving v${proposalVersion}, but the latest active proposal is v${currentProposalVersion}. Please refresh the page.`);
    }

    const approvalData = {
      accepted: true,
      proposalVersion: currentProposalVersion,
      acceptedAt: new Date().toISOString(),
      customerName: cleanName,
      _isMockApproval: true,
      simulationNotice: "Development simulation — not a confirmed reservation."
    };

    // Add milestone message from customer
    const approvalMessage = {
      id: `MSG-${Date.now()}`,
      sender: "customer",
      senderName: cleanName,
      text: `Proposal v${currentProposalVersion} approved. Ready to proceed with bookings.`,
      timestamp: new Date().toISOString()
    };

    // Auto reply from Operations
    const opsReply = {
      id: `MSG-${Date.now() + 1}`,
      sender: "operations",
      senderName: "Operations Desk",
      text: `Thank you ${cleanName}! We have received your acceptance of Proposal v${currentProposalVersion}. Our team is now placing firm reservations for your vehicle and accommodations.`,
      timestamp: new Date(Date.now() + 1200).toISOString()
    };

    const updated = {
      ...record,
      status: "CUSTOMER_ACCEPTED",
      customerApproval: approvalData,
      customerMessages: [...(record.customerMessages || []), approvalMessage, opsReply],
      hasPendingChangeRequest: false,
      updatedAt: new Date().toISOString()
    };

    const saved = updateMockBooking(updated);
    return {
      success: true,
      isMock: true,
      message: "Proposal approved successfully! Our operations desk is preparing your confirmation.",
      simulationNotice: "Development simulation — not a confirmed reservation.",
      booking: buildCustomerSafeModel(saved)
    };
  }

  // Production API boundary
  const response = await fetch(buildApiUrl(`/api/customer/booking/${encodeURIComponent(cleanToken)}/proposal/${proposalVersion}/approve`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      customerName: cleanName,
      agreements: {
        reviewedDetails: true,
        reviewedPrice: true,
        understoodAvailability: true,
        agreedToProceed: true
      },
      approvedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to submit proposal approval.");
  }

  const result = await response.json();
  return {
    success: true,
    isMock: false,
    message: result.message || "Proposal approved successfully.",
    booking: buildCustomerSafeModel(result.booking)
  };
}
