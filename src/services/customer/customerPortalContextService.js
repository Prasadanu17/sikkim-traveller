/**
 * Customer Portal Context Service — Module 11
 * Transforms internal operations booking records and mock data into strict customer-safe data models.
 * Filters out all internal notes, audit trails, supplier margins, private PII, and staff comments.
 */

// ─────────────────────────────────────────────
// PIPELINE DEFINITIONS & LABELS
// ─────────────────────────────────────────────

export const CUSTOMER_STATUS_PIPELINE = [
  "RECEIVED",
  "UNDER_REVIEW",
  "AVAILABILITY_CHECK",
  "PRICE_PENDING",
  "PROPOSAL_SENT",
  "AWAITING_CUSTOMER",
  "CUSTOMER_ACCEPTED",
  "READY_TO_CONFIRM",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED"
];

export const CUSTOMER_FRIENDLY_STATUS = {
  RECEIVED: {
    label: "Request Received",
    description: "We have received your trip inquiry and logged your travel preferences.",
    badgeClass: "bg-blue-900/40 text-blue-300 border-blue-700/50"
  },
  UNDER_REVIEW: {
    label: "Under Review",
    description: "Our Himalayan destination architect is reviewing your route and requirements.",
    badgeClass: "bg-indigo-900/40 text-indigo-300 border-indigo-700/50"
  },
  AVAILABILITY_CHECK: {
    label: "Availability Check",
    description: "We are checking room allotments and private mountain vehicle availability.",
    badgeClass: "bg-purple-900/40 text-purple-300 border-purple-700/50"
  },
  PRICE_PENDING: {
    label: "Price Preparation",
    description: "Our team is calculating seasonal partner pricing and customized inclusions.",
    badgeClass: "bg-amber-900/40 text-amber-300 border-amber-700/50"
  },
  PROPOSAL_SENT: {
    label: "Proposal Sent",
    description: "Your personalized trip proposal has been published and is ready for review.",
    badgeClass: "bg-cyan-900/40 text-cyan-300 border-cyan-700/50"
  },
  AWAITING_CUSTOMER: {
    label: "Awaiting Your Approval",
    description: "Please review and approve the proposal or request any desired modifications.",
    badgeClass: "bg-amber-900/40 text-amber-300 border-amber-700/50"
  },
  CUSTOMER_ACCEPTED: {
    label: "Proposal Accepted",
    description: "You have approved the proposal. Operations is preparing final confirmations.",
    badgeClass: "bg-lime-900/40 text-lime-300 border-lime-700/50"
  },
  READY_TO_CONFIRM: {
    label: "Ready to Confirm",
    description: "All allotments and permits are aligned for final confirmation release.",
    badgeClass: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50"
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "Your Sikkim journey is 100% confirmed. Travel vouchers are ready.",
    badgeClass: "bg-emerald-900/50 text-emerald-200 border-emerald-600/60"
  },
  IN_PROGRESS: {
    label: "Journey In Progress",
    description: "Your Sikkim holiday is currently underway. Have a wonderful experience!",
    badgeClass: "bg-teal-900/40 text-teal-300 border-teal-700/50"
  },
  COMPLETED: {
    label: "Trip Completed",
    description: "Your journey has concluded. Thank you for travelling with Sikkim Traveller!",
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700"
  },
  CANCELLED: {
    label: "Trip Cancelled",
    description: "This trip request has been cancelled.",
    badgeClass: "bg-rose-900/40 text-rose-300 border-rose-700/50"
  },
  DECLINED: {
    label: "Request Declined",
    description: "We are unable to accommodate this request due to seasonal closures or capacity constraints.",
    badgeClass: "bg-red-900/40 text-red-300 border-red-700/50"
  }
};

// ─────────────────────────────────────────────
// DATA NORMALIZER & SANITIZER
// ─────────────────────────────────────────────

/**
 * Transforms an internal or mock booking record into a clean, customer-safe model.
 * @param {object} raw
 * @returns {object|null}
 */
