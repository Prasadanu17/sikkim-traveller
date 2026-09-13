import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, AlertTriangle, DollarSign, Clock, MapPin } from "lucide-react";

export default function ItineraryDiffView({ isOpen, beforeItinerary, afterItinerary, diffSummary, onApply, onCancel }) {
  if (!isOpen || !beforeItinerary || !afterItinerary) return null;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 text-left border border-gold/30 relative space-y-6"
        >
          {/* CLOSE */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-neutral-400 hover:text-ink transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* HEADER */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-dark bg-gold/10 px-2.5 py-0.5 rounded">
              Trip Change Preview
            </span>
            <h3 className="font-display text-xl text-ink font-bold mt-1">
              Review Proposed Itinerary Changes
            </h3>
          </div>

          {/* BEFORE vs AFTER GRID */}
          <div className="grid grid-cols-2 gap-4">

            {/* BEFORE */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Current Trip</span>
              <h4 className="font-display text-sm font-bold text-ink">{beforeItinerary.tripTitle || "Current Plan"}</h4>
              <div className="text-xs text-neutral-600 space-y-1 pt-1">
                <p className="flex items-center gap-1"><Clock size={12} /> {beforeItinerary.overview?.duration} Days</p>
                <p className="flex items-center gap-1"><DollarSign size={12} /> {formatPrice(beforeItinerary.overview?.estimatedCost?.min)}</p>
              </div>
            </div>

            {/* AFTER */}
            <div className="bg-cream border border-gold/40 rounded-xl p-4 space-y-2 shadow-gold-glow">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">Proposed Trip</span>
              <h4 className="font-display text-sm font-bold text-ink">{afterItinerary.tripTitle || "Updated Plan"}</h4>
              <div className="text-xs text-neutral-700 space-y-1 pt-1">
                <p className="flex items-center gap-1 font-semibold text-pine"><Clock size={12} /> {afterItinerary.overview?.duration} Days</p>
                <p className="flex items-center gap-1 font-semibold text-pine"><DollarSign size={12} /> {formatPrice(afterItinerary.overview?.estimatedCost?.min)}</p>
              </div>
            </div>
          </div>

          {/* CHANGES SUMMARY LIST */}
          {diffSummary && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Summary of Changes</span>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">{diffSummary.explanation}</p>
              {diffSummary.formattedDiff && (
                <span className="inline-block text-[11px] font-bold text-pine bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Budget Impact: {diffSummary.formattedDiff}
                </span>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-neutral-500 hover:text-ink px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              className="inline-flex items-center gap-1.5 rounded-full bg-pine text-parchment font-semibold text-xs px-6 py-2.5 hover:bg-gold hover:text-pine transition shadow-premium"
            >
              Apply Changes <Check size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
