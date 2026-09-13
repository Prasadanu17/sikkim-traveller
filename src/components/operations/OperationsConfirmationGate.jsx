/**
 * Operations Confirmation Gate — Module 10
 * Strict checklist gate before CONFIRM JOURNEY can fire.
 * Checklist must be fully satisfied AND user must have canConfirm permission.
 * Frontend check only — backend MUST re-verify on confirmation endpoint.
 */
import { useState } from "react";
import { CheckSquare, Square, Lock, AlertTriangle } from "lucide-react";
import { checkConfirmationGate, isCancelledOrDeclined, isTerminalStatus } from "../../services/operations/operationsStatusService";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { confirmJourney, cancelBooking, declineBooking } from "../../services/operations/operationsBookingService";
import { checkApprovalFreshness } from "../../services/operations/operationsProposalService";

const CHECKLIST_LABELS = {
  accommodationVerified: "Accommodation verified and confirmed",
  transportVerified: "Transportation verified and confirmed",
  permitsChecked: "Permit requirements checked and resolved",
  itineraryReviewed: "Final itinerary reviewed",
  priceApproved: "Final price approved (quote in review or accepted)",
  customerAccepted: "Customer has accepted the proposal",
  proposalSent: "Proposal has been sent to customer"
};

export default function OperationsConfirmationGate({ booking, currentUser, onMutation }) {
  const [showCancel, setShowCancel] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [confirming, setSaving] = useState(false);

  if (!booking || isTerminalStatus(booking.status) || isCancelledOrDeclined(booking.status)) {
    return null; // Don't show gate for terminal states
  }

  const { checks, allPassed } = checkConfirmationGate(booking);
  const canConfirm = hasPermission(currentUser?.role, "canConfirm");
  const canCancel = hasPermission(currentUser?.role, "canCancel");
  const canDecline = hasPermission(currentUser?.role, "canDecline");
  const approvalFreshness = checkApprovalFreshness(booking);

  const isReadyToConfirm = booking.status === "READY_TO_CONFIRM";
  const canActuallyConfirm = canConfirm && allPassed && isReadyToConfirm && approvalFreshness.fresh;

  const handleConfirm = () => {
    if (!canActuallyConfirm) return;
    if (!window.confirm(`Confirm journey ${booking.requestId}? This action will be recorded with confirmation ID.\n\nThis is a MOCK confirmation in development mode.`)) return;
    setSaving(true);
    const result = confirmJourney(booking.id, currentUser?.id, currentUser?.role, currentUser?.name, booking.version);
    setSaving(false);
    if (result.success) {
      onMutation?.();
    } else {
      alert(result.error || "Confirmation failed.");
    }
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) return;
    const result = cancelBooking(booking.id, cancelReason, currentUser?.id, currentUser?.role, currentUser?.name);
    if (result.success) { onMutation?.(); setShowCancel(false); setCancelReason(""); }
    else alert(result.error);
  };

  const handleDecline = () => {
    if (!declineReason.trim()) return;
    const result = declineBooking(booking.id, declineReason, currentUser?.id, currentUser?.role, currentUser?.name);
    if (result.success) { onMutation?.(); setShowDecline(false); setDeclineReason(""); }
    else alert(result.error);
  };

  // Confirmed state display
  if (booking.status === "CONFIRMED" && booking.confirmation) {
    const conf = booking.confirmation;
    return (
      <div className="border-t border-slate-800 bg-emerald-950/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm">✓</div>
          <div>
            <p className="text-emerald-300 font-bold text-sm">🎉 Journey Confirmed</p>
            <p className="text-emerald-500 text-xs">{conf.confirmationId} · Confirmed by {conf.confirmedBy} · {new Date(conf.confirmedAt).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 space-y-3 shrink-0">
      {/* Stale Approval Warning */}
      {!approvalFreshness.fresh && (
        <div className="flex items-start gap-2 bg-amber-950/40 border border-amber-800/40 rounded-lg px-4 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-amber-300 text-xs">{approvalFreshness.reason}</p>
        </div>
      )}

      {/* Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
        {Object.entries(checks).map(([key, passed]) => (
          <div key={key} className="flex items-center gap-1.5">
            {passed
              ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              : <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            }
            <span className={passed ? "text-emerald-400" : "text-slate-500"}>{CHECKLIST_LABELS[key]}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!canActuallyConfirm || confirming}
          title={
            !canConfirm ? "Insufficient permissions" :
            !isReadyToConfirm ? "Status must be READY_TO_CONFIRM" :
            !allPassed ? "Complete all checklist items" :
            !approvalFreshness.fresh ? approvalFreshness.reason :
            "Confirm journey"
          }
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            canActuallyConfirm
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
          }`}
        >
          {!canConfirm && <Lock className="w-3.5 h-3.5" />}
          {confirming ? "Confirming..." : "✓ Confirm Journey"}
        </button>

        {!canConfirm && (
          <span className="text-xs text-slate-500">Your role ({currentUser?.role}) cannot confirm journeys.</span>
        )}

        <div className="flex-1" />

        {/* Cancel */}
        {canCancel && !showCancel && (
          <button onClick={() => setShowCancel(true)} className="text-xs px-3 py-2 bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors">
            Cancel Booking
          </button>
        )}
        {canDecline && !showDecline && !showCancel && (
          <button onClick={() => setShowDecline(true)} className="text-xs px-3 py-2 bg-slate-800 hover:bg-red-950/50 border border-slate-700 hover:border-red-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
            Decline Booking
          </button>
        )}
      </div>

      {/* Cancel Form */}
      {showCancel && (
        <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4 space-y-3">
          <p className="text-rose-300 font-semibold text-sm">Cancel Booking — Reason Required</p>
          <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Enter cancellation reason..."
            rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500 resize-none" />
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={!cancelReason.trim()} className="text-xs px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-lg">Confirm Cancel</button>
            <button onClick={() => { setShowCancel(false); setCancelReason(""); }} className="text-xs px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">Back</button>
          </div>
        </div>
      )}

      {/* Decline Form */}
      {showDecline && (
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 space-y-3">
          <p className="text-red-300 font-semibold text-sm">Decline Booking — Reason Required</p>
          <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Reason for declining..."
            rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500 resize-none" />
          <div className="flex gap-2">
            <button onClick={handleDecline} disabled={!declineReason.trim()} className="text-xs px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white rounded-lg">Confirm Decline</button>
            <button onClick={() => { setShowDecline(false); setDeclineReason(""); }} className="text-xs px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
