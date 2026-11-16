import { Check, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";

const CATEGORY_TAGS = {
  BUDGET: { label: "Budget", className: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  DAY_PACE: { label: "Day Pace", className: "bg-sky-100 text-sky-800 border-sky-300" },
  TRANSPORT: { label: "Transport", className: "bg-amber-100 text-amber-800 border-amber-300" },
  ACCOMMODATION: { label: "Stay", className: "bg-purple-100 text-purple-800 border-purple-300" },
  DURATION: { label: "Duration", className: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  DESTINATION: { label: "Route", className: "bg-rose-100 text-rose-800 border-rose-300" }
};

export default function CopilotActionCard({ actionCard, onApply, onCancel, isApplying = false }) {
  if (!actionCard) return null;

  const {
    id,
    category,
    title,
    description,
    estimatedSavings,
    expectedImpact,
    refinementInstruction,
    actionLabel,
    status = "pending"
  } = actionCard;

  const tag = CATEGORY_TAGS[category] || { label: "Proposal", className: "bg-neutral-100 text-neutral-800 border-neutral-300" };
  const isApplied = status === "applied";
  const isCancelled = status === "cancelled";

  return (
    <div className={`border rounded-2xl p-4 shadow-sm space-y-3 text-left my-2 transition-all ${
      isApplied
        ? "bg-emerald-50/60 border-emerald-300 opacity-90"
        : isCancelled
        ? "bg-neutral-100/60 border-neutral-200 opacity-70"
        : "bg-cream border-gold/40"
    }`}>
      {/* HEADER WITH CATEGORY BADGE */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-bold text-xs text-pine font-display">
          <Sparkles size={14} className="text-gold-dark shrink-0" />
          <span>{title || "Copilot Action Proposal"}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag.className}`}>
          {tag.label}
        </span>
      </div>

      <p className="text-xs text-neutral-700 leading-relaxed">{description}</p>

      {/* METRIC PILLS (SAVINGS & IMPACT) */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {estimatedSavings && (
          <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
            {estimatedSavings}
          </span>
        )}
        {expectedImpact && (
          <span className="inline-block text-[11px] font-medium text-neutral-700 bg-white/80 px-2.5 py-0.5 rounded-md border border-neutral-200">
            ⚡ {expectedImpact}
          </span>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gold/20">
        {isApplied ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <Check size={12} /> Applied to Itinerary
          </span>
        ) : isCancelled ? (
          <span className="text-xs text-neutral-400 italic">
            Proposal dismissed
          </span>
        ) : (
          <>
            <button
              type="button"
              disabled={isApplying}
              onClick={() => onCancel && onCancel(id || actionCard)}
              className="text-[11px] font-semibold text-neutral-500 hover:text-ink px-3 py-1 transition disabled:opacity-50"
            >
              Not Now
            </button>
            <button
              type="button"
              disabled={isApplying}
              onClick={() => onApply && onApply(actionCard)}
              className="inline-flex items-center gap-1 bg-pine text-gold text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gold hover:text-pine transition shadow-sm disabled:opacity-50"
            >
              {isApplying ? "Applying..." : (actionLabel || "Apply Change")} <Check size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
