/**
 * Customer Proposal Panel — Module 11
 * Displays trip inclusion/exclusion sheets, and coordinates proposal acceptance signature and change requests.
 */
import { useState } from "react";
import { Check, X, FileText, CheckCircle, HelpCircle, Lock, Edit3 } from "lucide-react";
import { acceptProposal, requestChanges } from "../../services/customerPortal/customerPortalBookingService";

const CHANGE_CATEGORIES = [
  "Dates", "Budget", "Accommodation", "Transportation", "Itinerary", "Food", "Pace", "Other"
];

export default function CustomerProposal({ bookingId, proposal, status, onMutation }) {
  const [showSign, setShowSign] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [changeCategory, setChangeCategory] = useState("Itinerary");
  const [changeReason, setChangeReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!proposal) return null;

  const isPendingApproval = status === "PROPOSAL_SENT" || status === "AWAITING_CUSTOMER";
  const isAccepted = status === "CUSTOMER_ACCEPTED" || status === "READY_TO_CONFIRM" || status === "CONFIRMED" || status === "IN_PROGRESS" || status === "COMPLETED";

  const handleAccept = async () => {
    if (!signatureName.trim()) {
      setError("Please sign with your full name.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await acceptProposal(bookingId, signatureName);
      setShowSign(false);
      onMutation?.();
    } catch (err) {
      setError(err.message || "Failed to accept proposal.");
    }
    setSubmitting(false);
  };

  const handleRequestChange = async (e) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      setError("Please describe the requested changes.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await requestChanges(bookingId, changeCategory, changeReason);
      setShowChangeModal(false);
      setChangeReason("");
      onMutation?.();
    } catch (err) {
      setError(err.message || "Failed to submit change request.");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Inclusion / Exclusion sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Curated Proposal Inclusions
          </h2>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
            {proposal.versionLabel || "Proposal v1"}
          </span>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inclusions */}
            <div className="space-y-2">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Included Packages</p>
              <ul className="space-y-1.5 pl-1">
                {(proposal.inclusions || []).map((inc, i) => (
                  <li key={i} className="flex gap-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Exclusions */}
            <div className="space-y-2">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Excluded Items</p>
              <ul className="space-y-1.5 pl-1">
                {(proposal.exclusions || []).map((exc, i) => (
                  <li key={i} className="flex gap-2 text-slate-455">
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" /> <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-3 flex justify-between text-xs text-slate-500">
            <span>Proposal validity:</span>
            <span>Until {new Date(proposal.validUntil).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Action triggers */}
      {isPendingApproval && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-white text-sm font-semibold">Your Trip Proposal is Ready</h3>
            <p className="text-slate-450 text-xs mt-0.5">Please review the day itinerary, pricing quotes, and guesthouse verifications before accepting.</p>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            {!showSign ? (
              <button
                onClick={() => setShowSign(true)}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-50 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
              >
                <CheckCircle className="w-4 h-4" /> Accept & Confirm Proposal
              </button>
            ) : (
              <div className="w-full space-y-3 bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Enter your full name to sign electronically:</label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAccept}
                    disabled={submitting}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    {submitting ? "Signing..." : "Verify Sign & Accept"}
                  </button>
                  <button
                    onClick={() => { setShowSign(false); setSignatureName(""); setError(""); }}
                    className="text-xs bg-slate-800 text-slate-300 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!showSign && (
              <button
                onClick={() => setShowChangeModal(true)}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750 px-4 py-2.5 rounded-xl font-bold transition-all"
              >
                <Edit3 className="w-4 h-4" /> Request Adjustments
              </button>
            )}
          </div>
        </div>
      )}

      {isAccepted && (
        <div className="bg-emerald-950/15 border border-emerald-900/20 rounded-xl p-4 flex gap-2.5 items-center text-xs text-emerald-400">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <p>This proposal version has been approved. Pricing quotes and arrangements are locked.</p>
        </div>
      )}

      {/* Request Adjustments modal */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRequestChange} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" /> Request Trip Changes
              </h3>
              <button type="button" onClick={() => { setShowChangeModal(false); setError(""); }} className="text-slate-500 hover:text-white text-xs">✕</button>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Adjustment Category</label>
                <select
                  value={changeCategory}
                  onChange={e => setChangeCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-350 focus:outline-none focus:border-indigo-500"
                >
                  {CHANGE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Details (max 1000 characters)</label>
                <textarea
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  placeholder="Describe what you want to adjust (dates, stays comfort, transport options)..."
                  rows={4}
                  maxLength={1000}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="submit"
                disabled={submitting || !changeReason.trim()}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                {submitting ? "Sending..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => { setShowChangeModal(false); setError(""); }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
