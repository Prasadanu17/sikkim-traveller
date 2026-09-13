import { prepareRouteBlueprint } from "./routePreparationService";
import { validateGeneratedItinerary } from "./itineraryValidationService";

/**
 * Deterministic offline itinerary generator.
 * Builds a structured, day-by-day Sikkim itinerary using exact destination metadata,
 * route blueprints, travel pace limits, and budget config.
 */
export function generateFallbackItinerary(tripContext, regenerationPreference = null) {
  const {
    duration,
    interests,
    destinations,
    travelers,
    travelStyle,
    budget,
    accommodation,
    transportation,
    travelTiming
  } = tripContext;

  // Generate route blueprint
  const blueprint = prepareRouteBlueprint(tripContext);
  const destNames = destinations.map((d) => d.name);

  // Apply regeneration preferences if provided
  let effectivePace = travelStyle;
  if (regenerationPreference?.mode === "more_relaxed") effectivePace = "relaxed";
  if (regenerationPreference?.mode === "more_sightseeing") effectivePace = "packed";

  // Build days array from blueprint
  const days = blueprint.dayBlueprints.map((bp, bpIndex) => {
    const matchedDest = destinations.find((d) => d.name.toLowerCase() === bp.baseLocation.toLowerCase());
    const highlights = matchedDest?.highlights || ["Scenic mountain views", "Local village walk", "Cultural tea tasting"];

    // Morning activity
    const morningActs = [
      {
        title: bp.primaryActivities[0] || "Morning exploration & view point",
        description: `Explore local sights around ${bp.baseLocation}. ${highlights[0] ? `Enjoy ${highlights[0]}.` : ""}`,
        duration: "2.5 hours"
      }
    ];

    // Afternoon activity (if pace allows)
    const afternoonActs = [];
    if (effectivePace !== "relaxed" || bp.primaryActivities.length > 1) {
      afternoonActs.push({
        title: bp.primaryActivities[1] || "Cultural sight & monastery visit",
        description: `Visit key landmarks in ${bp.baseLocation}. ${highlights[1] ? `Featured stop: ${highlights[1]}.` : ""}`,
        duration: "2 hours"
      });
    }

    // Evening activity
    const eveningActs = [
      {
        title: bp.primaryActivities[2] || "Evening promenade & local cuisine",
        description: `Stroll through the local evening area and enjoy a authentic Sikkimese dinner.`,
        duration: "2 hours"
      }
    ];

    // Travel transit segment if applicable
    const prevLocation = bpIndex > 0 ? blueprint.dayBlueprints[bpIndex - 1]?.baseLocation : null;
    const travelSegments = bp.transit
      ? [
          {
            from: bp.transit.note.includes("Return") ? bp.baseLocation : (prevLocation || "Bagdogra / Pakyong Airport"),
            to: bp.baseLocation,
            duration: bp.transit.hours,
            mode: transportation.preferredModes[0] === "shared-sumo" ? "Shared Sumo" : "Private Cab / SUV"
          }
        ]
      : [];

    // Daily estimated cost calculations
    const dailyBaseMin = Math.round(budget.estimatedMin / duration);
    const dailyBaseMax = Math.round(budget.estimatedMax / duration);

    // Notes & Warnings per day
    const dayNotes = [];
    const dayWarnings = [];

    // Carry over permit/weather notes from the route blueprint (set by routePreparationService)
    if (bp.permitNote) {
      dayNotes.push(bp.permitNote);
    }
    if (bp.weatherNote) {
      dayNotes.push(bp.weatherNote);
    }

    if (bp.baseLocation.toLowerCase().includes("lachung") || bp.baseLocation.toLowerCase().includes("lachen")) {
      if (!bp.permitNote) {
        dayNotes.push("Inner Line Permit (ILP) required for North Sikkim circuit — arrange through registered tour operator in Gangtok.");
      }
      dayNotes.push("High altitude area (2,750m+) — carry warm layers; temperatures drop sharply after sunset.");
    }
    if (bp.primaryActivities.some((a) => a.includes("Nathula") || a.includes("Tsomgo"))) {
      dayNotes.push("Nathula Pass requires a separate restricted area permit and is subject to army clearance and weather conditions.");
    }
    if (bp.primaryActivities.some((a) => a.includes("Gurudongmar"))) {
      dayNotes.push("Gurudongmar excursion requires an early 4:00 AM departure from Lachen due to the 3.5 hr drive and afternoon wind conditions at 5,430m.");
      dayWarnings.push("Altitude sickness risk: Gurudongmar Lake at 5,430m is extremely high — do not attempt without prior acclimatization.");
    }

    const accomTypeLabel = accommodation.types[0]
      ? accommodation.types[0].charAt(0).toUpperCase() + accommodation.types[0].slice(1)
      : "Comfortable Homestay / Hotel";

    return {
      dayNumber: bp.dayNumber,
      date: travelTiming.start || null,
      title: bp.title,
      baseLocation: bp.baseLocation,
      morning: morningActs,
      afternoon: afternoonActs,
      evening: eveningActs,
      travel: travelSegments,
      meals: [
        "Fresh mountain breakfast",
        "Local lunch en-route",
        `Traditional Sikkimese dinner in ${bp.baseLocation}`
      ],
      overnight: {
        location: bp.overnightLocation,
        accommodationType: `${accomTypeLabel} in ${bp.baseLocation}`
      },
      estimatedCost: {
        min: dailyBaseMin,
        max: dailyBaseMax,
        currency: "INR"
      },
      notes: dayNotes,
      warnings: dayWarnings
    };
  });

  // Calculate budget breakdown categories using actual estimatedMin/Max values.
  // Use consistent split ratios so that category totals reconcile with the displayed range.
  const minBase = budget.estimatedMin || 0;
  const maxBase = budget.estimatedMax || 0;
  // Proportional splits (must sum to 1.0): Stay 38%, Transport 36%, Food 16%, Activities 7%, Misc 3%
  const SPLITS = { accommodation: 0.38, transportation: 0.36, food: 0.16, activities: 0.07, miscellaneous: 0.03 };

  const budgetBreakdown = {
    accommodation: {
      min: Math.round(minBase * SPLITS.accommodation / 1000) * 1000,
      max: Math.round(maxBase * SPLITS.accommodation / 1000) * 1000
    },
    transportation: {
      min: Math.round(minBase * SPLITS.transportation / 1000) * 1000,
      max: Math.round(maxBase * SPLITS.transportation / 1000) * 1000
    },
    food: {
      min: Math.round(minBase * SPLITS.food / 1000) * 1000,
      max: Math.round(maxBase * SPLITS.food / 1000) * 1000
    },
    activities: {
      min: Math.round(minBase * SPLITS.activities / 1000) * 1000,
      max: Math.round(maxBase * SPLITS.activities / 1000) * 1000
    },
    miscellaneous: {
      min: Math.round(minBase * SPLITS.miscellaneous / 1000) * 1000,
      max: Math.round(maxBase * SPLITS.miscellaneous / 1000) * 1000
    }
  };

  // Capitalize traveler type for display (e.g. "couple" → "Couple")
  const travelerTypeLabel = travelers.type
    ? travelers.type.charAt(0).toUpperCase() + travelers.type.slice(1)
    : "Group";

  const rawItinerary = {
    tripTitle: `${duration}-Day Personalised Sikkim ${destNames[0] || "Himalayan"} Circuit`,
    summary: `A carefully planned ${duration}-day Sikkim journey tailored for ${travelers.total} traveler(s) (${travelerTypeLabel}) featuring ${destNames.join(", ")}. Designed for a ${effectivePace} pace.`,
    overview: {
      duration,
      travelers: travelers.total,
      travelerType: travelerTypeLabel,
      travelStyle: effectivePace,
      route: destNames,
      estimatedCost: {
        min: minBase,
        max: maxBase,
        currency: "INR"
      }
    },
    whyThisTripWorks: [
      `Optimized for your ${travelTiming.season} season travel window`,
      `Matches your interests (${interests.slice(0, 3).join(", ") || "Nature & Culture"})`,
      `Geographically sensible route with zero excessive backtracking`,
      `Accommodates your ${effectivePace} travel pace with dedicated rest slots`
    ],
    days,
    budget: {
      ...budgetBreakdown,
      total: { min: minBase, max: maxBase }
    },
    importantNotes: [
      "All costs are planning estimates for reference. Actual prices may vary based on availability, season, and operator rates.",
      "Protected Area Permits (PAP) are processed locally 24 hours prior to travel for North/East Sikkim routes.",
      "Weather in high mountain passes can fluctuate rapidly — flex time is built into your route."
    ],
    warnings: []
  };

  // Run through validator to attach quality scores
  const validation = validateGeneratedItinerary(rawItinerary, tripContext);
  rawItinerary.qualityScore = validation.qualityScore;

  return rawItinerary;
}
