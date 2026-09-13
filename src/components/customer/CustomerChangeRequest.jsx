import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Calendar, MapPin, Hotel, Car, DollarSign, Activity, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { submitChangeRequest } from "../../services/customer/customerBookingService";

const CHANGE_CATEGORIES = [
  { key: "DATES", label: "Change Dates", icon: Calendar },
  { key: "DESTINATIONS", label: "Change Destinations", icon: MapPin },
  { key: "ACCOMMODATION", label: "Change Accommodation", icon: Hotel },
  { key: "TRANSPORTATION", label: "Change Vehicle / Transport", icon: Car },
  { key: "BUDGET_REDUCE", label: "Reduce Budget / Cost", icon: DollarSign },
  { key: "BUDGET_INCREASE", label: "Upgrade / Increase Budget", icon: DollarSign },
  { key: "PACE", label: "Change Itinerary Pace", icon: Activity },
  { key: "ACTIVITY", label: "Add / Remove Activity", icon: Sparkles },
  { key: "GENERAL", label: "General Request / Other", icon: Sparkles }
];

export default function CustomerChangeRequest({ isOpen, onClose, booking, onSuccess }) {
  const [category, setCategory] = useState("GENERAL");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 5) {
      setError("Please describe the modifications you would like our team to make (at least 5 characters).");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const result = await submitChangeRequest(booking.trackingToken, {
        category,
        description: description.trim()
      });

      setSuccessResult(result);
      onSuccess?.(result.booking);
      setTimeout(() => {
        setSuccessResult(null);
        setDescription("");
        onClose();
      }, 2200);
    } catch (err) {
      setError(err.message || "Failed to submit change request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 relative my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="changeRequestModalTitle"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Trip Customization Desk
            </span>
            <h2 id="changeRequestModalTitle" className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
              Request Itinerary or Date Changes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Let us know what you would like to customize. Our destination architect will update your itinerary and publish a revised proposal.
            </p>
          </div>

          {/* Success state */}
          {successResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-center space-y-3"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">Change Request Received</h3>
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                {successResult.message || "Your adjustments have been submitted to the operations desk."}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category selector chips */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category of Modification
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CHANGE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 text-amber-300 font-semibold"
                            : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span className="text-xs truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <label htmlFor="changeDescription" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  What would you like us to change?
                </label>
                <textarea
                  id="changeDescription"
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Please add an extra night in Lachung to visit Zero Point, and switch to a valley-facing suite in Gangtok..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 leading-relaxed resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Input is sanitized before submission.</span>
                  <span>{description.length}/2000 chars</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || description.trim().length < 5}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
