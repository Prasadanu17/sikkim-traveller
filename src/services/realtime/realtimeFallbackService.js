/**
 * Static Real-Time Intelligence Fallback Service.
 * Provides static seasonal climate data and permit guidelines when live sources are offline.
 * Clearly tags outputs as GENERAL rather than CURRENT.
 */

export function getStaticIntelligenceFallback(destinations = []) {
  return {
    isLive: false,
    label: "GENERAL TRAVEL INTELLIGENCE",
    message: "Live real-time conditions unavailable. Showing general seasonal guidelines.",
    seasonalGuidance: "Autumn (Oct–Nov) and Spring (Mar–May) offer optimal weather conditions across Sikkim.",
    retrievedAt: new Date().toISOString()
  };
}
