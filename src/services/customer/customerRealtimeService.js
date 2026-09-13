/**
 * Customer Realtime Service — Module 11
 * Reuses Module 7 real-time travel intelligence engine to provide live Sikkim weather,
 * road advisories, and permit notifications to travelers.
 * Does NOT duplicate the core engine.
 */

import { checkTripRealtimeIntelligence } from "../realtime/realtimeIntelligenceService";

/**
 * Fetches current real-time travel intelligence for the customer's itinerary.
 * @param {object} booking - Customer-safe booking model
 */
export async function getCustomerRealtimeIntelligence(booking) {
  if (!booking || !booking.itinerary) {
    return {
      status: "unavailable",
      overallStatus: "⚪ CURRENT DATA UNAVAILABLE",
      statusColor: "neutral",
      riskLevel: "UNKNOWN",
      alerts: [],
      lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  }

  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  if (isMockMode) {
    // Construct planner-like state to interface seamlessly with Module 7 engine
    const destinations = booking.trip?.destinations || ["Gangtok"];
    const plannerState = {
      destinations: {
        selected: destinations.map(d => d.toLowerCase().replace(/\s+/g, "-"))
      },
      routeInfo: {
        regions: destinations.some(d => d.toLowerCase().includes("lachung") || d.toLowerCase().includes("yumthang"))
          ? ["North Sikkim", "East Sikkim"]
          : ["East Sikkim", "West Sikkim"]
      }
    };

    const result = await checkTripRealtimeIntelligence(booking.itinerary, plannerState);

    const impact = result.impact || {};
    let overallStatus = "🟢 TRAVEL STATUS LOOKING GOOD";
    let statusColor = "emerald";
    let riskLevel = impact.riskLevel || "LOW";

    if (impact.riskLevel === "HIGH" || (impact.alerts || []).some(a => a.severity === "HIGH" || a.severity === "WARNING")) {
      overallStatus = "🔴 SIGNIFICANT TRAVEL ATTENTION";
      statusColor = "rose";
      riskLevel = "HIGH";
    } else if (impact.riskLevel === "MEDIUM" || (impact.alerts && impact.alerts.length > 0)) {
      overallStatus = "🟡 SOMETHING TO WATCH";
      statusColor = "amber";
      riskLevel = "MEDIUM";
    } else if (result.status === "fallback" || !result.isCurrent) {
      overallStatus = "⚪ CURRENT DATA UNAVAILABLE";
      statusColor = "slate";
      riskLevel = "UNKNOWN";
    }

    return {
      status: result.status,
      isCurrent: result.isCurrent,
      overallStatus,
      statusColor,
      riskLevel,
      weather: result.data?.weather || {},
      advisories: result.data?.advisories || [],
      permits: result.data?.permits || [],
      impactAlerts: impact.alerts || [],
      exposurePercentage: impact.exposurePercentage || 0,
      lastUpdated: result.lastChecked || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    };
  }

  // Production API boundary
  try {
    const response = await fetch(`/api/customer/booking/${encodeURIComponent(booking.trackingToken)}/realtime`, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error("Failed to load live travel conditions.");
    }

    return response.json();
  } catch (err) {
    return {
      status: "fallback",
      overallStatus: "⚪ CURRENT DATA UNAVAILABLE",
      statusColor: "slate",
      riskLevel: "UNKNOWN",
      alerts: [],
      lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      message: err.message
    };
  }
}
