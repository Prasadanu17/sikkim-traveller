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

  // 5. Trip Structural Change (Destination remove/add, duration extend, budget reduction)
  // Modify tripContext and re-run deterministic fallback generator
  const updatedContext = JSON.parse(JSON.stringify(tripContext));

  if (intentType === "remove_destination" && (intent.targetDestination || changes.removeDestination)) {
    const targetSlug = intent.targetDestination || changes.removeDestination;
    updatedContext.destinations = updatedContext.destinations.filter(
      (d) => d.slug !== targetSlug
    );
  }

  if (intentType === "add_destination" && (intent.targetDestination || changes.addDestination)) {
    const targetSlug = intent.targetDestination || changes.addDestination;
    if (!updatedContext.destinations.some((d) => d.slug === targetSlug)) {
      updatedContext.destinations.push({
        slug: targetSlug,
        name: targetSlug.charAt(0).toUpperCase() + targetSlug.slice(1),
        district: targetSlug.includes("pelling") || targetSlug.includes("yuksom") ? "West Sikkim" : "East Sikkim"
      });
    }
  }

  if (intentType === "change_duration" && (changes.duration || intent.changes?.duration)) {
    updatedContext.duration = Number(changes.duration || intent.changes?.duration);
  }

  if (intentType === "reduce_budget") {
    updatedContext.budget.level = "budget";
    if (changes.budgetCap) {
      updatedContext.budget.estimatedMin = Math.round(changes.budgetCap * 0.85);
      updatedContext.budget.estimatedMax = changes.budgetCap;
    }
    updatedContext.transportation.preferredModes = ["shared-sumo"];
    updatedContext.accommodation.types = ["homestay"];
  }

  if (intentType === "increase_budget") {
    updatedContext.budget.level = "premium";
    updatedContext.transportation.preferredModes = ["premium-private"];
  }

  if (changes.transportMode) {
    updatedContext.transportation.preferredModes = [changes.transportMode];
  }

  if (changes.accommodationType) {
    updatedContext.accommodation.types = [changes.accommodationType];
  }

  // Re-generate deterministic itinerary using modified context
  return generateFallbackItinerary(updatedContext, { mode: intentType });
}
