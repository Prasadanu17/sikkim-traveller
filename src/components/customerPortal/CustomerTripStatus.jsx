/**
 * Customer Trip Status Timeline — Module 11
 * Renders the customer-friendly booking request pipeline progress tracker.
 */

const PIPELINE_STEPS = [
  { key: "RECEIVED",           label: "Request Received",      sub: "Details submitted successfully" },
  { key: "UNDER_REVIEW",       label: "Under Expert Review",   sub: "Sikkim staff reviewing route details" },
  { key: "AVAILABILITY_CHECK", label: "Availability Checks",   sub: "Checking hotel stay and transport slots" },
  { key: "PRICE_PENDING",      label: "Voucher & Quote Prep",  sub: "Preparing final pricing and discounts" },
  { key: "PROPOSAL_SENT",      label: "Proposal Sent",         sub: "Awaiting customer approval" },
  { key: "CONFIRMED",          label: "Confirmed!",            sub: "Trip confirmed and locked" },
  { key: "IN_PROGRESS",        label: "On the Road",           sub: "Active travel in Sikkim" },
  { key: "COMPLETED",          label: "Journey Complete",      sub: "Completed successfully" }
];

export default function CustomerTripStatus({ currentStatus }) {
  const isCancelled = currentStatus === "CANCELLED";
  const isDeclined = currentStatus === "DECLINED";

  const getActiveIndex = () => {
    if (isCancelled || isDeclined) return -1;
    if (currentStatus === "RECEIVED") return 0;
    if (currentStatus === "UNDER_REVIEW") return 1;
    if (currentStatus === "AVAILABILITY_CHECK") return 2;
    if (currentStatus === "PRICE_PENDING") return 3;
    if (currentStatus === "PROPOSAL_SENT" || currentStatus === "AWAITING_CUSTOMER") return 4;
    if (currentStatus === "CUSTOMER_ACCEPTED" || currentStatus === "READY_TO_CONFIRM") return 4; // also counts as proposal state
    if (currentStatus === "CONFIRMED") return 5;
    if (currentStatus === "IN_PROGRESS") return 6;
    if (currentStatus === "COMPLETED") return 7;
    return 0;
  };

  const activeIdx = getActiveIndex();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Booking Status Pipeline</h2>

      {isCancelled && (
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-lg px-4 py-2.5 text-rose-300 text-xs">
          🚫 THIS BOOKING REQUEST HAS BEEN CANCELLED.
        </div>
      )}

      {isDeclined && (
        <div className="bg-red-950/20 border border-red-800/40 rounded-lg px-4 py-2.5 text-red-300 text-xs">
          🚫 THIS BOOKING REQUEST HAS BEEN DECLINED BY THE OPERATIONS TEAM.
        </div>
      )}

      {!isCancelled && !isDeclined && (
        <div className="relative pt-2">
          {/* Progress bar line */}
          <div className="absolute top-[21px] left-5 right-5 h-0.5 bg-slate-800" />
          <div
            className="absolute top-[21px] left-5 h-0.5 bg-indigo-500 transition-all duration-500"
            style={{ width: `${(activeIdx / (PIPELINE_STEPS.length - 1)) * 100}%` }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {PIPELINE_STEPS.map((step, idx) => {
              const isPassed = idx < activeIdx;
              const isCurrent = idx === activeIdx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center max-w-[90px] group">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 relative z-10 ${
                      isCurrent
                        ? "bg-indigo-600 border-indigo-500 text-white ring-4 ring-indigo-500/20"
                        : isPassed
                        ? "bg-indigo-950 border-indigo-600 text-indigo-400"
                        : "bg-slate-900 border-slate-850 text-slate-600"
                    }`}
                  >
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  <p
                    className={`text-[10px] font-semibold mt-2 leading-tight transition-all duration-300 truncate max-w-[80px] ${
                      isCurrent ? "text-indigo-400" : isPassed ? "text-slate-400" : "text-slate-600"
                    }`}
                    title={step.label}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
