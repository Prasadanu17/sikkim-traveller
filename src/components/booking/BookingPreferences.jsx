import React from "react";
import { ArrowLeft, CheckSquare, Square, Info } from "lucide-react";

export default function BookingPreferences({ bookingContext, formData, updateFormData, onNext, onPrev }) {
  const { accommodation, transportation } = bookingContext;

  const handleCheckboxToggle = (field) => {
    updateFormData("specialRequirements", {
      ...formData.specialRequirements,
      [field]: !formData.specialRequirements[field]
    });
  };

  const handleOtherDetailsChange = (val) => {
    updateFormData("specialRequirements", {
      ...formData.specialRequirements,
      otherDetails: val
    });
  };

  const SPECIAL_REQUIREMENTS_CONFIG = [
    { key: "vegetarianFood", label: "Vegetarian Meals" },
    { key: "nonVegetarianFood", label: "Non-Vegetarian Meals" },
    { key: "childFriendly", label: "Child-Friendly Stays" },
    { key: "seniorFriendly", label: "Senior-Friendly Preferences" },
    { key: "roomPreference", label: "Specific Room Preferences (e.g. view)" },
    { key: "groundFloor", label: "Ground-floor stay preferred" },
    { key: "reducedWalking", label: "Reduced walking routes" },
    { key: "moreRestPeriods", label: "More frequent rest periods" },
    { key: "extraLuggage", label: "Extra luggage capacity vehicle" },
    { key: "photographyPace", label: "Photography-focused stops" },
    { key: "flexibleDates", label: "Flexible travel dates (± 3 days)" },
    { key: "specialOccasion", label: "Celebrating special occasion" }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-neutral-100 pb-4">
        <h4 className="font-display text-xl text-ink font-semibold">Step 3: Stays, Transport & Special Needs</h4>
        <p className="text-xs text-neutral-500 mt-1">
          Review stayed preferences and specify special requirements. We will tailor the options accordingly.
        </p>
      </div>

      {/* Stay & Transport read-only status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Accommodation selection */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">PREFERRED STAY COMFORT</span>
            <span className="text-xs font-semibold text-ink capitalize mt-1 block">
              {accommodation.comfort || "Standard Comfort"}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-2">
              Stay Styles: {accommodation.types?.length > 0 ? accommodation.types.join(", ") : "Standard hotel"}
            </span>
          </div>
          <div className="mt-3 p-2 bg-neutral-50 rounded text-[10px] text-neutral-500 leading-normal flex items-start gap-1">
            <Info size={12} className="shrink-0 text-gold-dark mt-0.5" />
            <span>Booking team will search for exact availability in these categories. Lodging is NOT yet booked.</span>
          </div>
        </div>

        {/* Transport selection */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">PREFERRED TRANSPORT MODE</span>
            <span className="text-xs font-semibold text-ink capitalize mt-1 block">
              {transportation.preferredModes?.length > 0
                ? transportation.preferredModes.map(m => m.replace("-", " ")).join(", ")
                : "Standard Cab"}
            </span>
            {transportation.longDriveTolerance && (
              <span className="text-[10px] text-neutral-400 block mt-2">
                Long Drive Tolerance: <span className="font-semibold capitalize text-neutral-600">{transportation.longDriveTolerance}</span>
              </span>
            )}
          </div>
          <div className="mt-3 p-2 bg-neutral-50 rounded text-[10px] text-neutral-500 leading-normal flex items-start gap-1">
            <Info size={12} className="shrink-0 text-gold-dark mt-0.5" />
            <span>Routes and driver details are verified prior to confirmation. Vehicle availability is NOT guaranteed.</span>
          </div>
        </div>
      </div>

      {/* Special Requirements checkboxes */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-ink/75 block">Special Requests & Accessibility Preferences</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SPECIAL_REQUIREMENTS_CONFIG.map((item) => {
            const isChecked = !!formData.specialRequirements?.[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleCheckboxToggle(item.key)}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs transition duration-200 ${
                  isChecked
                    ? "border-gold bg-gold/10 text-gold-dark font-medium"
                    : "border-neutral-200 bg-white/50 text-neutral-600 hover:border-neutral-350"
                }`}
              >
                {isChecked ? (
                  <CheckSquare size={15} className="text-gold-dark shrink-0" />
                ) : (
                  <Square size={15} className="text-neutral-400 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-neutral-400">
          * Accessibility options are treated as travel preferences to optimize your journey logistics, not as medical disclosures.
        </p>
      </div>

      {/* Other details free text */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-ink/75 block">Other custom requirements or notes</label>
        <textarea
          rows={3}
          placeholder="e.g. specific food allergies, extra large baggage requirements, pickup locations, or milestone celebration details..."
          value={formData.specialRequirements?.otherDetails || ""}
          onChange={(e) => handleOtherDetailsChange(e.target.value)}
          className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-xs outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition resize-none"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-100">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-ink transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </button>

        <button
          onClick={onNext}
          className="rounded-full bg-pine text-parchment font-semibold text-xs px-8 py-3.5 hover:bg-gold hover:text-pine transition shadow-premium"
        >
          Continue to Contact Preference
        </button>
      </div>
    </div>
  );
}
