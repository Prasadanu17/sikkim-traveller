import { destinations as allDests } from "../../data/destinations";

/**
 * Copilot Context Normalization Service.
 * Normalizes full planner, itinerary, and real-time state into a compact, structured context object.
 * Prevents sending bloated React state or raw DOM objects to LLM prompts.
 */
export function buildCopilotContext(plannerState, activeConstraints = {}) {
  if (!plannerState) return null;

  const {
    duration = 5,
    dates = {},
    travelers = {},
    travelStyle = "balanced",
    destinations = {},
    budget = {},
    budgetIntelligence = null,
    accommodation = {},
    transportation = {},
    itinerary = {},
    realtimeIntelligence = {}
  } = plannerState;

  const selectedDests = (destinations.selected || []).map((slug) => {
    const found = allDests.find((d) => d.slug === slug);
    return {
      slug,
      name: found ? found.name : slug,
      district: found ? found.district : "Sikkim"
    };
  });

  const currentItinerary = itinerary.current || null;
  const itinerarySummary = currentItinerary ? {
    tripTitle: currentItinerary.tripTitle,
    duration: currentItinerary.overview?.duration || duration,
    travelStyle: currentItinerary.overview?.travelStyle || travelStyle,
    daysCount: currentItinerary.days?.length || 0,
    route: currentItinerary.overview?.route || [],
    estimatedCost: currentItinerary.overview?.estimatedCost || null,
    days: (currentItinerary.days || []).map((d) => ({
      dayNumber: d.dayNumber,
      title: d.title,
      baseLocation: d.baseLocation,
      morning: (d.morning || []).map((a) => (typeof a === "string" ? a : a.title)),
      afternoon: (d.afternoon || []).map((a) => (typeof a === "string" ? a : a.title)),
      evening: (d.evening || []).map((a) => (typeof a === "string" ? a : a.title)),
      transit: d.travel ? d.travel.map((t) => `${t.from} -> ${t.to} (${t.duration || t.hours || ""})`).join(", ") : null,
      stay: d.overnight?.accommodationType || d.overnight?.location || null
    }))
  } : null;

  const realtimeSummary = realtimeIntelligence.impact ? {
    overallStatus: realtimeIntelligence.impact.overallStatus,
    riskLevel: realtimeIntelligence.impact.riskLevel,
    exposurePercentage: realtimeIntelligence.impact.exposurePercentage,
    affectedDays: realtimeIntelligence.impact.affectedDays || [],
    alertsCount: realtimeIntelligence.impact.alerts?.length || 0
  } : null;

  return {
    duration,
    trip: {
      duration,
      travelStyle,
      datesMode: dates.mode || "fixed",
      startDate: dates.start || null,
      endDate: dates.end || null
    },
    travelers: {
      total: travelers.total || 1,
      type: travelers.type || "solo",
      adults: travelers.adults || 1,
      children: travelers.children || 0,
      seniors: travelers.seniors || 0
    },
    destinations: selectedDests,
    budget: {
      level: budget.level || "comfortable",
      estimatedRange: budgetIntelligence?.estimatedRange || null
    },
    accommodation: {
      types: accommodation.types || [],
      comfort: accommodation.comfort || "standard"
    },
    transportation: {
      preferredModes: transportation.preferredModes || [],
      longDriveTolerance: transportation.longDriveTolerance || "moderate"
    },
    itinerary: itinerarySummary,
    realtime: realtimeSummary,
    constraints: activeConstraints || {}
  };
}
