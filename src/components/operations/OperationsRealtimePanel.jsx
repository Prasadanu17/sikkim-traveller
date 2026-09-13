/**
 * Operations Realtime Panel — Module 10
 * Shows Module 7 travel intelligence with refresh capability.
 * Warns on stale data before confirmation.
 */
import { useState } from "react";
import { RefreshCw, AlertTriangle, Clock } from "lucide-react";
import { checkTripRealtimeIntelligence } from "../../services/realtime/realtimeIntelligenceService";
import { updateRealtimeSnapshot } from "../../services/operations/operationsBookingService";

const RISK_COLORS = {
  LOW:     "text-emerald-400",
  MEDIUM:  "text-amber-400",
  HIGH:    "text-red-400",
  UNKNOWN: "text-slate-400"
};

export default function OperationsRealtimePanel({ booking, currentUser, onMutation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);
  const snapshot = booking.realtimeSnapshot;

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const itinerary = booking.itineraryVersions?.[booking.itineraryVersions.length - 1];
      const mockPlannerState = {
        destinations: { selected: booking.destinations || [] },
        routeInfo: { regions: ["Sikkim"] }
      };
      const result = await checkTripRealtimeIntelligence(itinerary, mockPlannerState);
      const newSnapshot = {
        overallStatus: result.impact?.overallStatus || result.fallbackInfo?.summary || "⚪ No current data",
        riskLevel: result.impact?.riskLevel || "UNKNOWN",
        alerts: result.impact?.alerts || [],
        lastChecked: result.lastChecked || new Date().toLocaleTimeString()
      };
      updateRealtimeSnapshot(booking.id, newSnapshot, currentUser?.id, currentUser?.role, currentUser?.name);
      setRefreshResult({ success: true, data: newSnapshot });
      onMutation?.();
    } catch (_err) {
      setRefreshResult({ success: false });
    }
    setRefreshing(false);
  };

  const isStale = !snapshot?.lastChecked;
  const hasAlerts = (snapshot?.alerts || []).length > 0;
  const riskLevel = snapshot?.riskLevel || "UNKNOWN";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm">Realtime Travel Intelligence</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Intelligence"}
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Stale Warning */}
        {isStale && (
          <div className="flex items-start gap-2 bg-amber-950/30 border border-amber-800/30 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-300 text-xs">⚠ No realtime data recorded. Refresh travel intelligence before proceeding with confirmation.</p>
          </div>
        )}

        {/* Overall Status */}
        <div className="space-y-2">
          <p className="text-slate-400 text-sm">{snapshot?.overallStatus || "⚪ No current data available."}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">Risk Level:</span>
            <span className={`font-semibold ${RISK_COLORS[riskLevel] || RISK_COLORS.UNKNOWN}`}>{riskLevel}</span>
          </div>
          {snapshot?.lastChecked && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Clock className="w-3 h-3" />
              Last checked: {snapshot.lastChecked}
            </div>
          )}
        </div>

        {/* Active Alerts */}
        {hasAlerts && (
          <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider">Active Advisories</p>
            {snapshot.alerts.map((alert, i) => (
              <div key={i} className="bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2 text-amber-300 text-xs">
                ⚠ {alert.message || alert.title || JSON.stringify(alert)}
              </div>
            ))}
          </div>
        )}

        {/* Refresh Result */}
        {refreshResult && (
          <div className={`rounded-lg px-4 py-3 text-sm border ${refreshResult.success ? "bg-emerald-950/30 border-emerald-800/30 text-emerald-300" : "bg-red-950/30 border-red-800/30 text-red-300"}`}>
            {refreshResult.success
              ? `✓ Intelligence refreshed. Risk: ${refreshResult.data?.riskLevel || "UNKNOWN"}.`
              : "⚠ Could not refresh. Live provider unavailable — static fallback applied."}
          </div>
        )}

        {/* Pre-confirmation Advisory */}
        {hasAlerts && riskLevel === "HIGH" && (
          <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 text-sm space-y-1">
            <p className="text-red-300 font-semibold">🔴 High Risk Advisory Active</p>
            <p className="text-red-400 text-xs">Current travel conditions have changed. Operator review required before confirmation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
