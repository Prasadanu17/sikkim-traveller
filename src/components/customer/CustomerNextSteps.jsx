import { ArrowRight, CheckCircle2, Clock, Sparkles, FileText, ShieldAlert, PhoneCall } from "lucide-react";

export default function CustomerNextSteps({ booking, onNavigateTab }) {
  if (!booking) return null;

  const status = booking.status;

  const getStepCard = () => {
    switch (status) {
      case "PROPOSAL_SENT":
      case "AWAITING_CUSTOMER":
        return {
          badge: "Action Required",
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          title: "Your Trip Proposal is Ready for Approval",
          description: "Our destination architect has structured your route, luxury stays, and private vehicle. Review the inclusions and price, then approve to secure room allocations.",
          ctaText: "Review & Approve Proposal",
          tab: "proposal",
          icon: Sparkles
        };
      case "CUSTOMER_ACCEPTED":
      case "READY_TO_CONFIRM":
        return {
          badge: "Operations In Progress",
          badgeColor: "bg-lime-500/20 text-lime-300 border-lime-500/40",
          title: "Proposal Approved — Finalizing Hotel Allotments",
          description: "Thank you for approving! Our travel operations team is currently issuing firm reservation vouchers and government restricted area permits.",
          ctaText: "View Trip Overview",
          tab: "overview",
          icon: Clock
        };
      case "CONFIRMED":
        return {
          badge: "Trip Confirmed",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          title: "Your Sikkim Journey is 100% Confirmed",
          description: "All hotel reservations, dedicated vehicle drivers, and Protected Area Permits are in place. Download your vouchers from the Documents tab.",
          ctaText: "Download Travel Vouchers",
          tab: "documents",
          icon: CheckCircle2
        };
      case "IN_PROGRESS":
        return {
          badge: "Active Journey",
          badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
          title: "Your Sikkim Journey is Underway",
          description: "Have a wonderful mountain holiday! 24/7 operations helpline concierge is on standby for any en-route requests.",
          ctaText: "Live Weather & Road Advisory",
          tab: "realtime",
          icon: PhoneCall
        };
      case "COMPLETED":
        return {
          badge: "Journey Concluded",
          badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          title: "Thank You for Travelling with Sikkim Traveller",
          description: "We hope you enjoyed the serene valleys, sacred monasteries, and majestic peaks. Your final tax invoices and receipts are ready.",
          ctaText: "View Final Documents",
          tab: "documents",
          icon: CheckCircle2
        };
      case "UNDER_REVIEW":
      case "AVAILABILITY_CHECK":
      case "PRICE_PENDING":
      default:
        return {
          badge: "Desk In Progress",
          badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          title: "Custom Proposal in Assembly",
          description: "Our travel architects are verifying hotel availability and mountain vehicle schedules for your selected dates.",
          ctaText: "Check Route & Itinerary",
          tab: "itinerary",
          icon: Clock
        };
    }
  };

  const step = getStepCard();
  const Icon = step.icon;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${step.badgeColor} flex items-center gap-1.5`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{step.badge}</span>
        </span>
        <span className="text-xs text-slate-400">Step Guide</span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-semibold text-white">
          {step.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {step.description}
        </p>
      </div>

      {onNavigateTab && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigateTab(step.tab)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <span>{step.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
