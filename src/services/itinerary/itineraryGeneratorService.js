import { buildTripContext } from "./tripContextService";
import { buildItineraryPrompt } from "./itineraryPromptService";
import { validateGeneratedItinerary } from "./itineraryValidationService";
import { generateFallbackItinerary } from "./itineraryFallbackService";

/**
 * Unified AI Itinerary Generator Service.
 * SECURITY NOTICE: AI API keys are NEVER exposed in frontend client code or VITE_* env vars.
 * AI requests are routed through a secure backend proxy endpoint (/api/generate-itinerary).
 * In frontend-only local development or when backend is unready, it falls back to the deterministic engine.
 */
export async function generateItinerary(plannerState, regenerationPreference = null) {
  // 1. Build normalized single-source-of-truth trip context
  const tripContext = buildTripContext(plannerState);

  // Secure API endpoint (e.g. Serverless Function, Node backend, or Proxy)
  const apiEndpoint = import.meta.env?.VITE_ITINERARY_API_ENDPOINT || "/api/generate-itinerary";
  const { systemInstruction, userPrompt } = buildItineraryPrompt(tripContext, regenerationPreference);

  try {
    // Attempt secure server-side API call
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripContext,
        regenerationPreference,
        systemInstruction,
        userPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`Secure API endpoint returned status ${response.status}`);
    }

    const data = await response.json();
    const rawItinerary = data?.itinerary || data;

    // Validate returned JSON output
    const validation = validateGeneratedItinerary(rawItinerary, tripContext);
    rawItinerary.qualityScore = validation.qualityScore;

    if (validation.isValid) {
      return {
        itinerary: rawItinerary,
        source: "ai",
        message: "AI-generated itinerary via secure server endpoint."
      };
    } else {
      console.warn("[ItineraryEngine] Backend AI output did not pass route safety validation. Using fallback.");
      const fallback = generateFallbackItinerary(tripContext, regenerationPreference);
      return {
        itinerary: fallback,
        source: "fallback",
        message: "AI output did not pass route safety validation; using fallback."
      };
    }
  } catch (err) {
    // Expected in frontend-only local development or when backend proxy is not connected
    console.info("[ItineraryEngine] Backend API unavailable or offline mode. Using deterministic Sikkim intelligence fallback.", err.message);
    const fallbackItinerary = generateFallbackItinerary(tripContext, regenerationPreference);
    return {
      itinerary: fallbackItinerary,
      source: "fallback",
      message: "Generated using Sikkim Traveller's deterministic travel intelligence."
    };
  }
}
