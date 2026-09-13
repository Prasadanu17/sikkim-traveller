import { motion } from "framer-motion";
import { Check, Clock, XCircle, Sparkles } from "lucide-react";

const CUSTOMER_JOURNEY_STAGES = [
  { key: "created",   label: "Trip Created",       description: "Your trip preferences are saved." },
  { key: "reviewed",  label: "Trip Reviewed",      description: "Our local Sikkim experts are reviewing routes & availability." },
  { key: "proposal",  label: "Proposal Ready",     description: "Your custom itinerary and pricing are ready for review." },
  { key: "approval",  label: "Your Approval",      description: "Approve your proposal to lock in hotel and transport bookings." },
  { key: "confirmed", label: "Booking Confirmed",  description: "Advance confirmed. Permits and stays reserved." },
  { key: "travel",    label: "Ready for Sikkim",   description: "Live weather, permits, and guides active for your trip!" },
];

function getStageIndex(status) {
  switch (status) {
    case "RECEIVED":
      return 0;
    case "UNDER_REVIEW":
    case "AVAILABILITY_CHECK":
    case "PRICE_PENDING":
      return 1;
    case "PROPOSAL_SENT":
      return 2;
    case "AWAITING_CUSTOMER":
    case "CUSTOMER_ACCEPTED":
    case "READY_TO_CONFIRM":
      return 3;
    case "CONFIRMED":
      return 4;
    case "IN_PROGRESS":
    case "COMPLETED":
      return 5;
    default:
      return 0;
  }
}

export default function CustomerStatusTimeline({ status }) {
  const isCancelled = status === "CANCELLED";
  const isDeclined = status === "DECLINED";
  const isTerminalSpecial = isCancelled || isDeclined;

  const currentStageIdx = getStageIndex(status);
  const activeStage = CUSTOMER_JOURNEY_STAGES[currentStageIdx] || CUSTOMER_JOURNEY_STAGES[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 text-slate-100">
      {/* Title and Active State Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles size={12} /> Your Sikkim Journey Progress
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              Stage {Math.min(6, currentStageIdx + 1)} of 6
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-display font-semibold text-white mt-1">
            {activeStage.label}
          </h2>
        </div>

        {/* Current status explanation pill */}
        <div className="text-xs text-slate-300 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 sm:max-w-md">
          {activeStage.description}
        </div>
      </div>

      {/* Special State Warning Banner (if Cancelled/Declined) */}
      {isTerminalSpecial && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-300 flex items-start gap-3"
        >
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-200">
              {isCancelled ? "This trip booking request has been cancelled." : "This trip request could not be accepted."}
            </p>
            <p className="text-rose-300/80">
              If you have questions or would like to plan another Himalayan journey, please message our team or contact support.
            </p>
          </div>
        </motion.div>
      )}

      {/* 6-Stage Timeline — Horizontal on sm+, Vertical on mobile */}
      {/* Mobile: compact vertical list */}
      <div className="block sm:hidden space-y-2">
        {CUSTOMER_JOURNEY_STAGES.map((stage, idx) => {
          const isCompleted = !isTerminalSpecial && currentStageIdx > idx;
          const isCurrent = !isTerminalSpecial && currentStageIdx === idx;
          return (
            <div key={stage.key} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isCurrent ? "bg-amber-400/10 border border-amber-400/20" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                isCurrent ? "bg-amber-400 text-slate-950 ring-2 ring-amber-400/20"
                : isCompleted ? "bg-emerald-500 text-slate-950"
                : "bg-slate-950 border border-slate-800 text-slate-500"
              }`}>
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : isCurrent ? <Clock className="w-3.5 h-3.5" /> : <span>{idx + 1}</span>}
              </div>
              <div>
                <span className={`text-xs font-medium leading-tight ${isCurrent ? "text-amber-300 font-semibold" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                  {stage.label}
                </span>
                {isCurrent && <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{stage.description}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop/Tablet: Full horizontal timeline */}
      <div className="hidden sm:flex items-center justify-between relative px-2">
        {CUSTOMER_JOURNEY_STAGES.map((stage, idx) => {
          const isCompleted = !isTerminalSpecial && currentStageIdx > idx;
          const isCurrent = !isTerminalSpecial && currentStageIdx === idx;

          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center relative group">
              {/* Connecting Line */}
              {idx < CUSTOMER_JOURNEY_STAGES.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 z-0 transition-colors ${
                    isCompleted ? "bg-amber-400" : "bg-slate-800"
                  }`}
                />
              )}

              {/* Step Node Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all text-xs font-semibold ${
                  isCurrent
                    ? "bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 shadow-lg shadow-amber-400/30 scale-110"
                    : isCompleted
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-slate-950 border border-slate-800 text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2.5 text-center max-w-[90px]">
                <span
                  className={`block text-[11px] leading-tight font-medium ${
                    isCurrent
                      ? "text-amber-300 font-bold"
                      : isCompleted
                      ? "text-slate-200 font-semibold"
                      : "text-slate-500"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

