/**
 * Trip Readiness Score Component — AI Trip Planner Dashboard
 * Displays real travel readiness score (0-100%) with labeled tiers and clickable checklist.
 * Never fabricates readiness scores.
 */

import { ShieldCheck, CheckCircle2, Circle, AlertTriangle } from "lucide-react";

const LABEL_STYLES = {
  "Trip Ready": "text-emerald-400",
  "Almost Ready": "text-sky-400",
  "In Progress": "text-amber-400",
  "Needs Attention": "text-rose-400"
};

const BAR_STYLES = {
  "Trip Ready": "from-emerald-500 to-emerald-400",
  "Almost Ready": "from-sky-500 to-emerald-400",
  "In Progress": "from-amber-500 to-amber-400",
  "Needs Attention": "from-rose-500 to-amber-400"
};

export default function TripReadinessScore({ readiness, onJumpToSection }) {
  const score = readiness?.score || 0;
  const label = readiness?.label || "Needs Attention";
  const checklist = readiness?.checklist || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" aria-hidden="true" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Travel Readiness</h2>
        </div>
        <span className={`text-lg font-bold font-mono ${LABEL_STYLES[label]}`} aria-label={`Travel readiness score: ${score} percent, ${label}`}>
          {score}%
        </span>
      </div>

      {/* Label */}
      <p className={`text-xs font-semibold ${LABEL_STYLES[label]}`}>{label}</p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`h-full bg-gradient-to-r ${BAR_STYLES[label]} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-1.5 pt-1">
        {checklist.map(item => (
          <button
            key={item.id}
            onClick={() => onJumpToSection?.(item.section)}
            className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-left hover:bg-slate-800/40 transition-colors cursor-pointer group"
            aria-label={`${item.completed ? "Completed" : "Pending"}: ${item.title}`}
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            )}
            <span className={item.completed ? "text-slate-300 font-medium" : "text-slate-400"}>
              {item.title}
            </span>
            {!item.completed && (
              <span className="ml-auto text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0">
                View →
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
