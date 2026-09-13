/**
 * Operations Quote Panel — Module 10
 * Versioned quote management with price breakdown and comparison to AI estimate.
 */
import { useState } from "react";
import { Plus } from "lucide-react";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { addQuote, updateQuoteStatus, formatBreakdown } from "../../services/operations/operationsQuoteService";
import { QUOTE_STATUSES } from "../../services/operations/operationsContextService";
import { saveMockBookings, loadMockBookings } from "../../services/operations/operationsFallbackService";

const QUOTE_STATUS_COLORS = {
  DRAFT: "bg-slate-700 text-slate-300",
  INTERNAL_REVIEW: "bg-blue-900 text-blue-300",
  SENT_TO_CUSTOMER: "bg-indigo-900 text-indigo-300",
  CUSTOMER_ACCEPTED: "bg-green-900 text-green-300",
  CUSTOMER_DECLINED: "bg-red-900 text-red-300",
  EXPIRED: "bg-gray-700 text-gray-400"
};

const BREAKDOWN_FIELDS = [
  { key: "accommodation", label: "Accommodation (₹)" },
  { key: "transport", label: "Transport (₹)" },
  { key: "meals", label: "Meals (₹)" },
  { key: "permits", label: "Permits (₹)" },
  { key: "activities", label: "Activities (₹)" },
  { key: "guide", label: "Guide (₹)" },
  { key: "taxes", label: "Taxes & Fees (₹)" },
  { key: "other", label: "Other (₹)" },
  { key: "discount", label: "Discount (₹) —" },
  { key: "additionalCharges", label: "Additional Charges (₹) +" }
];

const EMPTY_BREAKDOWN = { accommodation: "", transport: "", meals: "", permits: "", activities: "", guide: "", taxes: "", other: "", discount: "", additionalCharges: "" };

export default function OperationsQuotePanel({ booking, currentUser, onMutation }) {
  const [showForm, setShowForm] = useState(false);
  const [breakdown, setBreakdown] = useState(EMPTY_BREAKDOWN);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const canAddQuote = hasPermission(currentUser?.role, "canAddQuote");
  const quotes = booking.quotes || [];
  const aiMin = booking.budget?.aiEstimate?.min;
  const aiMax = booking.budget?.aiEstimate?.max;

  const previewTotal = () => {
    const keys = ["accommodation","transport","meals","permits","activities","guide","taxes","other"];
    const sub = keys.reduce((acc, k) => acc + (Number(breakdown[k]) || 0), 0);
    return sub - (Number(breakdown.discount) || 0) + (Number(breakdown.additionalCharges) || 0);
  };

  const handleAddQuote = () => {
    setSaving(true);
    const updated = addQuote(booking, breakdown, currentUser?.name || currentUser?.id, currentUser?.role, reason);
    if (updated?.quotes?.length > 0) {
      const all = loadMockBookings();
      const idx = all.findIndex(b => b.id === booking.id);
      if (idx !== -1) { all[idx] = updated; saveMockBookings(all); }
    }
    setSaving(false);
    setShowForm(false);
    setBreakdown(EMPTY_BREAKDOWN);
    setReason("");
    onMutation?.();
  };

  const handleStatusChange = (quoteId, newStatus) => {
    const updated = updateQuoteStatus(booking, quoteId, newStatus, currentUser?.id, currentUser?.role);
    if (updated) {
      const all = loadMockBookings();
      const idx = all.findIndex(b => b.id === booking.id);
      if (idx !== -1) { all[idx] = updated; saveMockBookings(all); }
      onMutation?.();
    }
  };

  return (
    <div className="space-y-5">
      {/* Budget Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-4">Budget Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BudgetCard label="AI Estimate" value={aiMin && aiMax ? `₹${aiMin.toLocaleString("en-IN")} – ₹${aiMax.toLocaleString("en-IN")}` : "Not available"} sub="AI-generated estimate" color="text-slate-300" />
          <BudgetCard label="Operations Quote" value={booking.budget?.operationsQuote ? `₹${Number(booking.budget.operationsQuote).toLocaleString("en-IN")}` : "Not set"} sub="Latest operations quote" color="text-indigo-300" />
          <BudgetCard label="Customer Quote" value={quotes.find(q => q.status === "SENT_TO_CUSTOMER")?.total ? `₹${quotes.find(q => q.status === "SENT_TO_CUSTOMER").total.toLocaleString("en-IN")}` : "Not sent"} sub="Sent to customer" color="text-emerald-300" />
        </div>
      </div>

      {/* Quote Versions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold text-sm">Quote History</h2>
          {canAddQuote && (
            <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
              <Plus className="w-3 h-3" /> New Quote
            </button>
          )}
        </div>

        {/* New Quote Form */}
        {showForm && canAddQuote && (
          <div className="p-5 border-b border-slate-800 space-y-4">
            <p className="text-slate-400 text-sm font-medium">New {`Quote v${quotes.length + 1}`}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BREAKDOWN_FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-500 block mb-1">{f.label}</label>
                  <input type="number" min="0" value={breakdown[f.key]}
                    onChange={e => setBreakdown(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-3">
              <span className="text-slate-400 text-sm">Estimated Total</span>
              <span className="text-white font-bold text-lg">₹{previewTotal().toLocaleString("en-IN")}</span>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Reason / Notes for this Quote</label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Updated accommodation rates, added guide fees..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddQuote} disabled={saving} className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors">
                {saving ? "Saving..." : "Save Quote"}
              </button>
              <button onClick={() => setShowForm(false)} className="text-xs px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quote List */}
        {quotes.length === 0 ? (
          <div className="p-5 text-slate-500 text-sm text-center">No quotes created yet.</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {quotes.map(quote => {
              const lines = formatBreakdown(quote);
              return (
                <div key={quote.id} className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-200 font-semibold text-sm">{quote.versionLabel}</p>
                      <p className="text-slate-500 text-xs">{new Date(quote.createdAt).toLocaleDateString("en-IN")} · {quote.createdBy}</p>
                      {quote.reason && <p className="text-slate-500 text-xs italic">{quote.reason}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">₹{Number(quote.total).toLocaleString("en-IN")}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${QUOTE_STATUS_COLORS[quote.status] || QUOTE_STATUS_COLORS.DRAFT}`}>
                        {quote.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  {/* Breakdown */}
                  {lines.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      {lines.map(l => (
                        <div key={l.label} className="flex justify-between">
                          <span className="text-slate-500">{l.label}</span>
                          <span className="text-slate-300">₹{Number(l.value).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      {quote.discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount</span><span>-₹{Number(quote.discount).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Status Change */}
                  {canAddQuote && (
                    <div className="flex gap-2 flex-wrap">
                      {QUOTE_STATUSES.filter(s => s !== quote.status).map(s => (
                        <button key={s} onClick={() => handleStatusChange(quote.id, s)}
                          className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                          → {s.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetCard({ label, value, sub, color }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`font-bold text-lg ${color}`}>{value}</p>
      <p className="text-slate-600 text-xs mt-0.5">{sub}</p>
    </div>
  );
}
