import { applyItineraryPatch } from "./itineraryPatchService";
import { generateFallbackItinerary } from "./itineraryFallbackService";

/**
 * Deterministic Refinement Fallback Generator.
 * Handles natural language and structured intent refinement requests offline
 * without breaking the existing itinerary state.
 */
export function refineFallbackItinerary(existingItinerary, tripContext, intent) {
  const { intent: intentType, targetDay, changes } = intent;

  // 1. Localized Pace / Day Changes
  if (intentType === "change_day_pace" && targetDay) {
    return applyItineraryPatch(existingItinerary, {
      operation: "update_day_pace",
      targetDay,
      changes: { pace: changes.pace || "relaxed" }
    });
  }

  // 2. Trip-Wide Pace Change
  if (intentType === "change_trip_pace" || intentType === "increase_free_time") {
    return applyItineraryPatch(existingItinerary, {
      operation: "relax_trip",
      changes: {}
    });
  }

  // 3. Transport Mode Change
  if (intentType === "change_transport" && changes.transportMode) {
    return applyItineraryPatch(existingItinerary, {
      operation: "update_transport",
      changes: { transportMode: changes.transportMode }
    });
  }

  // 4. Accommodation Type Change
  if (intentType === "change_accommodation" && changes.accommodationType) {
    return applyItineraryPatch(existingItinerary, {
      operation: "update_accommodation",
      changes: { accommodationType: changes.accommodationType }
    });
  }

  // 5. Trip Structural Change (Destination remove/add, duration extend)
  // Modify tripContext and re-run deterministic fallback generator
  const updatedContext = JSON.parse(JSON.stringify(tripContext));

  if (intentType === "remove_destination" && intent.targetDestination) {
    updatedContext.destinations = updatedContext.destinations.filter(
      (d) => d.slug !== intent.targetDestination
    );
  }

  if (intentType === "reduce_budget") {
    updatedContext.budget.level = "budget";
    updatedContext.transportation.preferredModes = ["shared-sumo"];
  }

  if (intentType === "increase_budget") {
    updatedContext.budget.level = "premium";
    updatedContext.transportation.preferredModes = ["premium-private"];
  }

  // Re-generate deterministic itinerary using modified context
  return generateFallbackItinerary(updatedContext, { mode: intentType });
}
