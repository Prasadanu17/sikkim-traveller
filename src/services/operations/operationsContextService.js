/**
 * Operations Context Service — Module 10
 * Defines all normalized operational data models and builder functions.
 * Transforms Module 9 booking context payloads into operations records.
 */

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export const BOOKING_STATUSES = [
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
  "COMPLETED",
  "CANCELLED",
  "DECLINED"
];

export const PRIORITY_LEVELS = ["LOW", "NORMAL", "HIGH", "URGENT"];

export const STAFF_ROLES = [
  "ADMIN",
  "OPERATIONS_MANAGER",
  "TRAVEL_OPERATOR",
  "SALES",
  "VIEWER"
];

export const PERMIT_STATUSES = [
  "NOT_REQUIRED",
  "REQUIRED",
  "DOCUMENTS_PENDING",
  "APPLICATION_PENDING",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED"
];

export const ACCOMMODATION_VERIFY_STATUSES = [
  "NOT_CHECKED",
  "CHECKING",
  "OPTION_AVAILABLE",
  "OPTION_UNAVAILABLE",
  "CUSTOMER_SELECTION_REQUIRED",
  "CONFIRMED"
];

export const TRANSPORT_VERIFY_STATUSES = [
  "NOT_CHECKED",
  "CHECKING",
  "AVAILABLE",
  "UNAVAILABLE",
  "ASSIGNED",
  "CONFIRMED"
];

export const QUOTE_STATUSES = [
  "DRAFT",
  "INTERNAL_REVIEW",
  "SENT_TO_CUSTOMER",
  "CUSTOMER_ACCEPTED",
  "CUSTOMER_DECLINED",
  "EXPIRED"
];

/** Destination slugs that require permit attention */
export const PERMIT_SENSITIVE_DESTINATIONS = [
  "lachung", "lachen", "yumthang", "gurudongmar",
  "nathula", "zuluk", "silk-route", "north-sikkim",
  "thangu", "chopta-valley"
];

/** Destination slugs requiring 4WD */
export const FOUR_WD_REQUIRED_DESTINATIONS = [
  "zuluk", "silk-route", "gurudongmar", "thangu", "chopta-valley"
];

// ─────────────────────────────────────────────
// BUILDER — Booking Operations Record
// ─────────────────────────────────────────────

/**
 * Creates a new operations booking record from a Module 9 booking context + form data.
 * @param {object} bookingContext - Output of buildBookingContext()
 * @param {object} travelerForm  - Traveler details form data from Module 9
 * @param {object} submissionResult - { requestId, submittedAt, status }
 */
export function buildOperationsRecord(bookingContext, travelerForm = {}, submissionResult = {}) {
  const requestId = submissionResult.requestId || `ST-REQ-${Date.now()}`;
  const now = new Date().toISOString();

  const destinationSlugs = (bookingContext?.destinations || []).map(d => d.toLowerCase());
  const requiresPermit = destinationSlugs.some(s => PERMIT_SENSITIVE_DESTINATIONS.includes(s));
  const requires4WD = destinationSlugs.some(s => FOUR_WD_REQUIRED_DESTINATIONS.includes(s));

  return {
    id: requestId,
    requestId,
    status: "RECEIVED",
    priority: determinePriority(bookingContext),
    version: 1, // Optimistic concurrency lock
    _isMockData: true,

    customer: {
      name: travelerForm.fullName || "Unknown Traveler",
      email: travelerForm.email || "",
      phone: travelerForm.phone || "",
      city: travelerForm.city || "",
      country: travelerForm.country || "India",
      contactMethod: travelerForm.contactMethod || "EMAIL",
      contactTime: travelerForm.contactTime || "ANYTIME",
      companions: travelerForm.companions || []
    },

    trip: {
      startDate: bookingContext?.trip?.startDate || "",
      endDate: bookingContext?.trip?.endDate || "",
      duration: bookingContext?.trip?.duration || 5,
      mode: bookingContext?.trip?.mode || "flexible",
      interests: bookingContext?.trip?.interests || [],
      travelStyle: bookingContext?.preferences?.travelStyle || "balanced"
    },

    destinations: bookingContext?.destinations || [],
    requiresPermit,
    requires4WD,

    itineraryVersions: bookingContext?.itinerary ? [
      {
        version: bookingContext.itineraryVersion || "ST-v1",
        title: bookingContext.itinerary.tripTitle || "Sikkim Journey",
        summary: bookingContext.itinerary.summary || "",
        days: bookingContext.itinerary.days || [],
        importantNotes: bookingContext.itinerary.importantNotes || [],
        createdAt: now,
        isOriginal: true
      }
    ] : [],

    budget: {
      aiEstimate: bookingContext?.budget?.estimatedRange || null,
      aiBreakdown: bookingContext?.budget?.breakdown || {},
      operationsQuote: null,
      finalQuote: null
    },

    accommodation: {
      preference: {
        mode: bookingContext?.accommodation?.mode || "recommend",
        types: bookingContext?.accommodation?.types || [],
        comfort: bookingContext?.accommodation?.comfort || "comfortable"
      },
      verificationStatus: "NOT_CHECKED",
      options: []
    },

    transportation: {
      preference: {
        mode: bookingContext?.transportation?.mode || "recommend",
        preferredModes: bookingContext?.transportation?.preferredModes || [],
        comfort: bookingContext?.transportation?.comfort || "standard",
        longDriveTolerance: bookingContext?.transportation?.longDriveTolerance || "medium"
      },
      verificationStatus: "NOT_CHECKED",
      options: [],
      driver: null
    },

    permits: requiresPermit ? destinationSlugs
      .filter(s => PERMIT_SENSITIVE_DESTINATIONS.includes(s))
      .map(slug => buildPermitRecord(slug, requestId)) : [],

    realtimeSnapshot: bookingContext?.realtimeSnapshot || {
      overallStatus: "⚪ DATA UNAVAILABLE",
      riskLevel: "UNKNOWN",
      alerts: [],
      lastChecked: ""
    },

    specialRequirements: travelerForm.specialRequirements || [],
    accessibilityNeeds: travelerForm.accessibilityNeeds || [],

    quotes: [],
    proposals: [],
    customerApproval: null,
    confirmation: null,

    assignedTo: null,
    assignedSales: null,
    assignedOperations: null,

    notes: {
      internal: [],
      customerVisible: []
    },

    activityLog: [
      buildActivityEvent("RECEIVED", "system", "SYSTEM", `Booking request ${requestId} received.`, now)
    ],

    auditLog: [
      buildAuditEvent(requestId, "system", "SYSTEM", "RECORD_CREATED", null, "RECEIVED", now)
    ],

    createdAt: submissionResult.submittedAt || now,
    updatedAt: now
  };
}

