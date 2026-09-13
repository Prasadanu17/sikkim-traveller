/**
 * Operations Alerts — Module 10
 * Dashboard views and filter panel for all system alerts.
 */
import { useState } from "react";
import { ShieldCheck, RefreshCw, Info } from "lucide-react";
import { ALERT_SEVERITY, ALERT_SEVERITY_STYLES } from "../../services/operations/operationsAlertService";

const SEVERITY_OPTIONS = ["ALL", "URGENT", "WARNING", "READY"];

export default function OperationsAlerts({ alerts = [], onOpenDetail, onRefresh }) {
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter === "ALL") return true;
    return alert.severity === severityFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Alerts</h1>
          <p className="text-slate-400 text-sm">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? "s" : ""} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          {SEVERITY_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setSeverityFilter(opt)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                severityFilter === opt
                  ? "bg-indigo-600 border-indigo-500 text-white font-medium shadow-md shadow-indigo-900/20"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {opt === "ALL" ? "All Severities" : opt}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all shrink-0"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-600" />
            <p className="text-slate-400 text-sm font-medium">All systems green.</p>
            <p className="text-slate-600 text-xs">No active alerts match the selected severity filter.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const styles = ALERT_SEVERITY_STYLES[alert.severity] || ALERT_SEVERITY_STYLES.INFO;
            
            // Map Tailwind classes to a premium dark-mode safe styling since the app is dark themed
            const darkBg = alert.severity === ALERT_SEVERITY.URGENT 
              ? "bg-red-950/20 border-red-800/40 hover:border-red-600/50 text-red-200" 
              : alert.severity === ALERT_SEVERITY.WARNING
              ? "bg-amber-950/20 border-amber-800/30 hover:border-amber-600/50 text-amber-200"
              : alert.severity === ALERT_SEVERITY.READY
              ? "bg-emerald-950/20 border-emerald-800/30 hover:border-emerald-600/50 text-emerald-200"
              : "bg-blue-950/20 border-blue-800/30 hover:border-blue-600/50 text-blue-200";

            return (
              <div
                key={alert.id}
                className={`border rounded-xl p-4 flex items-start justify-between gap-4 transition-all ${darkBg}`}
              >
                <div className="flex gap-3">
                  <span className="text-lg shrink-0 mt-0.5" role="img" aria-label={alert.severity}>
                    {styles.icon}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm leading-tight text-white">{alert.title}</p>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wider ${styles.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{alert.message}</p>
                    {alert.requestId && (
                      <p className="text-slate-500 text-[10px] font-mono">Request: {alert.requestId}</p>
                    )}
                  </div>
                </div>

                {alert.bookingId && (
                  <button
                    onClick={() => onOpenDetail(alert.bookingId)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0"
                  >
                    Resolve Details
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex gap-3 text-xs text-slate-500">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-400">About System Alerts</p>
          <p className="leading-relaxed">
            Alerts are auto-generated dynamically based on real booking parameters (such as trip start dates, permit requirements, verification statuses, and weather/road advisories). Staff must systematically review and resolve all alerts to successfully pass the Confirmation Gate for any request.
          </p>
        </div>
      </div>
    </div>
  );
}
