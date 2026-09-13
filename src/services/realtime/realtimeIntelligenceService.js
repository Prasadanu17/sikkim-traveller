import { executeRealtimeProviders } from "./realtimeProviderRegistry";
import { normalizeRealtimeData } from "./realtimeNormalizer";
import { analyzeRealtimeImpact } from "./realtimeImpactService";
import { deduplicateRequest } from "./realtimeCacheService";
import { getStaticIntelligenceFallback } from "./realtimeFallbackService";

/**
 * Unified Master Real-Time Travel Intelligence Service.
 * Coordinates data provider execution, caching, normalization, and itinerary impact analysis.
 */
export async function checkTripRealtimeIntelligence(itinerary, plannerState) {
  if (!itinerary || !plannerState) {
    return {
      status: "unavailable",
      impact: null,
      message: "Itinerary context required."
    };
  }

  const selectedDests = plannerState.destinations?.selected || [];
  const regions = plannerState.routeInfo?.regions || ["East Sikkim", "North Sikkim"];
  const cacheKey = `realtime_${selectedDests.sort().join("_")}`;

  try {
    const rawData = await deduplicateRequest(cacheKey, () =>
      executeRealtimeProviders({ destinations: selectedDests, regions })
    );

    const normalized = normalizeRealtimeData(rawData);
    const impact = analyzeRealtimeImpact(itinerary, normalized);

    return {
      status: "success",
      isCurrent: true,
      data: normalized,
      impact,
      lastChecked: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  } catch (err) {
    console.warn("[RealtimeEngine] Failed to fetch live conditions, using static fallback:", err.message);
    const staticFallback = getStaticIntelligenceFallback(selectedDests);
    return {
      status: "fallback",
      isCurrent: false,
      data: null,
      impact: {
        overallStatus: "⚪ CURRENT DATA UNAVAILABLE",
        statusColor: "neutral",
        riskLevel: "UNKNOWN",
        exposurePercentage: 0,
        affectedDays: [],
        alerts: [],
        recommendations: []
      },
      fallbackInfo: staticFallback,
      lastChecked: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  }
}