// ─────────────────────────────────────────────
// BUILDER — Permit Record
// ─────────────────────────────────────────────

export function buildPermitRecord(destinationSlug, requestId) {
  const permitTypes = {
    "nathula": { type: "PROTECTED_AREA_PERMIT", label: "Nathula Protected Area Permit" },
    "gurudongmar": { type: "RESTRICTED_AREA_PERMIT", label: "Gurudongmar Restricted Area Permit" },
    "lachung": { type: "INNER_LINE_PERMIT", label: "North Sikkim Inner Line Permit" },
    "lachen": { type: "INNER_LINE_PERMIT", label: "North Sikkim Inner Line Permit" },
    "yumthang": { type: "INNER_LINE_PERMIT", label: "Yumthang Inner Line Permit" },
    "zuluk": { type: "RESTRICTED_AREA_PERMIT", label: "Silk Route Restricted Area Permit" },
    "silk-route": { type: "RESTRICTED_AREA_PERMIT", label: "Silk Route Restricted Area Permit" },
    "north-sikkim": { type: "INNER_LINE_PERMIT", label: "North Sikkim Inner Line Permit" },
    "thangu": { type: "RESTRICTED_AREA_PERMIT", label: "Thangu Restricted Area Permit" },
    "chopta-valley": { type: "RESTRICTED_AREA_PERMIT", label: "Chopta Valley Restricted Area Permit" }
  };

  const info = permitTypes[destinationSlug] || { type: "PERMIT_REQUIRED", label: "Travel Permit Required" };

  return {
    id: `PERMIT-${requestId}-${destinationSlug}`,
    requestId,
    destination: destinationSlug,
    type: info.type,
    label: info.label,
    status: "REQUIRED",
    documentsRequired: ["Passport/Aadhaar", "Travel Permit Application", "Recent Photographs"],
    applicationStatus: "NOT_STARTED",
    submissionDate: null,
    approvalDate: null,
    referenceNumber: null,
    notes: "",
    createdAt: new Date().toISOString()
  };
}

// ─────────────────────────────────────────────
// BUILDER — Activity Event
// ─────────────────────────────────────────────

export function buildActivityEvent(type, actorId, actorName, message, timestamp = null) {
  return {
    id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    actorId,
    actorName,
    message,
    timestamp: timestamp || new Date().toISOString()
  };
}

// ─────────────────────────────────────────────
// BUILDER — Audit Event
// ─────────────────────────────────────────────

export function buildAuditEvent(requestId, actorId, actorRole, action, previousValue, newValue, timestamp = null) {
  return {
    eventId: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    requestId,
    actorId,
    actorRole,
    action,
    previousValue,
    newValue,
    timestamp: timestamp || new Date().toISOString()
  };
}

// ─────────────────────────────────────────────
// BUILDER — Quote
// ─────────────────────────────────────────────

