import { Hotel, Car, ShieldAlert, Sparkles, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";

export default function CustomerTripOverview({ booking, onReviewProposal, onRequestChanges }) {
  if (!booking) return null;

  const {
    trip,
    budget,
    accommodation,
    transportation,
    permits,
    proposal,
    status,
    hasPendingChangeRequest,
    nextAction
  } = booking;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Next Action Callout Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Recommended Action</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
            {nextAction}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {(status === "PROPOSAL_SENT" || status === "AWAITING_CUSTOMER") && onReviewProposal && (
            <button
              type="button"
              onClick={onReviewProposal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Review Proposal
            </button>
          )}

          {onRequestChanges && status !== "CONFIRMED" && status !== "COMPLETED" && (
            <button
              type="button"
              onClick={onRequestChanges}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Request Changes
            </button>
          )}
        </div>
      </div>

      {/* Pending Change Request Alert */}
      {hasPendingChangeRequest && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-indigo-200 flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-100">Change Request Received: </span>
            Our destination team is currently reviewing your requested adjustments. You will be notified when an updated proposal is ready.
          </div>
        </div>
      )}

      {/* 4 Essential Arrangement Pillars (Accommodation, Transport, Permits, Budget) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accommodation Pillar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Accommodation</h3>
                <span className="text-[11px] text-slate-400">Hotels, Resorts & Chalets</span>
              </div>
            </div>
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold border uppercase tracking-wider ${
                accommodation?.status === "CONFIRMED"
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                  : "bg-amber-950/60 border-amber-800 text-amber-300"
              }`}
            >
              {accommodation?.status === "CONFIRMED" ? "✓ CONFIRMED" : "PROPOSED / PROVISIONAL"}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
            <div className="text-xs text-slate-300 font-medium leading-relaxed">
              {accommodation?.selectedOption || "Handpicked premium accommodations across selected valleys."}
            </div>
            <div className="text-[11px] text-slate-500">
              {accommodation?.status === "CONFIRMED"
                ? "Rooms confirmed with daily breakfast & curated chef dinners."
                : "PROPOSAL STAGE: Allotments held provisionally until proposal acceptance."}
            </div>
          </div>
        </div>

        {/* Transportation Pillar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Private Transportation</h3>
                <span className="text-[11px] text-slate-400">Exclusive Mountain Vehicle</span>
              </div>
            </div>
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold border uppercase tracking-wider ${
                transportation?.status === "CONFIRMED"
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                  : "bg-amber-950/60 border-amber-800 text-amber-300"
              }`}
            >
              {transportation?.status === "CONFIRMED" ? "✓ CONFIRMED" : "PROPOSED / PROVISIONAL"}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
            <div className="text-xs text-slate-300 font-medium leading-relaxed">
              {transportation?.summary || "Private dedicated vehicle with experienced Himalayan chauffeur."}
            </div>
            <div className="text-[11px] text-slate-500">
              {transportation?.status === "CONFIRMED" && transportation?.driverName
                ? `Chauffeur: ${transportation.driverName} (${transportation.driverPhone})`
                : "Driver contact details will be released 24 hours prior to travel upon permit verification."}
            </div>
          </div>
        </div>

        {/* Permits & Clearance Pillar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Permits & Clearances</h3>
                <span className="text-[11px] text-slate-400">Protected Area Permits (PAP)</span>
              </div>
            </div>
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
                permits?.status === "APPROVED"
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                  : permits?.status === "NOT_REQUIRED"
                  ? "bg-slate-800 border-slate-700 text-slate-400"
                  : "bg-amber-950/60 border-amber-800 text-amber-300"
              }`}
            >
              {permits?.status || "PROCESSING"}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-1.5">
            {permits?.customerRelevantIssues && permits.customerRelevantIssues.length > 0 ? (
              <ul className="space-y-1 text-xs text-slate-300">
                {permits.customerRelevantIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-300">
                {permits?.status === "APPROVED"
                  ? "All required government permits and military checkpoint clearances are verified."
                  : "No special restricted area permits required for this route."}
              </div>
            )}
            <div className="text-[11px] text-slate-500">
              Managed end-to-end by Sikkim Tourism registered operators.
            </div>
          </div>
        </div>

        {/* Investment & Proposal Pillar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <span className="font-bold text-sm">₹</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Investment & Proposal</h3>
                <span className="text-[11px] text-slate-400">All-Inclusive Transparent Pricing</span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold border bg-amber-950/60 border-amber-800 text-amber-300">
              {proposal ? proposal.versionLabel : "ESTIMATING"}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                {proposal ? "Current Proposal Amount" : "Estimated Budget"}
              </div>
              <div className="text-lg font-bold text-white">
                ₹{(proposal ? proposal.price : budget?.estimated || 0).toLocaleString("en-IN")}{" "}
                <span className="text-xs text-slate-400 font-normal">{budget?.currency || "INR"}</span>
              </div>
            </div>

            {proposal && onReviewProposal && (
              <button
                type="button"
                onClick={onReviewProposal}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 cursor-pointer"
              >
                View Full Inclusions
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Destinations Visited Pills */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Destinations on Your Route</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {(trip?.destinations || ["Gangtok"]).map((dest, idx) => (
            <div
              key={idx}
              className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dest}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
