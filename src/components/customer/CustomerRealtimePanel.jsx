import { useState, useEffect } from "react";
import { CloudRain, Compass, AlertTriangle, RefreshCw, ShieldCheck, Sun, Wind, Mountain, Clock } from "lucide-react";
import { getCustomerRealtimeIntelligence } from "../../services/customer/customerRealtimeService";

export default function CustomerRealtimePanel({ booking }) {
  const [realtimeData, setRealtimeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("");

  const loadRealtime = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const data = await getCustomerRealtimeIntelligence(booking);
      setRealtimeData(data);
      setLastRefreshed(data.lastUpdated || new Date().toLocaleTimeString());
    } catch (_err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealtime();
  }, [booking?.trackingToken]);

  const impactAlerts = realtimeData?.impactAlerts || [];
  const advisories = realtimeData?.advisories || [];
  const weather = realtimeData?.weather || {};

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Real-Time Travel Intelligence</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Module 7 Live Feed</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mt-1">
            Live Himalayan Road & Weather Status
          </h2>
        </div>

        <button
          type="button"
          onClick={loadRealtime}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Main Condition Indicator Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
              realtimeData?.riskLevel === "HIGH"
                ? "bg-rose-950/60 border border-rose-700 text-rose-400"
                : realtimeData?.riskLevel === "MEDIUM"
                ? "bg-amber-950/60 border border-amber-700 text-amber-400"
                : "bg-emerald-950/60 border border-emerald-700 text-emerald-400"
            }`}
          >
            {realtimeData?.riskLevel === "HIGH" ? "🔴" : realtimeData?.riskLevel === "MEDIUM" ? "🟡" : "🟢"}
          </div>

          <div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight">
              {realtimeData?.overallStatus || "🟢 TRAVEL STATUS LOOKING GOOD"}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live conditions across {(booking?.trip?.destinations || ["Gangtok"]).join(", ")}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 self-end sm:self-auto bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated: {lastRefreshed || "Just now"}</span>
        </div>
      </div>

      {/* Weather Highlights for Destinations */}
      {Object.keys(weather).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Destination Forecasts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(weather).map(([slug, w]) => (
              <div
                key={slug}
                className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white capitalize">{slug.replace(/-/g, " ")}</span>
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-white">{w.temp || "18°C"}</div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{w.condition || "Clear skies"}</span>
                  <span className="text-cyan-400 font-mono">{w.precipitationProbability || 10}% rain</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Advisories & Impact Alerts */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Road Advisories & Travel Alerts ({impactAlerts.length + advisories.length})
        </h3>

        {impactAlerts.length === 0 && advisories.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All primary Himalayan highways and mountain passes on your route are clear and operating normally.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {[...impactAlerts, ...advisories].map((alert, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800 text-amber-400 font-bold text-[10px] uppercase">
                    {alert.severity || "NOTICE"}
                  </span>
                  <span className="font-semibold text-white">{alert.title}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
