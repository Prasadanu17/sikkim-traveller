import React from "react";
import { motion } from "framer-motion";
import { Calendar, Users, MapPin, DollarSign, Home, MessageSquare, Eye } from "lucide-react";
import { destinations as allDests } from "../../data/destinations";

export default function BookingSuccess({ bookingContext, submissionResult, onViewTrip, onTalkCopilot, onBackHome }) {
  const { destinations, budget, trip, traveler } = bookingContext;
  const requestId = submissionResult?.requestId || "ST-REQ-PENDING";

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

  return (
    <div className="text-center py-6 space-y-6">
      {/* Animated Success Checkmark */}
      <div className="flex flex-col items-center gap-3">
        <motion.svg
          width="64"
          height="64"
          viewBox="0 0 56 56"
          initial="hidden"
          animate="visible"
          className="mb-2"
        >
          <circle
            cx="28"
            cy="28"
            r="26"
            fill="none"
            stroke="#E8A33D"
            strokeWidth="2.5"
            className="animate-pulse"
          />
          <path
            d="M17 29 L24 36 L39 20"
            fill="none"
            stroke="#E8A33D"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
        <span className="text-xs uppercase tracking-[0.25em] text-gold-dark font-bold">Inquiry Sent</span>
        <h3 className="font-display text-2xl sm:text-3xl text-ink font-semibold">
          🎉 YOUR JOURNEY REQUEST IS RECEIVED
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Our travel team will review your requirements and contact you to confirm availability, final pricing, permits, accommodation, and transportation.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-premium max-w-md mx-auto text-left space-y-4">
        {/* Request ID Banner */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <span className="text-[10px] text-neutral-450 font-bold uppercase block">REQUEST ID</span>
            <span className="text-sm font-bold text-pine tracking-wider">{requestId}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-450 font-bold uppercase block">STATUS</span>
            <span className="bg-amber-100 text-amber-800 font-bold text-[9px] uppercase px-2 py-0.5 rounded border border-amber-250">
              Awaiting Confirmation
            </span>
          </div>
        </div>

        {/* Small Data Strip */}
        <div className="space-y-2.5 text-xs text-ink">
          {/* Dates */}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gold-dark shrink-0" />
            <span className="font-medium">
              {trip.startDate ? `${trip.startDate} – ${trip.endDate}` : `${trip.duration} Days (Flexible)`}
            </span>
          </div>

          {/* Travelers */}
          <div className="flex items-center gap-2">
            <Users size={14} className="text-gold-dark shrink-0" />
            <span className="font-medium">
              {traveler.total} Traveler{traveler.total > 1 ? "s" : ""} ({traveler.type})
            </span>
          </div>

          {/* Route */}
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-gold-dark shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">
              {destinations.map(getDestName).join(" → ")}
            </span>
          </div>

          {/* Budget */}
          {budget.estimatedRange && (
            <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 mt-1">
              <DollarSign size={14} className="text-gold-dark shrink-0" />
              <span className="text-sm font-bold text-ink">
                Est. Price: {formatPrice(budget.estimatedRange.min)} – {formatPrice(budget.estimatedRange.max)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto pt-4">
        {/* View Trip */}
        <button
          onClick={onViewTrip}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-300 bg-white hover:border-gold px-5 py-3 text-xs font-semibold text-ink transition"
        >
          <Eye size={14} /> View My Trip
        </button>

        {/* Talk to Copilot */}
        <button
          onClick={onTalkCopilot}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-neutral-300 bg-white hover:border-gold px-5 py-3 text-xs font-semibold text-ink transition"
        >
          <MessageSquare size={14} className="text-gold-dark" /> Talk to Trip Copilot
        </button>

        {/* Back to Home */}
        <button
          onClick={onBackHome}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-pine hover:bg-gold text-parchment hover:text-pine px-5 py-3 text-xs font-semibold transition"
        >
          <Home size={14} /> Back to Home
        </button>
      </div>
    </div>
  );
}


