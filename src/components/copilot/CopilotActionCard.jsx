import { Check, Sparkles, X } from "lucide-react";

export default function CopilotActionCard({ actionCard, onApply, onCancel }) {
  if (!actionCard) return null;

  const { title, description, estimatedSavings, refinementInstruction, actionLabel } = actionCard;

  return (
    <div className="bg-cream border border-gold/40 rounded-2xl p-4 shadow-sm space-y-3 text-left my-2">
      <div className="flex items-center gap-1.5 font-bold text-xs text-pine font-display">
        <Sparkles size={14} className="text-gold-dark" />
        <span>{title || "Copilot Action Proposal"}</span>
      </div>

      <p className="text-xs text-neutral-700 leading-relaxed">{description}</p>

      {estimatedSavings && (
        <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-200">
          {estimatedSavings}
        </span>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gold/20">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-semibold text-neutral-500 hover:text-ink px-3 py-1"
          >
            Not Now
          </button>
        )}
        <button
          type="button"
          onClick={() => onApply(refinementInstruction || title)}
          className="inline-flex items-center gap-1 bg-pine text-gold text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gold hover:text-pine transition shadow-sm"
        >
          {actionLabel || "Apply Change"} <Check size={12} />
        </button>
      </div>
    </div>
  );
}
