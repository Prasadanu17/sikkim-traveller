import React from "react";
import { Check, Clock, AlertTriangle, AlertCircle, XCircle, RefreshCw } from "lucide-react";

export default function BookingStatus({ bookingStatus, onSimulateUpdate, isSimulating }) {
  if (!bookingStatus) return null;

  const { requestId, status, history } = bookingStatus;

  const PIPELINE_STEPS = [
    { key: "RECEIVED", label: "Request Received", desc: "Details successfully submitted to operations desk." },
    { key: "UNDER_REVIEW", label: "Reviewing Availability", desc: "Destinations team checks stay slots & vehicle logs." },
    { key: "AWAITING_CONFIRMATION", label: "Awaiting Confirmation", desc: "Lodging options verified. Awaiting your approval." },
    { key: "CONFIRMED", label: "Trip Confirmed", desc: "Bookings verified. Vouchers ready for travel." }
  ];

  // Helper to determine step status
  const getStepState = (stepKey) => {
    const currentIdx = PIPELINE_STEPS.findIndex(s => s.key === status);
    const stepIdx = PIPELINE_STEPS.findIndex(s => s.key === stepKey);

    // Handle terminal negative states
    if (status === "DECLINED" || status === "CANCELLED") {
      if (stepKey === "CONFIRMED") return "failed";
      if (stepIdx < currentIdx) return "completed";
      return "inactive";
    }

    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "inactive";
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-premium space-y-6 text-left">
      {/* Header info */}
      <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">LIVE REQUEST TRACKER</span>
          <h4 className="font-display text-base text-ink font-semibold mt-0.5">{requestId}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">CURRENT STATUS</span>
          <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded mt-1 border ${
            status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800 border-emerald-250" :
            status === "DECLINED" || status === "CANCELLED" ? "bg-rose-100 text-rose-800 border-rose-250" :
            "bg-amber-100 text-amber-800 border-amber-250"
          }`}>
            {status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Terminal Negatives warnings */}
      {status === "DECLINED" && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs flex items-start gap-2.5 text-rose-900">
          <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Booking Request Declined</span>
            <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
              We were unable to process this booking. This might be due to weather advisories, high-altitude road closures, or full occupancy. Please contact our team or try planning a different route.
            </p>
          </div>
        </div>
      )}

      {status === "CANCELLED" && (
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-xs flex items-start gap-2.5 text-neutral-600">
          <Clock size={16} className="text-neutral-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Request Cancelled</span>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              This request was cancelled by the traveler. You can generate a new itinerary to request another booking.
            </p>
          </div>
        </div>
      )}

      {/* Status Pipeline Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-100">
        {PIPELINE_STEPS.map((step) => {
          const stepState = getStepState(step.key);
          
          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Dot indicator */}
              <div className={`absolute -left-[20px] w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition duration-300 ${
                stepState === "completed" ? "bg-gold border-gold text-pine" :
                stepState === "active" ? "bg-white border-gold text-gold-dark animate-pulse" :
                stepState === "failed" ? "bg-rose-500 border-rose-500 text-white" :
                "bg-white border-neutral-200 text-neutral-300"
              }`}>
                {stepState === "completed" && <Check size={11} className="stroke-[3]" />}
                {stepState === "active" && <span className="w-1.5 h-1.5 rounded-full bg-gold-dark" />}
                {stepState === "failed" && <span className="text-[9px] font-bold">X</span>}
              </div>

              {/* Step info */}
              <div className="flex-1">
                <h5 className={`text-xs font-bold ${
                  stepState === "completed" ? "text-pine" :
                  stepState === "active" ? "text-gold-dark font-extrabold" :
                  "text-neutral-400"
                }`}>
                  {step.label}
                </h5>
                <p className="text-[10px] text-neutral-450 leading-normal mt-0.5">{step.desc}</p>
                
                {/* Event Logs in History */}
                {history?.find(h => h.status === step.key) && (
                  <span className="text-[9px] text-neutral-400 block mt-1 font-mono">
                    Updated: {new Date(history.find(h => h.status === step.key).timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Simulation Panel for Testers */}
      {onSimulateUpdate && (status === "RECEIVED" || status === "UNDER_REVIEW") && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-neutral-400 animate-spin-slow shrink-0" />
            <p className="text-[11px] text-neutral-500 leading-snug">
              Simulation: Advance request status to test operations updates.
            </p>
          </div>
          <button
            onClick={onSimulateUpdate}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 hover:border-gold hover:text-gold-dark bg-white text-ink text-[10px] font-bold px-3 py-1.5 transition shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={11} className={isSimulating ? "animate-spin" : ""} /> Advance Status
          </button>
        </div>
      )}
    </div>
  );
}
