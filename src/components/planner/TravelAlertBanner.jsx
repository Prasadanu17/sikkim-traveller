import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function TravelAlertBanner({ impact, onAskRefinement }) {
  if (!impact || !impact.alerts || impact.alerts.length === 0) return null;

  const { overallStatus, statusColor, alerts, exposurePercentage } = impact;

  const isRose = statusColor === "rose";
  const bgClass = isRose ? "bg-rose-50 border-rose-200 text-rose-950" : "bg-amber-50 border-amber-200 text-amber-950";
  const borderClass = isRose ? "border-rose-300" : "border-amber-300";
  const badgeClass = isRose ? "bg-rose-600 text-white" : "bg-amber-600 text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-5 shadow-sm ${bgClass} space-y-4 print:hidden`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-neutral-200/60">
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeClass}`}>
            {overallStatus}
          </span>
          <span className="text-xs font-semibold text-neutral-600">
            {exposurePercentage}% of itinerary days flagged
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 3).map((alert, idx) => (
          <div key={idx} className="bg-white/80 border border-neutral-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <AlertTriangle size={14} className={isRose ? "text-rose-600" : "text-amber-600"} />
                <span>{alert.title}</span>
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">{alert.message}</p>
            </div>

            {/* ACTIONABLE MODULE 6 REFINEMENT TRIGGER */}
            {alert.actionableRefinement && onAskRefinement && (
              <button
                type="button"
                onClick={() => onAskRefinement(alert.actionableRefinement.instruction)}
                className="inline-flex items-center gap-1 bg-pine text-gold text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-gold hover:text-pine transition shrink-0 shadow-sm"
              >
                <Sparkles size={11} /> {alert.actionableRefinement.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
