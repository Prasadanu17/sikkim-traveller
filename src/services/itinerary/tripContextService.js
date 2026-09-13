import { destinations as allDests } from "../../data/destinations";

/**
 * Normalizes raw React planner state into a clean, single-source-of-truth context object.
 * Strips UI-only state and enriches destination/seasonal/traveler/budget metadata.
 */
export function buildTripContext(state) {
  const {
    dates,
    duration,
    interests,
    destinations,
    travelers,
    travelStyle,
    budget,
    budgetIntelligence,
    travelIntelligence,
    accommodation,
    transportation,
    travelPreferences
  } = state;

  // Resolve selected destination objects from metadata
  const selectedDestObjects = destinations.selected
    .map((slug) => allDests.find((d) => d.slug === slug))
    .filter(Boolean);

  // Group selected destinations by region
  const regionBreakdown = {};
  selectedDestObjects.forEach((d) => {
    regionBreakdown[d.region] = (regionBreakdown[d.region] || 0) + 1;
  });

  // Calculate seasonal summary
  const recommendedSeason = travelIntelligence?.recommendedSeason || "Autumn";
  const seasonScore = travelIntelligence?.seasonalScore || 90;

  // Format budget numbers cleanly
  const estimatedMin = budgetIntelligence?.estimatedRange?.min || 0;
  const estimatedMax = budgetIntelligence?.estimatedRange?.max || 0;

  return {
    travelTiming: {
      mode: dates.mode,
      start: dates.start,
      end: dates.end,
      season: recommendedSeason,
      seasonalScore: seasonScore,
      recommendedMonths: travelIntelligence?.recommendedMonths || ["October", "November"]
    },
    duration: Number(duration) || 5,
    interests: [...interests],
    destinations: selectedDestObjects.map((d) => ({
      name: d.name,
      slug: d.slug,
      region: d.region,
      elevation: d.elevation,
      overnight: d.overnight,
      recommendedDuration: d.recommendedDuration,
      highlights: d.highlights,
      interests: d.interests
    })),
    routeInfo: {
      regions: Object.keys(regionBreakdown),
      regionCounts: regionBreakdown,
      isValid: destinations.routeAnalysis?.isValid ?? true,
      warnings: destinations.routeAnalysis?.warnings || []
    },
    travelers: {
      type: travelers.type || "group",
      adults: Number(travelers.adults) || 1,
      children: Number(travelers.children) || 0,
      seniors: Number(travelers.seniors) || 0,
      total: Number(travelers.total) || 1
    },
    travelStyle: travelStyle || "balanced", // relaxed | balanced | packed
    budget: {
      mode: budget.mode || "estimate",
      level: budget.level || "comfortable",
      targetMin: budget.targetMin || 0,
      targetMax: budget.targetMax || 0,
      estimatedMin,
      estimatedMax,
      currency: "INR"
    },
    accommodation: {
      mode: accommodation.mode || "recommend",
      types: accommodation.types.length > 0 ? accommodation.types : ["homestay", "hotel"],
      comfort: accommodation.comfort || budget.level || "comfortable",
      roomPreference: accommodation.roomPreference || "no-preference",
      locationPreferences: accommodation.locationPreferences || [],
      priorities: accommodation.priorities || []
    },
    transportation: {
      mode: transportation.mode || "recommend",
      preferredModes: transportation.preferredModes.length > 0 ? transportation.preferredModes : ["private-cab"],
      comfort: transportation.comfort || "balanced",
      longDriveTolerance: transportation.longDriveTolerance || "comfortable",
      transferPreference: transportation.transferPreference || "balanced",
      arrivalPreference: transportation.arrivalPreference || "flexible",
      departurePreference: transportation.departurePreference || "flexible"
    },
    travelPreferences: {
      notes: travelPreferences?.notes || [],
      accommodationSuggestions: travelPreferences?.accommodationSuggestions || [],
      transportSuggestions: travelPreferences?.transportSuggestions || []
    }
  };
}
