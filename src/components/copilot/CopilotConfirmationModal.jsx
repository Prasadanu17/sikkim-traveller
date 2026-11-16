import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, X, Sparkles } from "lucide-react";

export default function CopilotConfirmationModal({
  isOpen,
  title,
  description,
  expectedImpact,
  estimatedSavings,
  actionLabel,
  isApplying = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left border border-gold/30 relative space-y-5"
        >
          <div className="flex items-center gap-3 text-amber-900 font-bold font-display text-lg">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <h3>{title || "Confirm Trip Modification"}</h3>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            {description || "This action will refine your current itinerary route and update day-by-day activities."}
          </p>

          {(estimatedSavings || expectedImpact) && (
            <div className="bg-cream p-3 rounded-xl border border-gold/30 space-y-1.5">
              {estimatedSavings && (
                <div className="text-[11px] font-bold text-emerald-800">
                  💰 {estimatedSavings}
                </div>
              )}
              {expectedImpact && (
                <div className="text-[11px] text-neutral-700">
                  ⚡ {expectedImpact}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              disabled={isApplying}
              onClick={onCancel}
              className="text-xs font-semibold text-neutral-500 hover:text-ink px-4 py-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isApplying}
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 rounded-full bg-pine text-parchment font-semibold text-xs px-6 py-2.5 hover:bg-gold hover:text-pine transition shadow-premium disabled:opacity-50"
            >
              {isApplying ? "Applying..." : (actionLabel || "Apply Change")} <Check size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
