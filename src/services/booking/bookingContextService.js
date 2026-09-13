/**
 * Booking Context Service.
 * Normalizes the active trip planner state into a clean, operational booking snapshot.
 */
export function buildBookingContext(plannerState) {
  if (!plannerState) return null;

  const itinerary = plannerState.itinerary?.current;
  const travelers = plannerState.travelers;
  const budgetIntel = plannerState.budgetIntelligence;
  const realtimeIntel = plannerState.realtimeIntelligence;

  // Extract destinations
  const selectedDests = plannerState.destinations?.selected || [];

  return {
    trip: {
      startDate: plannerState.dates?.start || "",
      endDate: plannerState.dates?.end || "",
      duration: plannerState.duration || 5,
      mode: plannerState.dates?.mode || "fixed",
      interests: plannerState.interests || []
    },
    traveler: {
      type: travelers?.type || "solo",
      adults: Number(travelers?.adults) || 1,
      children: Number(travelers?.children) || 0,
      seniors: Number(travelers?.seniors) || 0,
      total: Number(travelers?.total) || 1
    },
    destinations: selectedDests,
    itinerary: itinerary ? {
      tripTitle: itinerary.tripTitle || "",
      summary: itinerary.summary || "",
      days: itinerary.days?.map(d => ({
        dayNumber: d.dayNumber,
        title: d.title,
        activities: d.activities || [],
        accommodation: d.accommodation || "",
        transport: d.transport || ""
      })) || [],
      importantNotes: itinerary.importantNotes || []
    } : null,
    budget: budgetIntel ? {
      level: plannerState.budget?.level || "comfortable",
      estimatedRange: budgetIntel.estimatedRange || { min: 0, max: 0 },
      breakdown: budgetIntel.breakdown || {},
      assumptions: budgetIntel.assumptions || []
    } : {
      level: plannerState.budget?.level || "comfortable"
    },
    accommodation: {
      mode: plannerState.accommodation?.mode || "recommend",
      types: plannerState.accommodation?.types || [],
      comfort: plannerState.accommodation?.comfort || "",
      roomPreference: plannerState.accommodation?.roomPreference || ""
    },
    transportation: {
      mode: plannerState.transportation?.mode || "recommend",
      preferredModes: plannerState.transportation?.preferredModes || [],
      comfort: plannerState.transportation?.comfort || "",
      longDriveTolerance: plannerState.transportation?.longDriveTolerance || "",
      transferPreference: plannerState.transportation?.transferPreference || ""
    },
    preferences: {
      travelStyle: plannerState.travelStyle || "balanced",
      notes: plannerState.travelPreferences?.notes || []
    },
    realtimeSnapshot: realtimeIntel?.impact ? {
      overallStatus: realtimeIntel.impact.overallStatus || "",
      statusColor: realtimeIntel.impact.statusColor || "neutral",
      riskLevel: realtimeIntel.impact.riskLevel || "UNKNOWN",
      alerts: realtimeIntel.impact.alerts || [],
      lastChecked: realtimeIntel.lastChecked || ""
    } : {
      overallStatus: "⚪ CURRENT DATA UNAVAILABLE",
      statusColor: "neutral",
      riskLevel: "UNKNOWN",
      alerts: [],
      lastChecked: ""
    },
    itineraryVersion: itinerary?.version || `ST-v${(plannerState.itinerary?.history?.length || 0) + 1}`
  };
}
