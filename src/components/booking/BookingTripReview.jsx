import React from "react";
import { Calendar, Clock, Users, MapPin, Compass, Bed, Car, DollarSign, ShieldAlert, ShieldCheck, FileText, AlertTriangle } from "lucide-react";
import { destinations as allDests } from "../../data/destinations";

export default function BookingTripReview({ bookingContext, onNext, onClose }) {
  const { trip, traveler, destinations, budget, accommodation, transportation, preferences, realtimeSnapshot } = bookingContext;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getDestName = (slug) => {
    const d = allDests.find((item) => item.slug === slug);
    return d ? d.name : slug;
  };

  // Check if any selected destination requires a permit (North or East high altitude)
  const requiresPermits = destinations.some((slug) => {
    const s = slug.toLowerCase();
    return s.includes("lachung") || s.includes("lachen") || s.includes("yumthang") || s.includes("gurudongmar") || s.includes("nathula") || s.includes("zuluk") || s.includes("silk");
  });

  const getAlertStatusHeader = () => {
    if (!realtimeSnapshot || realtimeSnapshot.riskLevel === "UNKNOWN") {
      return {
        text: "⚪ Conditions status currently unavailable.",
        colorClass: "bg-neutral-50 text-neutral-600 border-neutral-200"
      };
    }
    if (realtimeSnapshot.riskLevel === "HIGH" || realtimeSnapshot.riskLevel === "CRITICAL") {
      return {
        text: "🟡 Travel Attention: Current conditions include an advisory affecting your route.",
        colorClass: "bg-amber-50 text-amber-800 border-amber-200"
      };
    }
    return {
      text: "🟢 Current Travel Status: No significant alerts detected.",
      colorClass: "bg-emerald-50 text-emerald-800 border-emerald-200"
    };
  };

  const alertHeader = getAlertStatusHeader();

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-neutral-100 pb-4">
        <h4 className="font-display text-xl text-ink font-semibold">Step 1: Review Your Sikkim Journey</h4>
        <p className="text-xs text-neutral-500 mt-1">
          Verify your AI-planned itinerary details before starting the booking request form.
        </p>
      </div>

      {/* Real-time Alert Banner */}
      <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${alertHeader.colorClass}`}>
        {realtimeSnapshot?.riskLevel === "HIGH" || realtimeSnapshot?.riskLevel === "CRITICAL" ? (
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div>
          <span className="font-semibold block">{alertHeader.text}</span>
          {realtimeSnapshot?.alerts && realtimeSnapshot.alerts.length > 0 && (
            <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-amber-700">
              {realtimeSnapshot.alerts.map((alert, i) => (
                <li key={i}>{alert.headline || alert.message || alert}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Permit Info */}
      {requiresPermits && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-xs flex items-start gap-2.5 text-blue-900">
          <ShieldAlert size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Permit Requirements</span>
            <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
              Permits / travel authorization are required for high-altitude zones on your route (e.g. North Sikkim/Nathula Pass). 
              Our team will assist with permit processing upon submission. 
              <span className="italic block mt-1 font-medium">Permit status: Pending request verification (never pre-approved).</span>
            </p>
          </div>
        </div>
      )}

      {/* Booking Snapshot Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-premium space-y-4">
        <h5 className="text-xs uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
          <FileText size={14} /> YOUR SIKKIM JOURNEY SNAPSHOT
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {/* Dates */}
          <div className="flex items-start gap-2.5">
            <Calendar className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Dates</span>
              <span className="text-xs font-semibold text-ink">
                {trip.startDate && trip.endDate ? (
                  `${new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                ) : (
                  "Flexible Dates"
                )}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-2.5">
            <Clock className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Duration</span>
              <span className="text-xs font-semibold text-ink">
                {trip.duration} Days / {Math.max(1, trip.duration - 1)} Nights
              </span>
            </div>
          </div>

          {/* Travelers */}
          <div className="flex items-start gap-2.5">
            <Users className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Travelers</span>
              <span className="text-xs font-semibold text-ink capitalize">
                {traveler.total} Traveler{traveler.total > 1 ? "s" : ""} ({traveler.type})
              </span>
            </div>
          </div>

          {/* Style */}
          <div className="flex items-start gap-2.5">
            <Compass className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Travel Style / Pace</span>
              <span className="text-xs font-semibold text-ink capitalize">
                {preferences.travelStyle} Pace
              </span>
            </div>
          </div>

          {/* Stay */}
          <div className="flex items-start gap-2.5">
            <Bed className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Accommodation Choice</span>
              <span className="text-xs font-semibold text-ink capitalize">
                {accommodation.types?.length > 0
                  ? accommodation.types.join(" / ")
                  : "Open to recommendations"}
              </span>
            </div>
          </div>

          {/* Transport */}
          <div className="flex items-start gap-2.5">
            <Car className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Transportation</span>
              <span className="text-xs font-semibold text-ink capitalize">
                {transportation.preferredModes?.length > 0
                  ? transportation.preferredModes.map(m => m.replace("-", " ")).join(" / ")
                  : "Open to recommendations"}
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="sm:col-span-2 flex items-start gap-2.5 border-t border-neutral-100 pt-3">
            <MapPin className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Destinations Route</span>
              <span className="text-xs font-semibold text-ink mt-0.5 flex flex-wrap items-center gap-1">
                {destinations.map((slug, idx) => (
                  <span key={idx} className="flex items-center gap-1 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-250">
                    {getDestName(slug)}
                    {idx < destinations.length - 1 && <span className="text-neutral-400 text-[10px] font-normal">→</span>}
                  </span>
                ))}
              </span>
            </div>
          </div>

          {/* Budget */}
          <div className="sm:col-span-2 flex items-start gap-2.5 border-t border-neutral-100 pt-3">
            <DollarSign className="text-gold-dark shrink-0 mt-0.5" size={16} />
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Estimated Planning Budget</span>
              <span className="text-lg font-display font-semibold text-pine mt-0.5 block">
                {budget.estimatedRange ? (
                  `${formatPrice(budget.estimatedRange.min)} – ${formatPrice(budget.estimatedRange.max)}`
                ) : (
                  "TBD during verification"
                )}
              </span>
              <span className="text-[10px] text-neutral-400 leading-normal block mt-0.5">
                Includes estimated lodging, transfers, and basic sightseeing. Permits included where noted.
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-150 pt-3 flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Trip Plan Version: <span className="font-semibold text-ink">{bookingContext.itineraryVersion}</span></span>
          <span className="bg-amber-100 text-amber-800 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded border border-amber-250">
            Ready for Booking Request
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          onClick={onClose}
          className="text-xs font-semibold text-neutral-400 hover:text-ink transition underline"
        >
          Cancel
        </button>

        <button
          onClick={onNext}
          className="rounded-full bg-pine text-parchment font-semibold text-xs px-8 py-3.5 hover:bg-gold hover:text-pine transition shadow-premium"
        >
          Continue to Traveler Details
        </button>
      </div>
    </div>
  );
}
