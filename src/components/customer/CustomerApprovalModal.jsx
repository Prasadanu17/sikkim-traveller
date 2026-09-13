import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, CheckSquare, Square, AlertCircle, Sparkles } from "lucide-react";
import { approveProposal } from "../../services/customer/customerApprovalService";

export default function CustomerApprovalModal({ isOpen, onClose, booking, onSuccess }) {
  const [reviewedDetails, setReviewedDetails] = useState(false);
  const [reviewedPrice, setReviewedPrice] = useState(false);
  const [understoodAvailability, setUnderstoodAvailability] = useState(false);
  const [agreedToProceed, setAgreedToProceed] = useState(false);
  const [customerName, setCustomerName] = useState(booking?.customer?.firstName || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const proposal = booking?.proposal;
  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";

  useEffect(() => {
    if (booking?.customer?.firstName) {
      setCustomerName(booking.customer.firstName);
    }
  }, [booking]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !proposal) return null;

  const allChecked = reviewedDetails && reviewedPrice && understoodAvailability && agreedToProceed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allChecked) {
      setError("Please check all four confirmation items before approving.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const result = await approveProposal(booking.trackingToken, proposal.version, {
        reviewedDetails,
        reviewedPrice,
        understoodAvailability,
        agreedToProceed,
        customerName: customerName.trim() || "Traveler"
      });

      onSuccess?.(result.booking);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit approval. Please try again.");
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
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 relative my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approvalModalTitle"
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
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Formal Proposal Review</span>
            </div>
            <h2 id="approvalModalTitle" className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
              Approve {proposal.versionLabel || "Proposal"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Total Investment: <strong className="text-white">₹{proposal.price.toLocaleString("en-IN")} {proposal.currency}</strong> for {booking.trip?.duration || 5} days.
            </p>
          </div>

          {/* Development simulation disclaimer */}
          {isMockMode && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Development Simulation Notice:</strong>
                <span>This mock approval will simulate the operations workflow and change your tracking status to Proposal Accepted.</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer name */}
            <div>
              <label htmlFor="approverName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Approver Full Name
              </label>
              <input
                id="approverName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                required
              />
            </div>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Required Confirmations
              </div>

              {/* Box 1 */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={reviewedDetails}
                  onChange={(e) => setReviewedDetails(e.target.checked)}
                  className="sr-only"
                />
                <div className="mt-0.5 text-amber-400">
                  {reviewedDetails ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </div>
                <span className="text-xs text-slate-300 leading-relaxed">
                  I have reviewed the trip details, day-by-day destinations, and accommodations.
                </span>
              </label>

              {/* Box 2 */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={reviewedPrice}
                  onChange={(e) => setReviewedPrice(e.target.checked)}
                  className="sr-only"
                />
                <div className="mt-0.5 text-amber-400">
                  {reviewedPrice ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </div>
                <span className="text-xs text-slate-300 leading-relaxed">
                  I have reviewed the final price and transparent inclusions/exclusions list.
                </span>
              </label>

              {/* Box 3 */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={understoodAvailability}
                  onChange={(e) => setUnderstoodAvailability(e.target.checked)}
                  className="sr-only"
                />
                <div className="mt-0.5 text-amber-400">
                  {understoodAvailability ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </div>
                <span className="text-xs text-slate-300 leading-relaxed">
                  I understand that vehicle and room allotments are subject to final operations confirmation and weather accessibility.
                </span>
              </label>

              {/* Box 4 */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToProceed}
                  onChange={(e) => setAgreedToProceed(e.target.checked)}
                  className="sr-only"
                />
                <div className="mt-0.5 text-amber-400">
                  {agreedToProceed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </div>
                <span className="text-xs text-slate-300 leading-relaxed font-medium">
                  I agree to proceed with this proposal and authorize Sikkim Traveller to place reservations.
                </span>
              </label>
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
                disabled={!allChecked || submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve Proposal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
