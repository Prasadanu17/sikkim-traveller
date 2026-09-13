import { getBestTravelWindow } from "../travelIntelligence/bestTimeService";
import { getRecommendedDestinations } from "../travelIntelligence/destinationRecommendationService";
import { estimateTripBudget } from "../travelIntelligence/budgetService";
import { getTravelPreferenceRecommendations } from "../travelIntelligence/travelPreferenceService";
import { fetchDestinationWeather } from "../realtime/providers/weatherProvider";
import { fetchRegionalAdvisories } from "../realtime/providers/advisoryProvider";
import { fetchPermitIntelligence } from "../realtime/providers/permitProvider";
import { fetchDestinationStatuses } from "../realtime/providers/destinationStatusProvider";
import { refineTripItinerary } from "../itinerary/itineraryRefinementService";

/**
 * Approved Tool Registry.
 * Exposes approved service methods from Modules 1–7 to the Copilot.
 */
export const TOOL_REGISTRY = {
  // READ-ONLY TOOLS
  getBestTimeInsight: {
    type: "READ",
    handler: (params) => getBestTravelWindow(params)
  },
  getDestinationRecommendation: {
    type: "READ",
    handler: (params) => getRecommendedDestinations(params)
  },
  getBudgetEstimate: {
    type: "READ",
    handler: (params) => estimateTripBudget(params)
  },
  getTravelPreferences: {
    type: "READ",
    handler: (params) => getTravelPreferenceRecommendations(params)
  },
  getCurrentWeather: {
    type: "READ",
    handler: (slug) => fetchDestinationWeather(slug)
  },
  getCurrentTravelAdvisories: {
    type: "READ",
    handler: (regions) => fetchRegionalAdvisories(regions)
  },
  getPermitInformation: {
    type: "READ",
    handler: (regions) => fetchPermitIntelligence(regions)
  },
  getDestinationStatus: {
    type: "READ",
    handler: (slugs) => fetchDestinationStatuses(slugs)
  },

  // WRITE / MUTATING TOOLS (Delegated to Module 6)
  refineItinerary: {
    type: "WRITE",
    handler: (plannerState, itinerary, requestInput) => refineTripItinerary(plannerState, itinerary, requestInput)
  }
};