export function buildCustomerSafeModel(raw) {
  if (!raw || typeof raw !== "object") return null;

  const now = new Date();
  const startDate = raw.trip?.startDate ? new Date(raw.trip.startDate) : null;
  const endDate = raw.trip?.endDate ? new Date(raw.trip.endDate) : null;

  // 1. Calculate Countdown or Active Day status
  let countdownText = "Flexible Dates";
  let countdownDays = null;
  if (startDate && !isNaN(startDate.getTime())) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = endDate && !isNaN(endDate.getTime()) ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

    const diffTime = startDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      countdownDays = diffDays;
      countdownText = `${diffDays} day${diffDays === 1 ? "" : "s"} until departure`;
    } else if (diffDays === 0) {
      countdownText = "Departure is Today!";
    } else if (endDay && today.getTime() <= endDay.getTime()) {
      const activeTime = today.getTime() - startDay.getTime();
      const activeDay = Math.floor(activeTime / (1000 * 60 * 60 * 24)) + 1;
      countdownText = `Day ${activeDay} of ${raw.trip?.duration || 1}`;
    } else {
      countdownText = "Trip completed";
    }
  }

  if (raw.status === "COMPLETED") {
    countdownText = "Trip completed";
  }

  // 2. Normalize customer data (PII protected — only firstName and travelerCount)
  const firstName = raw.customer?.firstName || raw.customer?.fullName?.split(" ")[0] || raw.customer?.name?.split(" ")[0] || "Traveler";
  const travelerCount = raw.customer?.travelerCount || (raw.customer?.companions ? raw.customer.companions.length + 1 : 1);

  // 3. Safe proposal model
  let safeProposal = null;
  if (raw.proposal) {
    safeProposal = {
      version: raw.proposal.version || 1,
      versionLabel: raw.proposal.versionLabel || `Proposal v${raw.proposal.version || 1}`,
      validUntil: raw.proposal.validUntil || null,
      price: raw.proposal.price || (raw.budget?.currentProposal || 0),
      currency: raw.proposal.currency || "INR",
      inclusions: Array.isArray(raw.proposal.inclusions) ? [...raw.proposal.inclusions] : [],
      exclusions: Array.isArray(raw.proposal.exclusions) ? [...raw.proposal.exclusions] : [],
      updatedAt: raw.proposal.updatedAt || raw.updatedAt || new Date().toISOString(),
      summary: raw.proposal.summary || "Custom Himalayan Itinerary & Arrangements"
    };
  } else if (Array.isArray(raw.proposals) && raw.proposals.length > 0) {
    const latest = raw.proposals[raw.proposals.length - 1];
    safeProposal = {
      version: latest.version || raw.proposals.length,
      versionLabel: latest.versionLabel || `Proposal v${raw.proposals.length}`,
      validUntil: latest.validUntil || null,
      price: latest.pricing?.finalPrice || (raw.budget?.currentProposal || 0),
      currency: latest.pricing?.currency || "INR",
      inclusions: Array.isArray(latest.inclusions) ? [...latest.inclusions] : [],
      exclusions: Array.isArray(latest.exclusions) ? [...latest.exclusions] : [],
      updatedAt: latest.createdAt || raw.updatedAt || new Date().toISOString(),
      summary: latest.summary || "Custom Himalayan Itinerary & Arrangements"
    };
  }

  // 4. Safe customer approval status
  const customerApproval = {
    accepted: raw.customerApproval?.accepted === true,
    proposalVersion: raw.customerApproval?.proposalVersion || null,
    acceptedAt: raw.customerApproval?.acceptedAt || null,
    customerName: raw.customerApproval?.customerName || null,
    _isMockApproval: raw.customerApproval?._isMockApproval === true
  };

  // 5. Safe customer messages (NO internal notes)
  const customerMessages = (raw.customerMessages || []).map((msg, index) => ({
    id: msg.id || `MSG-${index + 1}`,
    sender: msg.sender === "customer" ? "customer" : "operations",
    senderName: msg.sender === "customer" ? firstName : (msg.senderName || "Sikkim Operations Desk"),
    text: msg.text || "",
    timestamp: msg.timestamp || new Date().toISOString()
  }));

  // 6. Safe documents
  const documents = (raw.documents || []).map((doc, idx) => ({
    id: doc.id || `DOC-${idx + 1}`,
    name: doc.name || "Travel Document",
    type: doc.type || "Other",
    status: doc.status || "READY",
    date: doc.date || new Date().toISOString().split("T")[0],
    version: doc.version || "v1",
    downloadUrl: doc.downloadUrl || "#"
  }));

  // 7. Dynamic next action
  let nextAction = raw.nextAction || "";
  if (!nextAction) {
    switch (raw.status) {
      case "PROPOSAL_SENT":
      case "AWAITING_CUSTOMER":
        nextAction = "Your trip proposal is ready. Please review and approve the proposal or request any changes.";
        break;
      case "CUSTOMER_ACCEPTED":
        nextAction = "You have approved the proposal. Our operations team is completing vehicle and hotel reservations.";
        break;
      case "READY_TO_CONFIRM":
        nextAction = "Final reservations are in place. Official confirmation vouchers will be released shortly.";
        break;
      case "CONFIRMED":
        nextAction = "Your journey is confirmed! Review your travel vouchers and pack warm layers for the high passes.";
        break;
      case "IN_PROGRESS":
        nextAction = "Your Sikkim journey is currently in progress. 24/7 helpline concierge is on standby.";
        break;
      case "COMPLETED":
        nextAction = "Thank you for travelling with Sikkim Traveller. We hope you had a memorable Himalayan adventure!";
        break;
      case "UNDER_REVIEW":
      case "AVAILABILITY_CHECK":
      case "PRICE_PENDING":
        nextAction = "Our destination architects are custom-crafting your itinerary and verifying room availability.";
        break;
      default:
        nextAction = "Our operations desk is attending to your request.";
    }
  }

  // 8. Pipeline step index
  const pipelineIndex = CUSTOMER_STATUS_PIPELINE.indexOf(raw.status);

  // Return the strict normalized customer-safe object
  return {
    trackingToken: raw.trackingToken || "ST-TRK-DEMO",
    publicRequestId: raw.publicRequestId || raw.requestId || "ST-REQ-0001",
    status: raw.status || "RECEIVED",
    priority: raw.priority || "NORMAL",
    _isMockData: raw._isMockData === true,
    customer: {
      firstName,
      travelerCount
    },
    trip: {
      startDate: raw.trip?.startDate || "Flexible",
      endDate: raw.trip?.endDate || "Flexible",
      duration: raw.trip?.duration || (raw.itinerary?.days?.length || 5),
      destinations: Array.isArray(raw.trip?.destinations) ? raw.trip.destinations : (raw.destinations || ["Gangtok"]),
      travelStyle: raw.trip?.travelStyle || raw.trip?.style || "Scenic & Cultural"
    },
    itinerary: {
      version: raw.itinerary?.version || 1,
      title: raw.itinerary?.title || "Custom Sikkim Himalayan Journey",
      days: Array.isArray(raw.itinerary?.days) ? raw.itinerary.days : []
    },
    budget: {
      estimated: raw.budget?.estimated || raw.budget?.estimatedRange?.max || 40000,
      currentProposal: safeProposal ? safeProposal.price : (raw.budget?.currentProposal || null),
      currency: raw.budget?.currency || "INR"
    },
    accommodation: {
      status: raw.accommodation?.status || (raw.status === "CONFIRMED" ? "CONFIRMED" : "PROVISIONAL"),
      selectedOption: raw.accommodation?.selectedOption || raw.accommodation?.preference?.category || "Premium Valley View Resorts & Chalets"
    },
    transportation: {
      status: raw.transportation?.status || (raw.status === "CONFIRMED" ? "CONFIRMED" : "PROVISIONAL"),
      summary: raw.transportation?.summary || (raw.status === "CONFIRMED" ? "Dedicated 4WD Mountain Vehicle with Licensed Specialist Driver" : "Private Mountain Vehicle allocated for all days")
    },
    permits: {
      status: raw.permits?.status || (raw.requiresPermit ? "PROCESSING" : "NOT_REQUIRED"),
      customerRelevantIssues: Array.isArray(raw.permits?.customerRelevantIssues) ? raw.permits.customerRelevantIssues : []
    },
    realtime: raw.realtime || {},
    proposal: safeProposal,
    customerApproval,
    documents,
    customerMessages,
    hasPendingChangeRequest: raw.hasPendingChangeRequest === true,
    lastChangeRequest: raw.lastChangeRequest || null,
    countdownText,
    countdownDays,
    pipelineIndex: pipelineIndex !== -1 ? pipelineIndex : 0,
    friendlyStatus: CUSTOMER_FRIENDLY_STATUS[raw.status] || {
      label: raw.status,
      description: "Trip status is being processed.",
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700"
    },
    nextAction,
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}
