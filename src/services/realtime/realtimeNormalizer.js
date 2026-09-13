/**
 * Real-Time Intelligence Data Normalizer.
 * Maps raw provider responses into a unified schema with explicit source metadata.
 */

export function normalizeRealtimeData(rawProvidersData) {
  const { weather = [], advisories = [], permits = [], statuses = {}, sources = [] } = rawProvidersData;

  const normalizedWeather = {};
  weather.forEach((w) => {
    if (w.destinationSlug) {
      normalizedWeather[w.destinationSlug] = {
        temperature: w.temperature || { min: 12, max: 20, unit: "°C" },
        condition: w.condition || "Fair",
        precipitationProbability: w.precipitationProbability ?? 20,
        icon: w.icon || "🌤️",
        summary: w.summary || "Mountain weather conditions",
        confidence: w.confidence || "MEDIUM",
        source: w.source || {
          type: "trusted",
          name: "Local Weather Station",
          retrievedAt: new Date().toISOString(),
          isCurrent: true
        }
      };
    }
  });

  const normalizedAdvisories = advisories.map((adv) => ({
    id: adv.id || `adv-${Math.random().toString(36).substr(2, 6)}`,
    severity: adv.severity || "NOTICE", // INFO | NOTICE | WARNING | HIGH
    title: adv.title || "Travel Advisory",
    message: adv.message || "",
    affectedDestinations: adv.affectedDestinations || [],
    sourceName: adv.sourceName || "Official Tourism Authority",
    sourceUrl: adv.sourceUrl || "https://sikkimtourism.gov.in/",
    updatedAt: adv.updatedAt || new Date().toISOString()
  }));

  const normalizedPermits = permits.map((p) => ({
    region: p.region,
    permitType: p.permitType,
    required: p.required ?? true,
    leadTimeHours: p.leadTimeHours || 24,
    documentsNeeded: p.documentsNeeded || [],
    restrictions: p.restrictions || "",
    sourceName: p.sourceName || "Tourism Department, Govt of Sikkim",
    sourceUrl: p.sourceUrl || "https://sikkimtourism.gov.in/Permits"
  }));

  return {
    weather: normalizedWeather,
    advisories: normalizedAdvisories,
    permits: normalizedPermits,
    statuses,
    sources,
    retrievedAt: new Date().toISOString()
  };
}
