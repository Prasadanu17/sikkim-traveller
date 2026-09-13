/**
 * Customer Portal Context Service — Module 11
 * Transforms internal operations booking records into client-safe models.
 * Filters out internal notes, audit trails, supplier margins, and private PII.
 */

// ─────────────────────────────────────────────
// CUSTOMER-FRIENDLY TIMELINE LABELS
// ─────────────────────────────────────────────

const FRIENDLY_STATUS_LABELS = {
  RECEIVED: "Request Received",
  UNDER_REVIEW: "Trip Under Review",
  AVAILABILITY_CHECK: "Availability Check",
  PRICE_PENDING: "Price Preparation",
  PROPOSAL_SENT: "Proposal Ready",
  AWAITING_CUSTOMER: "Waiting For Your Approval",
  CUSTOMER_ACCEPTED: "Proposal Accepted",
  READY_TO_CONFIRM: "Trip Ready",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "Trip In Progress",
  COMPLETED: "Trip Completed",
  CANCELLED: "Cancelled",
  DECLINED: "Declined"
};

// ─────────────────────────────────────────────
// TRANSFORMER
// ─────────────────────────────────────────────

/**
 * Normalizes an internal BookingRequest record into a customer-safe context model.
 * @param {object} rawBooking - Operations booking record from Module 10
 * @returns {object|null} Customer safe model
 */
