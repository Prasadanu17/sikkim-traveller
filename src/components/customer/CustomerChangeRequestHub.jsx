/**
 * Customer Change Request Hub Component — Module 14
 * Allows travelers to submit structured change requests (dates, travelers, accommodation, transport, cancellation)
 * and track historical request lifecycle (SUBMITTED → UNDER_REVIEW → APPROVED / DECLINED).
 */

import { useState, useEffect } from "react";
import { RefreshCw, Send, CheckCircle, Clock, XCircle, AlertTriangle, Plus } from "lucide-react";
import { submitChangeRequest, getCustomerChangeRequests, CHANGE_REQUEST_TYPES, CHANGE_REQUEST_STATUSES } from "../../services/customer/customerChangeRequestService";

const REQUEST_TYPE_OPTIONS = [
  { type: CHANGE_REQUEST_TYPES.DATE_CHANGE, label: "Travel Date Shift" },
  { type: CHANGE_REQUEST_TYPES.TRAVELER_CHANGE, label: "Add/Remove Travelers" },
  { type: CHANGE_REQUEST_TYPES.ACCOMMODATION_CHANGE, label: "Accommodation Upgrade/Change" },
  { type: CHANGE_REQUEST_TYPES.TRANSPORTATION_CHANGE, label: "Vehicle / Driver Preference" },
  { type: CHANGE_REQUEST_TYPES.ITINERARY_CHANGE, label: "Itinerary Revision" },
  { type: CHANGE_REQUEST_TYPES.SPECIAL_REQUEST, label: "Dietary / Special Needs" },
  { type: CHANGE_REQUEST_TYPES.CANCELLATION, label: "Cancellation Request" }
];

export default function CustomerChangeRequestHub({ booking, onSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [requestType, setRequestType] = useState(CHANGE_REQUEST_TYPES.DATE_CHANGE);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [history, setHistory] = useState([]);

  const reqId = booking?.requestId || booking?.id || "GENERAL";

  const reloadHistory = () => {
    setHistory(getCustomerChangeRequests(reqId));
  };

  useEffect(() => {
    reloadHistory();
  }, [reqId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    const result = submitChangeRequest({
      requestId: reqId,
      bookingId: booking?.id || reqId,
      requestType,
      title: `Request for ${requestType.replace(/_/g, " ")}`,
      description,
      customerName: booking?.customer?.name || "Traveler",
      customerEmail: booking?.customer?.email || ""
    });

    setSubmitting(false);

    if (result.success) {
      setDescription("");
      setShowForm(false);
      setNotice({ type: "success", text: "Change request submitted! Our operations team will review it shortly." });
      reloadHistory();
      onSuccess?.();
    } else {
      setNotice({ type: "error", text: result.error || "Failed to submit change request." });
    }

    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Trip Modification & Change Requests</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Need to shift travel dates, modify group size, upgrade stay comfort, or request special arrangements? Submit a change request below.
          </p>
        </div>

        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 text-xs px-4 py-2.5 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Change Request
        </button>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl border text-xs ${notice.type === "success" ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300" : "bg-rose-950/40 border-rose-800/40 text-rose-300"}`}>
          {notice.text}
        </div>
      )}

      {/* Form Container */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white">Submit New Change Request</h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Modification Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {REQUEST_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setRequestType(opt.type)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      requestType === opt.type
                        ? "bg-amber-500/10 border-amber-500 text-amber-300 font-semibold"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Details & Reason for Request</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain the changes you would like to make (e.g. shift arrival date to Oct 12, add 1 adult traveler...)"
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Operations will recalculate itinerary feasibility and quote impact before finalizing.
              </span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="text-xs font-semibold px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 font-semibold text-sm text-slate-200">
          Request History — {reqId}
        </div>

        <div className="p-6 space-y-3">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Clock className="w-6 h-6 mx-auto text-slate-600" />
              <p className="text-xs">No change requests submitted yet.</p>
            </div>
          ) : (
            history.map(cr => (
              <div key={cr.changeRequestId} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{cr.title}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">ID: {cr.changeRequestId} • Submitted {new Date(cr.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>

                  <StatusBadge status={cr.status} />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  {cr.description}
                </p>

                {cr.reviewNotes && (
                  <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-lg p-2.5 text-xs text-indigo-300 italic">
                    <strong>Operations Note:</strong> {cr.reviewNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    [CHANGE_REQUEST_STATUSES.SUBMITTED]: "bg-blue-950/60 text-blue-300 border-blue-800/40",
    [CHANGE_REQUEST_STATUSES.UNDER_REVIEW]: "bg-amber-950/60 text-amber-300 border-amber-800/40 animate-pulse",
    [CHANGE_REQUEST_STATUSES.APPROVED]: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
    [CHANGE_REQUEST_STATUSES.DECLINED]: "bg-rose-950/60 text-rose-300 border-rose-800/40"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${styles[status] || styles[CHANGE_REQUEST_STATUSES.SUBMITTED]}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
