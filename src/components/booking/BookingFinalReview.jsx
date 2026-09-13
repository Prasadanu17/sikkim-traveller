import React, { useState } from "react";
import { ArrowLeft, Check, Send, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { destinations as allDests } from "../../data/destinations";

export default function BookingFinalReview({ bookingContext, formData, isSubmitting, onSubmit, onPrev }) {
  const [confirmed, setConfirmed] = useState(false);
  const { trip, traveler, destinations, budget, accommodation, transportation } = bookingContext;

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

  // Compile special requirements list
  const selectedReqs = Object.entries(formData.specialRequirements || {})
    .filter(([key, val]) => val === true && key !== "otherDetails")
    .map(([key]) => {
      const labelMap = {
        vegetarianFood: "Vegetarian Meals",
        nonVegetarianFood: "Non-Vegetarian Meals",
        childFriendly: "Child-Friendly Stays",
        seniorFriendly: "Senior-Friendly Preferences",
        roomPreference: "Specific Room Preferences",
        groundFloor: "Ground-floor Accommodation",
        reducedWalking: "Reduced Walking",
        moreRestPeriods: "More Rest Periods",
        extraLuggage: "Extra Luggage Capacity",
        photographyPace: "Photography stops",
        flexibleDates: "Flexible Dates",
        specialOccasion: "Special Occasion celebration"
      };
      return labelMap[key] || key;
    });

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-neutral-100 pb-4">
        <h4 className="font-display text-xl text-ink font-semibold">Step 5: Final Booking Review</h4>
        <p className="text-xs text-neutral-500 mt-1">
          Review all information carefully before submitting your inquiry to the Sikkim Traveller travel operations desk.
        </p>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        {/* Core Trip Details Card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
          <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
            <FileText size={12} /> TRIP OVERVIEW
          </h5>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px]">ROUTE</span>
              <span className="font-semibold text-ink leading-snug">
                {destinations.map(getDestName).join(" → ")}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">DATES & DURATION</span>
              <span className="font-semibold text-ink">
                {trip.startDate ? `${trip.startDate} to ${trip.endDate}` : "Flexible"} ({trip.duration} Days)
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">TRAVELERS</span>
              <span className="font-semibold text-ink">
                {traveler.total} traveler(s) ({traveler.adults} Adults {traveler.children > 0 && `, ${traveler.children} Children`} {traveler.seniors > 0 && `, ${traveler.seniors} Seniors`})
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">ESTIMATED PLANNING BUDGET</span>
              <span className="font-semibold text-pine font-display">
                {budget.estimatedRange ? `${formatPrice(budget.estimatedRange.min)} – ${formatPrice(budget.estimatedRange.max)}` : "TBD"}
              </span>
            </div>
          </div>
        </div>

        {/* Accommodation and Transportation */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
          <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
            <CheckCircle size={12} /> STAYS & TRANSFERS
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px]">ACCOMMODATION</span>
              <span className="font-semibold text-ink capitalize">
                Comfort: {accommodation.comfort || "Standard"}<br/>
                Types: {accommodation.types?.length > 0 ? accommodation.types.join(", ") : "Standard hotel"}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">TRANSPORTATION</span>
              <span className="font-semibold text-ink capitalize">
                Modes: {transportation.preferredModes?.length > 0 ? transportation.preferredModes.join(", ") : "Private vehicle"}<br/>
                Long Drive Tolerance: {transportation.longDriveTolerance || "standard"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact info card */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-3">
          <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-2">
            <CheckCircle size={12} /> PRIMARY CONTACT & CALLBACK
          </h5>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-neutral-400 block text-[10px]">FULL NAME</span>
              <span className="font-semibold text-ink">{formData.primaryTraveler?.fullName}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">EMAIL ADDRESS</span>
              <span className="font-semibold text-ink">{formData.primaryTraveler?.email}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">WHATSAPP / PHONE</span>
              <span className="font-semibold text-ink">{formData.primaryTraveler?.phone}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">CONTACT PREFERENCE</span>
              <span className="font-semibold text-ink">
                {formData.contactPreference?.method} ({formData.contactPreference?.timeOfDay || "Anytime"})
              </span>
            </div>
          </div>
        </div>

        {/* Special and Accessibility needs */}
        {(selectedReqs.length > 0 || formData.specialRequirements?.otherDetails) && (
          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-2.5 text-xs">
            <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-100 pb-1.5">
              <CheckCircle size={12} /> SPECIAL REQUIREMENTS
            </h5>
            {selectedReqs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedReqs.map((label, idx) => (
                  <span key={idx} className="bg-neutral-50 border border-neutral-200 text-[10px] font-semibold px-2 py-0.5 rounded text-neutral-600">
                    {label}
                  </span>
                ))}
              </div>
            )}
            {formData.specialRequirements?.otherDetails && (
              <div>
                <span className="text-[10px] text-neutral-400 block">CUSTOM NOTES:</span>
                <p className="text-xs text-neutral-600 italic bg-neutral-50/50 p-2 rounded mt-0.5 border border-neutral-150">
                  "{formData.specialRequirements.otherDetails}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mandatory Budget Disclaimer */}
      <div className="p-4 rounded-xl border border-amber-250 bg-amber-50/30 text-xs flex items-start gap-2.5 text-amber-900">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Final Price Disclaimer</span>
          <p className="text-[11px] text-amber-800 mt-0.5 leading-normal">
            Final pricing will be confirmed by the Sikkim Traveller team based on availability, dates, accommodation, transportation, permits, and applicable travel conditions.
          </p>
        </div>
      </div>

      {/* Explicit Confirmation Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-3.5 w-3.5 rounded border-neutral-300 text-gold focus:ring-gold"
          />
          <span className="text-xs text-ink/80 leading-normal">
            I confirm that the above trip details are correct and I want to submit a booking request.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-100">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-ink transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <button
          onClick={onSubmit}
          disabled={!confirmed || isSubmitting}
          className={`inline-flex items-center gap-2 rounded-full font-semibold text-xs px-8 py-3.5 transition-all shadow-premium ${
            confirmed && !isSubmitting
              ? "bg-marigold text-pine hover:bg-gold-light hover:shadow-gold-glow"
              : "bg-neutral-250 text-neutral-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>Sending Request...</>
          ) : (
            <>
              Send Booking Request <Send size={12} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
