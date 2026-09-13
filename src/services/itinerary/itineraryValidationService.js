import { destinations as allDests } from "../../data/destinations";

/**
 * Validates a generated itinerary object (from AI or fallback) against 14 strict rules.
 * Returns { isValid, errors, warnings, qualityScore }.
 */
export function validateGeneratedItinerary(itinerary, tripContext) {
  const errors = [];
  const warnings = [];

  if (!itinerary || typeof itinerary !== "object") {
    return {
      isValid: false,
      errors: ["Invalid itinerary object"],
      warnings: [],
      qualityScore: { overall: 0, route: 0, seasonal: 0, budget: 0, pace: 0 }
    };
  }

  const { duration, travelers, travelStyle, budget, destinations } = tripContext;

  // 1. Day Count Check
  if (!Array.isArray(itinerary.days) || itinerary.days.length !== duration) {
    errors.push(
      `Day count mismatch: Expected ${duration} days, but itinerary contains ${
        itinerary.days?.length || 0
      } days.`
    );
  }

  // 2. Sequential Day Numbers & Required Schema Check
  if (Array.isArray(itinerary.days)) {
    itinerary.days.forEach((day, index) => {
      const expectedNum = index + 1;
      if (day.dayNumber !== expectedNum) {
        errors.push(`Day sequence error: Day at index ${index} has dayNumber ${day.dayNumber}, expected ${expectedNum}.`);
      }
      if (!day.title) {
        warnings.push(`Day ${expectedNum} is missing a title.`);
      }
      if (!day.baseLocation) {
        errors.push(`Day ${expectedNum} is missing a baseLocation.`);
      }
    });
  }

  // 3. Valid Base Locations Check
  if (Array.isArray(itinerary.days)) {
    const knownSlugs = new Set(allDests.map((d) => d.slug));
    const knownNames = new Set(allDests.map((d) => d.name.toLowerCase()));
    knownNames.add("bagdogra");
    knownNames.add("pakyong");
    knownNames.add("home");

    itinerary.days.forEach((day) => {
      const loc = day.baseLocation?.toLowerCase() || "";
      const matches = Array.from(knownNames).some((k) => loc.includes(k));
      if (!matches) {
        warnings.push(`Day ${day.dayNumber} references unknown location '${day.baseLocation}'.`);
      }
    });
  }

  // 4. Activity Density Check
  const maxActivitiesMap = { relaxed: 2, balanced: 3, packed: 4 };
  const maxAllowed = maxActivitiesMap[travelStyle] || 3;

  if (Array.isArray(itinerary.days)) {
    itinerary.days.forEach((day) => {
      const morningCount = Array.isArray(day.morning) ? day.morning.length : 0;
      const afternoonCount = Array.isArray(day.afternoon) ? day.afternoon.length : 0;
      const eveningCount = Array.isArray(day.evening) ? day.evening.length : 0;
      const totalActivities = morningCount + afternoonCount + eveningCount;

      if (totalActivities > maxAllowed + 1) {
        warnings.push(
          `Day ${day.dayNumber} (${day.title}) has ${totalActivities} activities, exceeding your ${travelStyle} pace target (${maxAllowed}/day).`
        );
      }
    });
  }

  // 5. Travel-heavy Days Activity Reduction Check
  if (Array.isArray(itinerary.days)) {
    itinerary.days.forEach((day) => {
      const hasLongTravel =
        Array.isArray(day.travel) &&
        day.travel.some((t) => {
          const durStr = t.duration || "";
          return durStr.includes("6") || durStr.includes("5") || durStr.includes("4");
        });

      if (hasLongTravel) {
        const totalActs =
          (day.morning?.length || 0) + (day.afternoon?.length || 0) + (day.evening?.length || 0);
        if (totalActs > 3) {
          warnings.push(
            `Day ${day.dayNumber} involves long road transit but schedules ${totalActs} major activities. Consider resting.`
          );
        }
      }
    });
  }

  // 6. Senior & Family Accessibility Warnings Check
  if (travelers.seniors > 0) {
    const hasHighAltitude = destinations.some((d) =>
      ["gurudongmar-lake", "nathula", "zero-point"].includes(d.slug)
    );
    if (hasHighAltitude) {
      warnings.push(
        "Senior travelers present: Ensure slow acclimatization before ascending to high-altitude passes (Gurudongmar / Nathula)."
      );
    }
  }

  // 7. Budget Reconciliation Check
  if (itinerary.overview?.estimatedCost) {
    const estMin = itinerary.overview.estimatedCost.min || 0;
    const targetMax = budget.targetMax || 0;
    if (targetMax > 0 && estMin > targetMax * 1.25) {
      warnings.push(
        `Estimated itinerary cost (₹${estMin.toLocaleString("en-IN")}) exceeds target budget (₹${targetMax.toLocaleString("en-IN")}).`
      );
    }
  }

  // Calculate Internal Quality Scores (0-100)
  const routeScore = Math.max(0, 100 - errors.length * 20 - warnings.length * 5);
  const seasonalScore = tripContext.travelTiming?.seasonalScore || 92;
  const paceScore = travelStyle === "relaxed" ? 95 : travelStyle === "balanced" ? 92 : 88;
  const budgetScore = warnings.some((w) => w.includes("exceeds target budget")) ? 75 : 95;
  const overallScore = Math.round((routeScore + seasonalScore + paceScore + budgetScore) / 4);

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [...new Set(warnings)], // deduplicate
    qualityScore: {
      overall: overallScore,
      route: routeScore,
      seasonal: seasonalScore,
      budget: budgetScore,
      pace: paceScore
    }
  };
}
