/**
 * Booking Readiness Service.
 * Validates that all required planner state parameters are present before initiating booking request,
 * and tracks structural parameter changes using a snapshot hash.
 */

export function checkBookingReadiness(plannerState) {
  const missingFields = [];
  const warnings = [];

  if (!plannerState) {
    return {
      ready: false,
      missingFields: ["No trip data available."],
      warnings: [],
      itineraryVersion: "",
      estimatedBudget: null,
      travelerSummary: null
    };
  }

  const { dates, duration, travelers, destinations, accommodation, transportation, budget, itinerary } = plannerState;

  // Validate Dates & Duration
  if (dates?.mode === "fixed") {
    if (!dates.start || !dates.end) {
      missingFields.push("Trip dates are required for fixed-date planning.");
    }
  }
  if (!duration || duration <= 0) {
    missingFields.push("Trip duration must be at least 1 day.");
  }

  // Validate Travelers
  if (!travelers?.type) {
    missingFields.push("Please select traveler type.");
  }
  if (!travelers?.adults || travelers.adults <= 0) {
    missingFields.push("Please specify traveler count (at least 1 adult required).");
  }

  // Validate Destinations
  if (!destinations?.selected || destinations.selected.length === 0) {
    missingFields.push("Please select at least one destination.");
  }

  // Validate Itinerary Presence
  if (!itinerary?.current) {
    missingFields.push("A generated AI itinerary is required to book this journey.");
  }

  // Set warnings for optional preferences
  if (!accommodation?.types || accommodation.types.length === 0) {
    warnings.push("No accommodation preference selected. Default options will be suggested by the operations team.");
  }
  if (!transportation?.preferredModes || transportation.preferredModes.length === 0) {
    warnings.push("No transportation preference selected. Private vehicle will be proposed.");
  }
  if (!budget?.level) {
    warnings.push("Budget preference is not specified; standard comfortable rate will be assumed.");
  }

  const ready = missingFields.length === 0;
  const currentItinerary = itinerary?.current;
  const version = currentItinerary?.version || `ST-v${(itinerary?.history?.length || 0) + 1}`;

  return {
    ready,
    missingFields,
    warnings,
    itineraryVersion: version,
    estimatedBudget: plannerState.budgetIntelligence?.estimatedRange || null,
    travelerSummary: {
      total: travelers?.total || 1,
      type: travelers?.type || "solo",
      adults: travelers?.adults || 1,
      children: travelers?.children || 0,
      seniors: travelers?.seniors || 0
    }
  };
}

/**
 * Generates a deterministic snapshot hash of the current planner configuration.
 * Used for stale protection checking inside the booking wizard.
 */
export function getPlannerSnapshotHash(plannerState) {
  if (!plannerState) return "";
  
  const parts = [
    plannerState.duration || "",
    plannerState.dates?.start || "",
    plannerState.dates?.end || "",
    plannerState.travelers?.total || "",
    plannerState.travelers?.adults || "",
    plannerState.travelers?.children || "",
    plannerState.travelers?.seniors || "",
    (plannerState.destinations?.selected || []).slice().sort().join(","),
    (plannerState.accommodation?.types || []).slice().sort().join(","),
    (plannerState.transportation?.preferredModes || []).slice().sort().join(","),
    plannerState.budget?.level || "",
    plannerState.itinerary?.current?.tripTitle || "",
    plannerState.itinerary?.current?.days?.length || ""
  ];
  
  return parts.join("|");
}
