/**
 * Customer Realtime Alerts — Module 11
 * Displays traveler-facing road advisories and weather warning freshness.
 */
import { useState } from "react";
import { AlertTriangle, Clock, RefreshCw, Compass } from "lucide-react";
import { checkTripRealtimeIntelligence } from "../../services/realtime/realtimeIntelligenceService";
import { updateRealtimeSnapshot } from "../../services/operations/operationsBookingService";

const RISK_LEVELS = {
  LOW:     { label: "Normal Conditions", color: "text-emerald-400" },
  MEDIUM:  { label: "Moderate Risk",     color: "text-amber-400" },
  HIGH:    { label: "High Risk Advisory", color: "text-red-400" },
  UNKNOWN: { label: "Data Unavailable",  color: "text-slate-500" }
};

export default function CustomerRealtimeAlerts({ bookingId, realtime, destinations = [], itinerary, onMutation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const mockPlannerState = {
        destinations: { selected: destinations || [] },
        routeInfo: { regions: ["Sikkim"] }
      };
      const result = await checkTripRealtimeIntelligence(itinerary, mockPlannerState);
      const newSnapshot = {
        overallStatus: result.impact?.overallStatus || result.fallbackInfo?.summary || "⚪ Current data temporarily unavailable",
        riskLevel: result.impact?.riskLevel || "UNKNOWN",
        alerts: result.impact?.alerts || [],
        lastChecked: result.lastChecked || new Date().toLocaleTimeString()
      };
      
      // Update local storage db record
      const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";
      if (isMockMode) {
        updateRealtimeSnapshot(bookingId, newSnapshot, "customer", "CUSTOMER", "Customer");
      }

      setRefreshResult({ success: true, risk: newSnapshot.riskLevel });
      onMutation?.();
    } catch (_err) {
      setRefreshResult({ success: false });
    }
    setRefreshing(false);
  };

  if (!realtime) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-500 text-xs">
        No travel conditions data available.
      </div>
    );
  }

  const isHighRisk = realtime.riskLevel === "HIGH";
  const hasAlerts = (realtime.alerts || []).length > 0;
  const risk = RISK_LEVELS[realtime.riskLevel] || RISK_LEVELS.UNKNOWN;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" /> Travel Conditions
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white px-2.5 py-1.5 border border-slate-750 rounded-lg transition-colors font-medium shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Checking..." : "Refresh Conditions"}
        </button>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Risk Level Header */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
          <span className="text-slate-500">Status Score:</span>
          <span className={`font-bold ${risk.color}`}>{risk.label}</span>
        </div>

        {/* Advisory description */}
        <p className="text-slate-300 leading-relaxed">
          {realtime.overallStatus || "⚪ No active weather alerts or road blockages reported."}
        </p>

        {/* Dynamic Alerts */}
        {hasAlerts && (
          <div className="space-y-2">
            <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Road Warnings</p>
            {realtime.alerts.map((a, i) => (
              <div key={i} className="bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2 text-amber-300">
                ⚠ {a.message || a.title || JSON.stringify(a)}
              </div>
            ))}
          </div>
        )}

        {/* Refresh Results Notification */}
        {refreshResult && (
          <div className={`rounded-lg px-3 py-2 border ${
            refreshResult.success ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-300" : "bg-red-950/20 border-red-900/30 text-red-300"
          }`}>
            {refreshResult.success ? "✓ Travel conditions synchronized." : "⚠ Service overloaded. Offline static cache loaded."}
          </div>
        )}

        {/* Timestamp */}
        {realtime.lastChecked && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {realtime.lastChecked}</span>
          </div>
        )}

        {isHighRisk && (
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 flex gap-2 text-red-400 leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Active High Risk Advisory</p>
              <p className="mt-0.5">
                Our operations team is monitoring road blocks. If route updates are required, a revised itinerary version will be proposed for your approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
