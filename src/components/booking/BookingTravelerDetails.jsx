import React, { useState } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, Plus, Trash2 } from "lucide-react";

export default function BookingTravelerDetails({ bookingContext, formData, updateFormData, onNext, onPrev, validationErrors }) {
  const { traveler } = bookingContext;
  const [additionalNameInput, setAdditionalNameInput] = useState("");

  const handlePrimaryChange = (field, val) => {
    updateFormData("primaryTraveler", {
      ...formData.primaryTraveler,
      [field]: val
    });
  };

  const addAdditionalName = () => {
    const name = additionalNameInput.trim();
    if (!name) return;
    updateFormData("additionalTravelers", [...formData.additionalTravelers, name]);
    setAdditionalNameInput("");
  };

  const removeAdditionalName = (idx) => {
    updateFormData("additionalTravelers", formData.additionalTravelers.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-neutral-100 pb-4">
        <h4 className="font-display text-xl text-ink font-semibold">Step 2: Traveler Contact Details</h4>
        <p className="text-xs text-neutral-500 mt-1">
          Specify contact details for the primary coordinator. All communication regarding pricing, availability, and permits will go here.
        </p>
      </div>

      {/* Primary Traveler Form */}
      <div className="space-y-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/75 flex items-center gap-1.5">
            <User size={13} className="text-gold-dark" /> Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="Enter primary traveler's full name"
            value={formData.primaryTraveler?.fullName || ""}
            onChange={(e) => handlePrimaryChange("fullName", e.target.value)}
            className={`rounded-lg border bg-white/60 px-3.5 py-2.5 text-xs outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition ${
              validationErrors.fullName ? "border-rose-450 focus:ring-rose-200" : "border-ink/15"
            }`}
          />
          {validationErrors.fullName && (
            <span className="text-[10px] text-rose-500 font-medium">{validationErrors.fullName}</span>
          )}
        </div>

        {/* Email & Phone grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/75 flex items-center gap-1.5">
              <Mail size={13} className="text-gold-dark" /> Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={formData.primaryTraveler?.email || ""}
              onChange={(e) => handlePrimaryChange("email", e.target.value)}
              className={`rounded-lg border bg-white/60 px-3.5 py-2.5 text-xs outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition ${
                validationErrors.email ? "border-rose-450 focus:ring-rose-200" : "border-ink/15"
              }`}
            />
            {validationErrors.email && (
              <span className="text-[10px] text-rose-500 font-medium">{validationErrors.email}</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/75 flex items-center gap-1.5">
              <Phone size={13} className="text-gold-dark" /> WhatsApp / Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 9876543210"
              value={formData.primaryTraveler?.phone || ""}
              onChange={(e) => handlePrimaryChange("phone", e.target.value)}
              className={`rounded-lg border bg-white/60 px-3.5 py-2.5 text-xs outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition ${
                validationErrors.phone ? "border-rose-450 focus:ring-rose-200" : "border-ink/15"
              }`}
            />
            {validationErrors.phone && (
              <span className="text-[10px] text-rose-500 font-medium">{validationErrors.phone}</span>
            )}
          </div>
        </div>

        {/* Location (City / Country) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/75 flex items-center gap-1.5">
            <MapPin size={13} className="text-gold-dark" /> City & Country
          </label>
          <input
            type="text"
            placeholder="e.g. Mumbai, India or London, UK (Optional)"
            value={formData.primaryTraveler?.location || ""}
            onChange={(e) => handlePrimaryChange("location", e.target.value)}
            className="rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2.5 text-xs outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition"
          />
        </div>
      </div>

      {/* Traveler Count Read-only Summary */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block mb-2">TRAVELER COUNT BREAKDOWN (FROM TRIP PLAN)</span>
        <div className="flex items-center gap-6 text-xs font-semibold text-ink">
          <div>Adults: <span className="text-pine font-bold">{traveler.adults}</span></div>
          {traveler.seniors > 0 && <div>Seniors: <span className="text-pine font-bold">{traveler.seniors}</span></div>}
          {traveler.children > 0 && <div>Children: <span className="text-pine font-bold">{traveler.children}</span></div>}
          <div className="ml-auto text-neutral-400 font-normal">Total: {traveler.total}</div>
        </div>
        <p className="text-[10px] text-neutral-400 mt-2">
          If you need to change traveler count, please edit the trip parameters on the planner page.
        </p>
      </div>

      {/* Additional Travelers Names (Optional) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink/75 block">Companion Names (Optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter additional traveler name"
            value={additionalNameInput}
            onChange={(e) => setAdditionalNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAdditionalName())}
            className="flex-1 rounded-lg border border-ink/15 bg-white/60 px-3.5 py-2 text-xs outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 transition"
          />
          <button
            type="button"
            onClick={addAdditionalName}
            className="rounded-lg bg-gold/15 text-gold-dark hover:bg-gold hover:text-pine px-3 py-2 transition"
          >
            <Plus size={16} />
          </button>
        </div>

        {formData.additionalTravelers?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1.5">
            {formData.additionalTravelers.map((name, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-white border border-neutral-200 text-xs px-2.5 py-1 rounded-full text-ink font-medium shadow-xs">
                {name}
                <button
                  type="button"
                  onClick={() => removeAdditionalName(i)}
                  className="text-neutral-400 hover:text-rose-500 transition"
                >
                  <Trash2 size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
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
          Continue to Stay & Transport
        </button>
      </div>
    </div>
  );
}