export function buildCustomerPortalContext(rawBooking) {
  if (!rawBooking) return null;

  const now = new Date();
  const startDate = rawBooking.trip?.startDate ? new Date(rawBooking.trip.startDate) : null;
  const endDate = rawBooking.trip?.endDate ? new Date(rawBooking.trip.endDate) : null;

  // 1. Calculate Countdown or Active Day status
  let countdownText = "Flexible Dates";
  let countdownDays = null;
  if (startDate) {
    // Clear hours for day-based comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : null;

    const diffTime = startDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      countdownDays = diffDays;
      countdownText = `${diffDays} days to start`;
    } else if (diffDays === 0) {
      countdownText = "Starts today";
    } else if (endDay && today.getTime() <= endDay.getTime()) {
      const activeTime = today.getTime() - startDay.getTime();
      const activeDay = Math.floor(activeTime / (1000 * 60 * 60 * 24)) + 1;
      countdownText = `Day ${activeDay} of ${rawBooking.trip?.duration || 1}`;
    } else {
      countdownText = "Trip completed";
    }
  }

  if (rawBooking.status === "COMPLETED") {
    countdownText = "Trip completed";
  }

  // 2. Calculate Readiness Score
  const readiness = calculateReadinessScore(rawBooking);

  // 3. Filter customer-safe timeline events
  const safeTimeline = (rawBooking.activityLog || [])
    .filter(event => isCustomerSafeEvent(event.type))
    .map(event => ({
      id: event.id,
      type: event.type,
      message: getCustomerFriendlyActivityMessage(event.type, event.message),
      timestamp: event.timestamp
    }));

  // 4. Accommodation details (safe)
  const accommodation = {
    verificationStatus: rawBooking.accommodation?.verificationStatus || "NOT_CHECKED",
    preference: rawBooking.accommodation?.preference || {},
    confirmedOption: rawBooking.accommodation?.verificationStatus === "CONFIRMED"
      ? (rawBooking.accommodation?.options || []).filter(o => o.availabilityStatus?.includes("AVAILABLE")).pop() || null
      : null
  };

  // 5. Transportation details (safe PII masking)
  const transportation = {
    verificationStatus: rawBooking.transportation?.verificationStatus || "NOT_CHECKED",
    preference: rawBooking.transportation?.preference || {},
    driver: rawBooking.transportation?.verificationStatus === "CONFIRMED" && rawBooking.transportation?.driver
      ? {
          name: rawBooking.transportation.driver.name,
          vehicle: rawBooking.transportation.driver.vehicle,
          vehicleNumber: rawBooking.transportation.driver.vehicleNumber,
          // phone is hidden for customer portal unless explicitly allowed (here we hide it by default to avoid PII leak)
          phone: "Provided on arrival"
        }
      : null
  };

  // 6. Permits (safe status)
  const permits = (rawBooking.permits || []).map(p => ({
    id: p.id,
    label: p.label,
    destination: p.destination,
    status: p.status === "APPROVED" ? "APPROVED" : p.status, // Preserve exact operations status
    documentsRequired: p.documentsRequired || []
  }));

  // 7. Pricing structure
  const activeQuote = rawBooking.quotes?.filter(q => q.status === "CUSTOMER_ACCEPTED").pop()
    || rawBooking.quotes?.filter(q => q.status === "SENT_TO_CUSTOMER").pop()
    || rawBooking.quotes?.[rawBooking.quotes.length - 1]
    || null;

  const quote = activeQuote ? {
    versionLabel: activeQuote.versionLabel,
    total: activeQuote.total,
    currency: "INR",
    breakdown: activeQuote.breakdown || {},
    discount: activeQuote.discount || 0,
    additionalCharges: activeQuote.additionalCharges || 0,
    subtotal: activeQuote.subtotal || 0
  } : null;

  // 8. Latest proposal (sent or accepted only)
  const activeProposal = rawBooking.proposals?.find(p => p.status === "SENT" || p.status === "CUSTOMER_ACCEPTED") || null;
  const proposal = activeProposal ? {
    id: activeProposal.id,
    versionLabel: activeProposal.versionLabel,
    finalPrice: activeProposal.finalPrice,
    inclusions: activeProposal.inclusions || [],
    exclusions: activeProposal.exclusions || [],
    validUntil: activeProposal.validUntil,
    status: activeProposal.status
  } : null;

  return {
    id: rawBooking.id,
    requestId: rawBooking.requestId,
    status: rawBooking.status,
    statusLabel: FRIENDLY_STATUS_LABELS[rawBooking.status] || rawBooking.status,
    priority: rawBooking.priority,
    customer: {
      name: rawBooking.customer?.name || "Traveler",
      city: rawBooking.customer?.city || "",
      companions: rawBooking.customer?.companions || []
    },
    trip: {
      startDate: rawBooking.trip?.startDate || "",
      endDate: rawBooking.trip?.endDate || "",
      duration: rawBooking.trip?.duration || 0,
      destinations: rawBooking.destinations || [],
      travelStyle: rawBooking.trip?.travelStyle || "balanced",
      tripTitle: rawBooking.itineraryVersions?.[rawBooking.itineraryVersions.length - 1]?.title || "Sikkim Explorer Journey"
    },
    countdown: countdownText,
    countdownDays,
    readiness,
    itinerary: rawBooking.itineraryVersions?.[rawBooking.itineraryVersions.length - 1] || null,
    accommodation,
    transportation,
    permits,
    quote,
    proposal,
    realtime: rawBooking.realtimeSnapshot || null,
    timeline: safeTimeline,
    messages: (rawBooking.notes?.customerVisible || []).map(n => ({
      id: n.id,
      text: n.text,
      sender: n.addedByRole === "SALES" || n.addedByRole === "ADMIN" || n.addedByRole === "OPERATIONS_MANAGER" ? "operations" : "customer",
      senderName: n.addedByName || "Operations Team",
      timestamp: n.addedAt
    })),
    updatedAt: rawBooking.updatedAt,
    _isMockData: rawBooking._isMockData || false
  };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function calculateReadinessScore(booking) {
  const checks = [
    { label: "Accommodation Verified", passed: booking.accommodation?.verificationStatus === "CONFIRMED" },
    { label: "Transportation Arranged", passed: booking.transportation?.verificationStatus === "CONFIRMED" },
    { label: "Permits Resolved", passed: !booking.requiresPermit || (booking.permits || []).every(p => p.status === "APPROVED" || p.status === "NOT_REQUIRED") },
    { label: "Proposal Approved", passed: booking.customerApproval?.accepted === true },
    { label: "Real-time Conditions Checked", passed: !!booking.realtimeSnapshot?.lastChecked }
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const percentage = Math.round((passedCount / checks.length) * 100);

  let status = "IN_PROGRESS";
  if (percentage === 100) status = "READY";
  else if (booking.status === "CANCELLED" || booking.status === "DECLINED") status = "ATTENTION_REQUIRED";

  return {
    percentage,
    status,
    checks
  };
}

function isCustomerSafeEvent(eventType) {
  // Filters out internal assignments, raw notes additions, etc.
  const customerSafe = [
    "RECEIVED",
    "STATUS_CHANGED",
    "PROPOSAL_SENT",
    "CUSTOMER_ACCEPTED",
    "CUSTOMER_DECLINED",
    "CONFIRMED",
    "CANCELLED",
    "DECLINED",
    "COMPLETED",
    "ACCOMMODATION_UPDATED",
    "TRANSPORT_UPDATED",
    "PERMIT_UPDATED",
    "ITINERARY_REVISED",
    "REALTIME_REFRESHED"
  ];
  return customerSafe.includes(eventType);
}

function getCustomerFriendlyActivityMessage(type, originalMessage) {
  // Transforms internal operations vocabulary into premium traveler-facing updates
  if (type === "STATUS_CHANGED") {
    if (originalMessage.includes("UNDER_REVIEW")) return "Your trip planner detail is under review by our operations experts.";
    if (originalMessage.includes("AVAILABILITY_CHECK")) return "Checking stay slot availability and vehicle paths.";
    if (originalMessage.includes("PRICE_PENDING")) return "Preparing final budget quotes and vouchers.";
    if (originalMessage.includes("PROPOSAL_SENT")) return "Your curated travel proposal is ready.";
    if (originalMessage.includes("CUSTOMER_ACCEPTED")) return "You have accepted the travel proposal.";
    if (originalMessage.includes("CONFIRMED")) return "Congratulations! Your Sikkim trip has been fully confirmed.";
  }
  if (type === "ACCOMMODATION_UPDATED") {
    if (originalMessage.includes("CONFIRMED")) return "Accommodation arrangements verified and locked.";
    return "Accommodation options checked.";
  }
  if (type === "TRANSPORT_UPDATED") {
    if (originalMessage.includes("CONFIRMED")) return "Private vehicle and transport arrangements locked.";
    return "Transportation routes verified.";
  }
  if (type === "PERMIT_UPDATED") {
    return "Travel permit documents processed.";
  }
  if (type === "CONFIRMED") {
    return "Sikkim Trip Confirmed! Vouchers and travel notes sent.";
  }
  return originalMessage;
}
