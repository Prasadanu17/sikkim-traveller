import { fetchDestinationWeather } from "./providers/weatherProvider";
import { fetchRegionalAdvisories } from "./providers/advisoryProvider";
import { fetchPermitIntelligence } from "./providers/permitProvider";
import { fetchDestinationStatuses } from "./providers/destinationStatusProvider";

/**
 * Provider Registry & Execution Manager.
 * Executes requests against providers with failure isolation (if one fails, others continue).
 */
export async function executeRealtimeProviders({ destinations = [], regions = [] }) {
  // Execute weather requests in parallel for all destinations
  const weatherPromises = destinations.map((slug) =>
    fetchDestinationWeather(slug).catch((err) => ({
      destinationSlug: slug,
      status: "unavailable",
      message: err.message
    }))
  );

  // Execute advisory, permit, and destination status requests concurrently
  const [weatherResults, advisoryResult, permitResult, statusResult] = await Promise.all([
    Promise.all(weatherPromises),
    fetchRegionalAdvisories(regions).catch(() => ({ advisories: [] })),
    fetchPermitIntelligence(regions).catch(() => ({ permitRules: [] })),
    fetchDestinationStatuses(destinations).catch(() => ({ destinationStatuses: {} }))
  ]);

  return {
    weather: weatherResults,
    advisories: advisoryResult.advisories || [],
    permits: permitResult.permitRules || [],
    statuses: statusResult.destinationStatuses || {},
    sources: [
      weatherResults[0]?.source,
      advisoryResult.source,
      permitResult.source,
      statusResult.source
    ].filter(Boolean)
  };
}
