import { Check, X, ShieldCheck, AlertCircle, Sparkles, Clock, CheckCircle2, FileText } from "lucide-react";
import { verifyProposalApprovalStatus } from "../../services/customer/customerProposalService";

export default function CustomerProposal({ booking, onOpenApprovalModal, onOpenChangeRequestModal }) {
  const proposal = booking?.proposal;
  const approvalStatus = verifyProposalApprovalStatus(booking);

  if (!proposal) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-4">
        <FileText className="w-12 h-12 mx-auto text-slate-600" />
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-200">Proposal in Preparation</h3>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            Our destination architect is calculating custom tariffs, room allotments, and vehicle options. Your formal proposal will appear here shortly.
          </p>
        </div>
      </div>
    );
  }

  const {
    versionLabel = "Proposal v1",
    version = 1,
    validUntil,
    price = 0,
    currency = "INR",
    inclusions = [],
    exclusions = [],
    summary,
    updatedAt
  } = proposal;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{versionLabel}</span>
            </span>

            {validUntil && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Valid until {new Date(validUntil).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
            Custom Himalayan Trip Proposal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {summary || "Carefully planned accommodations, private transportation, and protected area permits."}
          </p>
        </div>

        {/* Price Card */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-right shrink-0 shadow-lg">
          <div className="text-[11px] text-amber-400 uppercase font-semibold tracking-wider">
            Total Investment (All-Inclusive)
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
            ₹{price.toLocaleString("en-IN")}{" "}
            <span className="text-xs text-slate-400 font-normal">{currency}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Covers {booking.customer?.travelerCount || 1} traveler{booking.customer?.travelerCount > 1 ? "s" : ""} • {booking.trip?.duration || 5} days
          </div>
        </div>
      </div>

      {/* Stale Approval Invalidation Warning Banner */}
      {approvalStatus.status === "STALE_APPROVAL" && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-300 flex items-start gap-3 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-200 uppercase tracking-wider text-[11px]">
              Customer Approval Invalidated
            </div>
            <p>{approvalStatus.message}</p>
          </div>
        </div>
      )}

      {/* Approved Confirmation Banner */}
      {approvalStatus.status === "APPROVED" && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 flex items-start gap-3 text-xs leading-relaxed">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-emerald-200 uppercase tracking-wider text-[11px]">
              Proposal Accepted
            </div>
            <p>{approvalStatus.message}</p>
          </div>
        </div>
      )}

      {/* Trip Specifications Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs">
        <div>
          <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-0.5">Destinations</span>
          <span className="text-slate-200 font-medium">{(booking.trip?.destinations || []).join(" → ")}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-0.5">Selected Stays</span>
          <span className="text-slate-200 font-medium">{booking.accommodation?.selectedOption || "Premium Chalets"}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-0.5">Allocated Vehicle</span>
          <span className="text-slate-200 font-medium">{booking.transportation?.summary || "Private 4WD Mountain Vehicle"}</span>
        </div>
      </div>

      {/* Inclusions & Exclusions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inclusions */}
        <div className="space-y-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>What Is Included</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {inclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        <div className="space-y-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <X className="w-4 h-4 stroke-[3]" />
            <span>What Is Excluded</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-400">
            {exclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-rose-950 border border-rose-800/60 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✕
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Proposal Action Footer */}
      <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 space-y-0.5 text-center sm:text-left">
          <div>Last Updated: {new Date(updatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</div>
          <div className="text-[11px] text-slate-500">Proposal version: {versionLabel}</div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {onOpenChangeRequestModal && (
            <button
              type="button"
              onClick={onOpenChangeRequestModal}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Request Changes
            </button>
          )}

          {approvalStatus.status !== "APPROVED" && onOpenApprovalModal && (
            <button
              type="button"
              onClick={onOpenApprovalModal}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Accept This Proposal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
