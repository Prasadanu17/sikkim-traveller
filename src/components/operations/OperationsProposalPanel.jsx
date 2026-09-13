/**
 * Operations Proposal Panel — Module 10
 * Proposal versioning, customer approval tracking, and stale approval protection.
 */
import { useState } from "react";
import { AlertTriangle, Send, CheckCircle, XCircle } from "lucide-react";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { addProposal, markProposalSent, recordCustomerAcceptance, recordCustomerDecline, checkApprovalFreshness } from "../../services/operations/operationsProposalService";
import { saveMockBookings, loadMockBookings } from "../../services/operations/operationsFallbackService";

export default function OperationsProposalPanel({ booking, currentUser, onMutation }) {
  const [showForm, setShowForm] = useState(false);
  const [inclusions, setInclusions] = useState("Airport/station transfer, all accommodation, private vehicle, driver, basic activities");
  const [exclusions, setExclusions] = useState("International flights, personal expenses, travel insurance, entry fees, tips");
  const [validDays, setValidDays] = useState(7);
  const [declineReason, setDeclineReason] = useState("");
  const [customerName, setCustomerName] = useState(booking.customer?.name || "");
  const [saving, setSaving] = useState(false);

  const canSend = hasPermission(currentUser?.role, "canSendProposal");
  const proposals = booking.proposals || [];
  const approvalFreshness = checkApprovalFreshness(booking);
  const activeQuotes = booking.quotes || [];
  const latestAcceptedQuote = activeQuotes.filter(q => q.status === "CUSTOMER_ACCEPTED").pop()
    || activeQuotes.filter(q => q.status === "INTERNAL_REVIEW").pop()
    || activeQuotes[activeQuotes.length - 1];

  const saveToDB = (updatedBooking) => {
    const all = loadMockBookings();
    const idx = all.findIndex(b => b.id === booking.id);
    if (idx !== -1) { all[idx] = updatedBooking; saveMockBookings(all); }
    onMutation?.();
  };

  const handleCreateProposal = () => {
    setSaving(true);
    const updated = addProposal(booking, {
      quoteId: latestAcceptedQuote?.id,
      inclusions: inclusions.split("\n").map(s => s.trim()).filter(Boolean),
      exclusions: exclusions.split("\n").map(s => s.trim()).filter(Boolean),
      validDays: Number(validDays),
      createdBy: currentUser?.name,
      createdByRole: currentUser?.role
    });
    saveToDB(updated);
    setSaving(false);
    setShowForm(false);
  };

  const handleSend = () => {
    setSaving(true);
    const updated = markProposalSent(booking, currentUser?.id, currentUser?.role);
    saveToDB(updated);
    setSaving(false);
  };

  const handleAccept = () => {
    setSaving(true);
    const updated = recordCustomerAcceptance(booking, customerName || booking.customer?.name, currentUser?.id, currentUser?.role);
    saveToDB(updated);
    setSaving(false);
  };

  const handleDecline = () => {
    if (!declineReason.trim()) return;
    setSaving(true);
    const updated = recordCustomerDecline(booking, declineReason, currentUser?.id, currentUser?.role);
    saveToDB(updated);
    setSaving(false);
    setDeclineReason("");
  };

  return (
    <div className="space-y-5">
      {/* Customer Approval Status */}
      {booking.customerApproval && (
        <div className={`rounded-xl p-4 border text-sm space-y-1 ${booking.customerApproval.accepted && approvalFreshness.fresh ? "bg-emerald-950/30 border-emerald-800/30" : "bg-amber-950/30 border-amber-800/30"}`}>
          {booking.customerApproval.accepted && approvalFreshness.fresh ? (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-300 font-semibold">Customer Approved — {booking.customerApproval.proposalVersion}</p>
              </div>
              <p className="text-emerald-500 text-xs">Accepted by {booking.customerApproval.acceptedBy} on {new Date(booking.customerApproval.acceptedAt).toLocaleDateString("en-IN")}</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <p className="text-amber-300 font-semibold">⚠ Approval Requires Attention</p>
              </div>
              <p className="text-amber-400 text-xs">{approvalFreshness.reason}</p>
            </>
          )}
        </div>
      )}

      {/* Proposals List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold text-sm">Proposal History</h2>
          {canSend && (
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
              + New Proposal
            </button>
          )}
        </div>

        {/* New Proposal Form */}
        {showForm && canSend && (
          <div className="p-5 border-b border-slate-800 space-y-3">
            <p className="text-slate-400 text-sm font-medium">New {`Proposal v${proposals.length + 1}`}</p>
            {!latestAcceptedQuote && (
              <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2 text-amber-300 text-xs">
                ⚠ No approved quote found. Create and approve a quote before generating a proposal.
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Inclusions (one per line)</label>
                <textarea value={inclusions} onChange={e => setInclusions(e.target.value)} rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Exclusions (one per line)</label>
                <textarea value={exclusions} onChange={e => setExclusions(e.target.value)} rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Valid for (days)</label>
                <input type="number" value={validDays} onChange={e => setValidDays(e.target.value)} min="1" max="30"
                  className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateProposal} disabled={saving || !latestAcceptedQuote}
                className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors">
                {saving ? "Saving..." : "Create Proposal"}
              </button>
              <button onClick={() => setShowForm(false)} className="text-xs px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="p-5 text-slate-500 text-sm text-center">No proposals created yet.</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {proposals.map((p, i) => (
              <div key={p.id} className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 font-semibold text-sm">{p.versionLabel}</p>
                    <p className="text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN")} · {p.createdBy} · Valid until {new Date(p.validUntil).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === "CUSTOMER_ACCEPTED" ? "bg-green-900 text-green-300" : p.status === "SENT" ? "bg-indigo-900 text-indigo-300" : "bg-slate-700 text-slate-300"}`}>
                    {p.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Inclusions</p>
                    {p.inclusions?.map((inc, j) => <p key={j}>✓ {inc}</p>)}
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Exclusions</p>
                    {p.exclusions?.map((exc, j) => <p key={j}>✗ {exc}</p>)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Final Price</span>
                  <span className="text-white font-bold">₹{Number(p.finalPrice).toLocaleString("en-IN")}</span>
                </div>
                {/* Actions for latest proposal only */}
                {i === proposals.length - 1 && canSend && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {p.status === "DRAFT" && (
                      <button onClick={handleSend} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors">
                        <Send className="w-3 h-3" /> Send to Customer
                      </button>
                    )}
                    {(p.status === "SENT" || p.status === "PROPOSAL_SENT") && (
                      <>
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name (for record)"
                          className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
                        <button onClick={handleAccept} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors">
                          <CheckCircle className="w-3 h-3" /> Record Acceptance
                        </button>
                        <input type="text" value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Decline reason..."
                          className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500" />
                        <button onClick={handleDecline} disabled={saving || !declineReason} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors">
                          <XCircle className="w-3 h-3" /> Record Decline
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
