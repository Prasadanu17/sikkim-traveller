import React from "react";
import { ArrowLeft, MessageSquare, Phone, Mail, Clock } from "lucide-react";

export default function BookingContactDetails({ formData, updateFormData, onNext, onPrev, validationErrors }) {
  
  const handleMethodSelect = (method) => {
    updateFormData("contactPreference", {
      ...formData.contactPreference,
      method
    });
  };

  const handleTimeSelect = (timeOfDay) => {
    updateFormData("contactPreference", {
      ...formData.contactPreference,
      timeOfDay
    });
  };

  const methods = [
    { key: "WhatsApp", label: "WhatsApp Chat", icon: MessageSquare },
    { key: "Phone", label: "Direct Phone Call", icon: Phone },
    { key: "Email", label: "Email Correspondence", icon: Mail }
  ];

  const times = [
    { key: "Morning", label: "Morning (9 AM – 12 PM)" },
    { key: "Afternoon", label: "Afternoon (12 PM – 4 PM)" },
    { key: "Evening", label: "Evening (4 PM – 8 PM)" },
    { key: "Anytime", label: "Anytime (9 AM – 8 PM)" }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-neutral-100 pb-4">
        <h4 className="font-display text-xl text-ink font-semibold">Step 4: Contact Preferences</h4>
        <p className="text-xs text-neutral-500 mt-1">
          Tell us how and when you would prefer our destination specialists to reach out with your verified itinerary quote.
        </p>
      </div>

      {/* Method Selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-ink/75 block">Preferred Contact Channel *</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {methods.map((m) => {
            const Icon = m.icon;
            const isSelected = formData.contactPreference?.method === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => handleMethodSelect(m.key)}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border gap-2.5 transition text-center ${
                  isSelected
                    ? "border-gold bg-gold/10 text-gold-dark font-semibold shadow-xs"
                    : "border-neutral-200 bg-white/50 text-neutral-600 hover:border-neutral-350"
                }`}
              >
                <Icon size={20} className={isSelected ? "text-gold-dark" : "text-neutral-400"} />
                <span className="text-xs">{m.label}</span>
              </button>
            );
          })}
        </div>
        {validationErrors.contactMethod && (
          <span className="text-[10px] text-rose-500 font-medium block">{validationErrors.contactMethod}</span>
        )}
      </div>

      {/* Time Selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-ink/75 flex items-center gap-1.5">
          <Clock size={13} className="text-gold-dark" /> Preferred Callback Time (Optional)
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {times.map((t) => {
            const isSelected = formData.contactPreference?.timeOfDay === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTimeSelect(t.key)}
                className={`p-3 rounded-lg border text-xs text-center transition ${
                  isSelected
                    ? "border-gold bg-gold/10 text-gold-dark font-medium"
                    : "border-neutral-250 bg-white/50 text-neutral-600 hover:border-neutral-350"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
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
          Continue to Final Review
        </button>
      </div>
    </div>
  );
}
