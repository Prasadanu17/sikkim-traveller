import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Sliders, DollarSign, Bed, Car, Edit3, Sparkles, ArrowRight } from "lucide-react";
import { destinations as allDests } from "../../data/destinations";

export default function PlannerSummary({ state, goToStep, onGenerateItinerary, onSubmit, onCreateJourney }) {
  const { dates, duration, interests, destinations, travelers, travelStyle, budget, budgetIntelligence, accommodation, transportation } = state;

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getSelectedDestNames = () => {
    return destinations.selected
      .map((slug) => {
        const d = allDests.find((item) => item.slug === slug);
        return d ? d.name : slug;
      })
      .join(", ");
  };

  const getTravelerString = () => {
    const parts = [`${travelers.adults} Adult${travelers.adults > 1 ? "s" : ""}`];
    if (travelers.seniors > 0) parts.push(`${travelers.seniors} Senior${travelers.seniors > 1 ? "s" : ""}`);
    if (travelers.children > 0) parts.push(`${travelers.children} Child${travelers.children > 1 ? "ren" : ""}`);
    return `${parts.join(", ")} (${travelers.type})`;
  };

  const getAccomLabel = () => {
    if (!accommodation) return "Open to recommendations";
    if (accommodation.mode === "recommend" || accommodation.types.length === 0) {
      return accommodation.comfort
        ? `${accommodation.comfort.charAt(0).toUpperCase() + accommodation.comfort.slice(1)} — Open to recommendations`
        : "Open to recommendations";
    }
    const typeLabels = {
      homestay: "Homestay", hotel: "Hotel", resort: "Resort",
      boutique: "Boutique Stay", guesthouse: "Guesthouse", lodge: "Lodge"
    };
    return accommodation.types.map((t) => typeLabels[t] || (t.charAt(0).toUpperCase() + t.slice(1))).join(" / ");
  };

  const getTransportLabel = () => {
    if (!transportation) return "Open to recommendations";
    if (transportation.mode === "recommend" || transportation.preferredModes.length === 0) {
      return "Open to recommendations";
    }
    const modeLabels = {
      "private-cab": "Private Cab",
      "shared-sumo": "Shared Sumo",
      "premium-private": "Premium Private (Innova/Fortuner)"
    };
    return transportation.preferredModes.map((m) => modeLabels[m] || m).join(" / ");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 text-left">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold tracking-widest text-gold bg-pine rounded-full mb-3 uppercase shadow-sm">
          <Sparkles size={12} /> Trip Summary
        </span>
        <h2 className="font-display text-2xl sm:text-3xl text-ink font-semibold mb-1">
          Your Sikkim Trip, at a glance.
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Review your preferences below. Click Edit on any card to make adjustments, or proceed to build your custom itinerary.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* 1. WHEN */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-premium flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={12} /> WHEN
              </span>
              <button onClick={() => goToStep(1)} className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wide">
                <Edit3 size={10} /> Edit
              </button>
            </div>
            <div>
              <h4 className="font-display text-lg text-ink font-semibold">
                {dates.mode === "fixed" ? (
                  <span className="font-sans font-semibold text-base">
                    {new Date(dates.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" – "}
                    {new Date(dates.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                ) : "Flexible Schedule"}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">Duration: <span className="font-semibold text-ink">{duration} Days</span></p>
              {state.travelIntelligence?.recommendedMonths && (
                <span className="inline-block mt-2 text-[10px] font-semibold text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                  Recommended: {state.travelIntelligence.recommendedMonths.slice(0, 2).join("/")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. WHERE */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-premium flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} /> WHERE
              </span>
              <button onClick={() => goToStep(5)} className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wide">
                <Edit3 size={10} /> Edit
              </button>
            </div>
            <div>
              <h4 className="font-display text-lg text-ink font-semibold line-clamp-2">
                {getSelectedDestNames() || "No destinations selected"}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">Stops: <span className="font-semibold text-ink">{destinations.selected.length}</span></p>
            </div>
          </div>
        </div>

        {/* 3. WHO */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-premium flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users size={12} /> WHO
              </span>
              <button onClick={() => goToStep(6)} className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wide">
                <Edit3 size={10} /> Edit
              </button>
            </div>
            <div>
              <h4 className="font-display text-base text-ink font-semibold leading-snug">
                {getTravelerString()}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">Total: <span className="font-semibold text-ink">{travelers.total} Travelers</span></p>
            </div>
          </div>
        </div>

        {/* 4. PACE */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-premium flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={12} /> PACE
              </span>
              <button onClick={() => goToStep(6)} className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wide">
                <Edit3 size={10} /> Edit
              </button>
            </div>
            <div>
              <h4 className="font-display text-lg text-ink font-semibold">
                {travelStyle === "relaxed" && "Relaxed 🌿"}
                {travelStyle === "balanced" && "Balanced ⚖️"}
                {travelStyle === "packed" && "Packed 🚀"}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                {travelStyle === "relaxed" && "1–2 experiences per day"}
                {travelStyle === "balanced" && "2–3 experiences per day"}
                {travelStyle === "packed" && "3+ experiences per day"}
              </p>
            </div>
          </div>
        </div>

        {/* 5. STAY */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-premium flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Bed size={12} /> STAY
              </span>
              <button onClick={() => goToStep(9)} className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wide">
                <Edit3 size={10} /> Edit
              </button>
            </div>
            <div>
              <h4 className="font-display text-base text-ink font-semibold leading-snug">
                {getAccomLabel()}
              </h4>
              {accommodation?.comfort && (
                <span className="text-xs text-neutral-500 block mt-1">
                  Comfort: <span className="font-semibold text-ink capitalize">{accommodation.comfort}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 6. TRANSPORT */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-premium flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Car size={12} /> TRANSPORT
              </span>
              <button onClick={() => goToStep(10)} className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wide">
                <Edit3 size={10} /> Edit
              </button>
            </div>
            <div>
              <h4 className="font-display text-base text-ink font-semibold leading-snug">
                {getTransportLabel()}
              </h4>
              {transportation?.transferPreference && transportation.transferPreference !== "" && (
                <span className="text-xs text-neutral-500 block mt-1 capitalize">
                  Transfers: <span className="font-semibold text-ink">{transportation.transferPreference}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 7. BUDGET OVERVIEW */}
        {budgetIntelligence && (
          <div className="bg-cream border border-gold/30 rounded-xl p-6 shadow-gold-glow sm:col-span-2 text-left space-y-4">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-gold-dark">
                <DollarSign size={12} /> APPROXIMATE PLANNING BUDGET
              </span>
              <button onClick={() => goToStep(7)} className="text-[10px] font-bold text-gold-dark hover:text-gold flex items-center gap-0.5 uppercase tracking-wide">
                <Edit3 size={10} /> Edit
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl text-ink font-semibold">
                  {formatPrice(budgetIntelligence.estimatedRange.min)} – {formatPrice(budgetIntelligence.estimatedRange.max)}
                </h3>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Budget level: <span className="font-bold text-neutral-600 capitalize">{budget.level ? budget.level.charAt(0).toUpperCase() + budget.level.slice(1) : ""}</span>
                </span>
              </div>

              {budget.mode === "fixed" && budgetIntelligence.match && (
                <div className={`px-4 py-2 border rounded-xl text-xs font-semibold text-center ${
                  budgetIntelligence.match.status === "match" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  budgetIntelligence.match.status === "high" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                  {budgetIntelligence.match.status === "match" && "✓ Target Matched"}
                  {budgetIntelligence.match.status === "high" && "✓ Budget Flexible"}
                  {budgetIntelligence.match.status === "low" && "⚠️ Target Low"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* GENERATE OR CREATE JOURNEY PRIMARY CTA */}
      <div className="pt-6 border-t border-neutral-100 flex flex-col items-center text-center space-y-3">
        {state.itinerary?.current ? (
          <>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Your personalized itinerary is ready. Create your passwordless Sikkim journey to view your dashboard, permits, and proposal.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCreateJourney?.()}
                className="inline-flex items-center gap-2 rounded-full bg-pine text-gold font-bold text-sm px-8 py-3.5 hover:bg-gold hover:text-pine hover:shadow-gold-glow transition-all duration-300 cursor-pointer"
              >
                ✨ Create My Sikkim Journey <ArrowRight size={16} />
              </motion.button>
              <button
                onClick={onSubmit}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-ink px-4 py-2 transition-colors cursor-pointer"
              >
                Detailed Booking Form
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              We'll combine your travel dates, destinations, travel style, budget, and preferences into a personalized Sikkim journey.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGenerateItinerary}
              className="inline-flex items-center gap-2 rounded-full bg-pine text-parchment font-semibold text-sm px-10 py-4 hover:bg-gold hover:text-pine hover:shadow-gold-glow transition-all duration-300 cursor-pointer"
            >
              ✨ Generate My Sikkim Itinerary <ArrowRight size={16} />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
