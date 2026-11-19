import { parseRefinementIntent } from "./refinementIntentService";
import { applyItineraryPatch } from "./itineraryPatchService";
import { validateRefinement } from "./refinementValidationService";
import { refineFallbackItinerary } from "./refinementFallbackService";
import { buildTripContext } from "./tripContextService";
import { API_ENDPOINTS } from "../../config/apiConfig";

/**
 * Master Itinerary Refinement Service.
 * Coordinates natural language intent parsing, deterministic patching, AI/fallback execution,
 * budget recalculations, and tradeoff detection.
 */
export async function refineTripItinerary(plannerState, existingItinerary, requestInput) {
  const tripContext = buildTripContext(plannerState);
  const intent = parseRefinementIntent(requestInput);

  // Secure API endpoint check
  const apiEndpoint = API_ENDPOINTS.REFINE_ITINERARY;

  let updatedItinerary = null;
  let source = "fallback";

  // Check if request is a fast localized patch (e.g. Day pace adjustment, transport mode, stay type)
  if (intent.intent === "change_day_pace" && intent.targetDay) {
    updatedItinerary = applyItineraryPatch(existingItinerary, {
      operation: "update_day_pace",
      targetDay: intent.targetDay,
      changes: intent.changes
    });
  } else if (intent.intent === "change_transport" && intent.changes.transportMode) {
    updatedItinerary = applyItineraryPatch(existingItinerary, {
      operation: "update_transport",
      changes: intent.changes
    });
  } else if (intent.intent === "change_accommodation" && intent.changes.accommodationType) {
    updatedItinerary = applyItineraryPatch(existingItinerary, {
      operation: "update_accommodation",
      changes: intent.changes
    });
  } else {
    // Attempt secure server API call for complex multi-day or natural language restructuring
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tripContext,
          existingItinerary,
          intent,
          requestInput
        })
      });

      if (response.ok) {
        const data = await response.json();
        updatedItinerary = data?.itinerary || data;
        source = "ai";
      } else {
        throw new Error(`API Endpoint returned status ${response.status}`);
      }
    } catch (err) {
      // Backend unavailable or frontend-only dev mode -> use deterministic refinement engine
      updatedItinerary = refineFallbackItinerary(existingItinerary, tripContext, intent);
      source = "fallback";
    }
  }

  // Fallback check safety net
  if (!updatedItinerary) {
    updatedItinerary = refineFallbackItinerary(existingItinerary, tripContext, intent);
    source = "fallback";
  }

  // Validate, recalculate budget, and check tradeoffs
  const validationResult = validateRefinement(existingItinerary, updatedItinerary, tripContext, intent);

  // Generate concise human explanation of what was updated
  let explanation = "Your trip itinerary has been updated to match your preferences.";
  if (intent.intent === "change_day_pace" && intent.targetDay) {
    explanation = `Day ${intent.targetDay} is now more relaxed with built-in rest periods.`;
  } else if (intent.intent === "change_trip_pace") {
    explanation = "Adjusted activity density across all days for a more relaxed travel pace.";
  } else if (intent.intent === "remove_destination") {
    explanation = `Removed ${intent.targetDestination || "destination"} from your route and re-allocated your days.`;
  } else if (intent.intent === "reduce_budget") {
    explanation = "Optimized transport and stay selections to reduce your overall estimated budget.";
  }

  return {
    updatedItinerary: validationResult.updatedItinerary,
    source,
    explanation,
    intent,
    affectedDays: intent.targetDay ? [intent.targetDay] : [1, 2, 3],
    budgetImpact: validationResult.budgetImpact,
    qualityImpact: validationResult.qualityImpact,
    tradeoffNotice: validationResult.tradeoffNotice,
    warnings: validationResult.warnings
  };
}