export function buildQuote(requestId, breakdown, createdBy, createdByRole, reason = "") {
  const accommodation = Number(breakdown.accommodation || 0);
  const transport = Number(breakdown.transport || 0);
  const meals = Number(breakdown.meals || 0);
  const permits = Number(breakdown.permits || 0);
  const activities = Number(breakdown.activities || 0);
  const guide = Number(breakdown.guide || 0);
  const taxes = Number(breakdown.taxes || 0);
  const other = Number(breakdown.other || 0);

  const subtotal = accommodation + transport + meals + permits + activities + guide + taxes + other;
  const discount = Number(breakdown.discount || 0);
  const additionalCharges = Number(breakdown.additionalCharges || 0);
  const total = subtotal - discount + additionalCharges;

  return {
    id: `QUOTE-${requestId}-${Date.now()}`,
    requestId,
    breakdown: { accommodation, transport, meals, permits, activities, guide, taxes, other },
    subtotal,
    discount,
    additionalCharges,
    total,
    currency: "INR",
    status: "DRAFT",
    reason,
    createdBy,
    createdByRole,
    createdAt: new Date().toISOString(),
    versionLabel: null // set by quote service
  };
}

// ─────────────────────────────────────────────
// BUILDER — Proposal
// ─────────────────────────────────────────────

export function buildProposal(requestId, bookingRecord, quoteId, inclusions, exclusions, validDays, createdBy, createdByRole) {
  const latestItinerary = bookingRecord.itineraryVersions?.[bookingRecord.itineraryVersions.length - 1] || null;
  const latestQuote = bookingRecord.quotes?.find(q => q.id === quoteId) || null;

  return {
    id: `PROP-${requestId}-${Date.now()}`,
    requestId,
    quoteId,
    itineraryVersion: latestItinerary?.version || "ST-v1",
    trip: bookingRecord.trip,
    customer: bookingRecord.customer,
    destinations: bookingRecord.destinations,
    accommodation: bookingRecord.accommodation,
    transportation: bookingRecord.transportation,
    permits: bookingRecord.permits,
    finalPrice: latestQuote?.total || 0,
    inclusions: inclusions || [],
    exclusions: exclusions || [],
    validUntil: new Date(Date.now() + validDays * 86400000).toISOString(),
    status: "DRAFT",
    customerApproval: null,
    versionLabel: null, // set by proposal service
    createdBy,
    createdByRole,
    createdAt: new Date().toISOString()
  };
}

// ─────────────────────────────────────────────
// BUILDER — Confirmation Snapshot
// ─────────────────────────────────────────────

export function buildConfirmationSnapshot(bookingRecord, confirmedBy, confirmedByRole) {
  const latestItinerary = bookingRecord.itineraryVersions?.[bookingRecord.itineraryVersions.length - 1];
  const latestQuote = bookingRecord.quotes?.filter(q => q.status === "CUSTOMER_ACCEPTED").pop()
    || bookingRecord.quotes?.[bookingRecord.quotes.length - 1];
  const latestProposal = bookingRecord.proposals?.[bookingRecord.proposals.length - 1];

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  const confirmationId = `ST-CONF-${yyyy}${mm}${dd}-${rand}`;

  return {
    confirmationId,
    requestId: bookingRecord.requestId,
    proposalVersion: latestProposal?.versionLabel || "Proposal v1",
    itineraryVersion: latestItinerary?.version || "ST-v1",
    quoteVersion: latestQuote?.versionLabel || "Quote v1",
    confirmedBy,
    confirmedByRole,
    confirmedAt: now.toISOString(),
    _isMockConfirmation: true, // Never treat as production confirmation
    trip: bookingRecord.trip,
    traveler: bookingRecord.customer,
    destinations: bookingRecord.destinations,
    accommodation: bookingRecord.accommodation,
    transportation: bookingRecord.transportation,
    permits: bookingRecord.permits,
    finalPrice: latestQuote?.total || 0,
    breakdown: latestQuote?.breakdown || {},
    inclusions: latestProposal?.inclusions || [],
    exclusions: latestProposal?.exclusions || []
  };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Determines priority based on trip dates and route characteristics.
 */
function determinePriority(bookingContext) {
  const startDate = bookingContext?.trip?.startDate;
  const destinations = (bookingContext?.destinations || []).map(d => d.toLowerCase());
  const hasPermitDest = destinations.some(d => PERMIT_SENSITIVE_DESTINATIONS.includes(d));

  if (startDate) {
    const daysUntilTrip = Math.ceil((new Date(startDate) - Date.now()) / 86400000);
    if (daysUntilTrip <= 2) return "URGENT";
    if (daysUntilTrip <= 7 && hasPermitDest) return "HIGH";
    if (daysUntilTrip <= 14) return "HIGH";
  }

  if (hasPermitDest) return "HIGH";
  return "NORMAL";
}
