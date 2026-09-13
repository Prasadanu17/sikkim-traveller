/**
 * Trip Journey Progress Component — AI Trip Planner Dashboard
 * Timeline progress bar powered by Module 10 status engine.
 * Maps operational states cleanly without creating conflicting business statuses.
 */

import { Check } from "lucide-react";

const STAGES = [
  { key: "RECEIVED", label: "Planning", sub: "Request Submitted" },
  { key: "UNDER_REVIEW", label: "Review", sub: "Ops Feasibility Check" },
  { key: "PROPOSAL_SENT", label: "Proposal", sub: "Price & Inclusions Ready" },
  { key: "CUSTOMER_ACCEPTED", label: "Accepted", sub: "Customer Approved" },
  { key: "CONFIRMED", label: "Confirmed", sub: "Stays & Vehicles Booked" },
  { key: "COMPLETED", label: "Completed", sub: "Trip Finished" }
];

export default function TripJourneyProgress({ status = "RECEIVED" }) {
  const getStageIndex = (st) => {
    const idx = STAGES.findIndex(s => s.key === st);
    if (idx !== -1) return idx;
    if (st === "READY_TO_CONFIRM" || st === "AVAILABILITY_CHECK") return 2;
    return 0;
  };

  const currentIndex = getStageIndex(status);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Trip Journey Progress</h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 font-mono font-semibold">
          Status: {status?.replace(/_/g, " ")}
        </span>
      </div>

      {/* Progress Timeline */}
      <div className="relative pt-2">
        <div className="hidden sm:block absolute top-5 left-0 right-0 h-1 bg-slate-800 rounded-full z-0" />
        <div
          className="hidden sm:block absolute top-5 left-0 h-1 bg-amber-500 rounded-full z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
          {STAGES.map((stage, idx) => {
            const isPassed = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={stage.key} className="flex sm:flex-col items-center gap-3 sm:text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    isCurrent
                      ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/30"
                      : isPassed
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                </div>

                <div>
                  <p className={`text-xs font-semibold ${isCurrent ? "text-amber-400 font-bold" : isPassed ? "text-white" : "text-slate-500"}`}>
                    {stage.label}
                  </p>
                  <p className="text-[10px] text-slate-500 hidden sm:block">{stage.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
