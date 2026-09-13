import { validateGeneratedItinerary } from "./itineraryValidationService";
import { estimateTripBudget } from "../travelIntelligence/budgetService";
import { validateDestinationCombination } from "../travelIntelligence/destinationRecommendationService";

/**
 * Refinement Validation & Tradeoff Intelligence Service.
 * Validates modified itineraries, recalculates dynamic budgets, detects route tradeoffs,
 * and proposes smart alternatives when a user's request creates conflicts.
 */
export function validateRefinement(existingItinerary, updatedItinerary, tripContext, intent) {
  const validation = validateGeneratedItinerary(updatedItinerary, tripContext);
  const warnings = [...validation.warnings];
  let tradeoffNotice = null;

  // 1. Recalculate Budget via budgetService
  const newBudgetEstimate = estimateTripBudget({
    duration: tripContext.duration,
    travelers: tripContext.travelers,
    destinations: tripContext.destinations.map((d) => d.slug),
    travelStyle: updatedItinerary.overview?.travelStyle || tripContext.travelStyle,
    budgetLevel: tripContext.budget.level,
    accommodationTypes: tripContext.accommodation.types,
    transportModes: tripContext.transportation.preferredModes
  });

  // Calculate budget impact diff
  const oldMin = existingItinerary?.overview?.estimatedCost?.min || tripContext.budget.estimatedMin;
  const newMin = newBudgetEstimate.estimatedRange.min;
  const budgetDiffMin = newMin - oldMin;

  // 2. Tradeoff Detection (e.g. Adding distant destination or packing too many stops)
  if (intent.intent === "add_destination" && intent.targetDestination) {
    const routeCheck = validateDestinationCombination({
      selectedSlugs: [...tripContext.destinations.map((d) => d.slug), intent.targetDestination],
      duration: tripContext.duration
    });

    if (!routeCheck.isValid) {
      tradeoffNotice = {
        title: "Route Tradeoff Detected",
        message: `Adding ${intent.targetDestination} creates a scattered route with 6-8 hours of driving for a ${tripContext.duration}-day trip.`,
        alternatives: [
          { label: "Extend trip by 2 days", action: "extend_duration", days: 2 },
          { label: "Replace high-altitude loop", action: "replace_loop", target: intent.targetDestination },
          { label: "Keep current route", action: "cancel" }
        ]
      };
    }
  }

  // 3. Quality Score Impact Comparison
  const oldScore = existingItinerary?.qualityScore?.overall || 90;
  const newScore = validation.qualityScore.overall;

  return {
    isValid: validation.isValid,
    updatedItinerary: {
      ...updatedItinerary,
      overview: {
        ...updatedItinerary.overview,
        estimatedCost: newBudgetEstimate.estimatedRange
      },
      budget: {
        accommodation: { min: Math.round(newMin * 0.4), max: Math.round(newMin * 0.48) },
        transportation: { min: Math.round(newMin * 0.35), max: Math.round(newMin * 0.42) },
        food: { min: Math.round(newMin * 0.15), max: Math.round(newMin * 0.18) },
        activities: { min: Math.round(newMin * 0.07), max: Math.round(newMin * 0.1) },
        miscellaneous: { min: Math.round(newMin * 0.03), max: Math.round(newMin * 0.05) },
        total: newBudgetEstimate.estimatedRange
      },
      qualityScore: validation.qualityScore
    },
    budgetImpact: {
      diffMin: budgetDiffMin,
      formattedDiff: budgetDiffMin > 0 ? `+₹${budgetDiffMin.toLocaleString("en-IN")}` : budgetDiffMin < 0 ? `-₹${Math.abs(budgetDiffMin).toLocaleString("en-IN")}` : "No cost change"
    },
    qualityImpact: {
      before: oldScore,
      after: newScore,
      diff: newScore - oldScore
    },
    tradeoffNotice,
    warnings
  };
}
