import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, Info, Sparkles } from "lucide-react";

const STAY_TYPES = [
  { id: "homestay",  emoji: "🏠", label: "Homestay",        desc: "Local family homes, authentic cultural immersion" },
  { id: "hotel",     emoji: "🏨", label: "Hotel",            desc: "Standard to premium hotel properties" },
  { id: "resort",    emoji: "🏔️", label: "Resort",           desc: "Full-service mountain resorts with amenities" },
  { id: "boutique",  emoji: "🌿", label: "Boutique Stay",    desc: "Intimate, design-focused properties" },
  { id: "guesthouse",emoji: "🏡", label: "Guesthouse",       desc: "Simple, comfortable independent guesthouses" },
  { id: "lodge",     emoji: "⛺", label: "Lodge / Mountain", desc: "High-altitude and trekking base camps" }
];

const COMFORT_TIERS = [
  { id: "budget",      label: "Budget 💰",     desc: "Basic but clean accommodation" },
  { id: "comfortable", label: "Comfortable ✨", desc: "Mid-range, reliable properties" },
  { id: "premium",     label: "Premium 💎",     desc: "Quality hotels and boutique stays" },
  { id: "luxury",      label: "Luxury 👑",      desc: "Luxury resorts and heritage properties" }
];

const ROOM_TYPES = [
  { id: "single",      label: "Single Room" },
  { id: "double",      label: "Double Room" },
  { id: "twin",        label: "Twin Room" },
  { id: "family",      label: "Family Room" },
  { id: "multiple",    label: "Multiple Rooms" },
  { id: "no-preference", label: "No Preference" }
];

const LOCATION_PREFS = [
  { id: "center",           label: "🏙️ Town / City Center" },
  { id: "scenic",           label: "🌄 Scenic View" },
  { id: "quiet",            label: "🌿 Quiet & Peaceful" },
  { id: "road-access",      label: "🚗 Easy Road Access" },
  { id: "near-attractions", label: "📍 Near Main Attractions" }
];

const PRIORITIES = [
  { id: "mountain-view", label: "Mountain View" },
  { id: "balcony",       label: "Balcony" },
  { id: "breakfast",     label: "Breakfast Included" },
  { id: "parking",       label: "Parking" },
  { id: "wifi",          label: "Wi-Fi" },
  { id: "family",        label: "Family-Friendly" },
  { id: "quiet",         label: "Quiet Environment" },
  { id: "central",       label: "Central Location" }
];

export default function AccommodationSelector({
  accommodation,
  travelPreferences,
  budget,
  travelers,
  onChangeAccommodation
}) {
  const { mode, types, comfort, roomPreference, locationPreferences, priorities } = accommodation;
  const budgetLevel = budget?.level || "comfortable";

  // Toggle a type in or out of the types array
  const toggleType = (id) => {
    const updated = types.includes(id)
      ? types.filter((t) => t !== id)
      : [...types, id];
    onChangeAccommodation({ types: updated, mode: "custom" });
  };

  // Toggle a location preference
  const toggleLocation = (id) => {
    const updated = locationPreferences.includes(id)
      ? locationPreferences.filter((l) => l !== id)
      : [...locationPreferences, id];
    onChangeAccommodation({ locationPreferences: updated });
  };

  // Toggle a priority tag
  const togglePriority = (id) => {
    const updated = priorities.includes(id)
      ? priorities.filter((p) => p !== id)
      : [...priorities, id];
    onChangeAccommodation({ priorities: updated });
  };

  // Detect comfort mismatch
  const comfortOrder = ["budget", "comfortable", "premium", "luxury"];
  const budgetIdx = comfortOrder.indexOf(budgetLevel);
  const comfortIdx = comfortOrder.indexOf(comfort);
  const hasMismatch = comfort && comfortIdx > budgetIdx;

  // Gather traveler-aware suggestions
  const accomSuggestions = travelPreferences?.accommodationSuggestions || [];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 text-left">

      {/* HEADER */}
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1">
          Where would you like to stay?
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Pick the kind of stays you enjoy, or let us recommend based on your preferences.
        </p>
      </div>

      {/* AI SUGGESTIONS STRIP */}
      {accomSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gold/10 border border-gold/25 rounded-xl p-4 flex gap-3"
        >
          <Sparkles size={16} className="text-gold-dark shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gold-dark block">
              AI Suggestion for your group
            </span>
            {accomSuggestions.map((s, i) => (
              <p key={i} className="text-xs text-neutral-700 leading-relaxed">{s}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* OPEN TO RECOMMENDATIONS TOGGLE */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between shadow-premium">
        <div>
          <h4 className="font-display text-sm font-bold text-ink">Open to Recommendations</h4>
          <p className="text-xs text-neutral-400 mt-0.5">
            Let the AI suggest the best stay type based on your trip profile
          </p>
        </div>
        <button
          onClick={() => onChangeAccommodation({ mode: mode === "recommend" ? "custom" : "recommend" })}
          className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            mode === "recommend" ? "bg-gold" : "bg-neutral-200"
          }`}
          aria-label="Toggle open to recommendations"
        >
          <motion.span
            layout
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
            animate={{ x: mode === "recommend" ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* STAY TYPE GRID */}
      <div>
        <h3 className="font-display text-lg text-ink font-semibold mb-4">
          Preferred Stay Type
          <span className="ml-2 text-xs font-sans text-neutral-400 font-normal">(select all that apply)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STAY_TYPES.map((type) => {
            const isSelected = types.includes(type.id);
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleType(type.id)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? "bg-cream border-gold ring-2 ring-gold/20 shadow-gold-glow"
                    : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                    <Check size={9} strokeWidth={3} className="text-pine" />
                  </div>
                )}
                <span className="text-2xl block mb-2">{type.emoji}</span>
                <span className="font-display text-sm font-bold text-ink block">{type.label}</span>
                <span className="text-[10px] text-neutral-400 leading-normal block mt-0.5">{type.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* COMFORT LEVEL */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-4">
          Accommodation Comfort Level
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {COMFORT_TIERS.map((tier) => {
            const isSelected = comfort === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => onChangeAccommodation({ comfort: tier.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-cream border-gold ring-2 ring-gold/20"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span className="font-display text-sm font-bold text-ink flex items-center justify-between">
                  {tier.label}
                  {isSelected && <Check size={12} className="text-gold" strokeWidth={3} />}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-1">{tier.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Budget mismatch warning */}
        <AnimatePresence>
          {hasMismatch && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"
            >
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Your selected accommodation comfort level (<strong>{comfort}</strong>) is higher than
                your overall trip budget tier (<strong>{budgetLevel}</strong>). The planning estimate
                will adjust to reflect this. You can keep your preferences — this is a planning estimate only.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ROOM PREFERENCE */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-4">
          Room Arrangement
        </h3>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((rt) => (
            <button
              key={rt.id}
              onClick={() => onChangeAccommodation({ roomPreference: roomPreference === rt.id ? "" : rt.id })}
              className={`px-4 py-2 rounded-full border text-xs font-semibold transition ${
                roomPreference === rt.id
                  ? "bg-pine text-parchment border-pine"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      {/* LOCATION PREFERENCE */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-4">
          Preferred Location
          <span className="ml-2 text-xs font-sans text-neutral-400 font-normal">(select all that apply)</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {LOCATION_PREFS.map((loc) => {
            const isSelected = locationPreferences.includes(loc.id);
            return (
              <button
                key={loc.id}
                onClick={() => toggleLocation(loc.id)}
                className={`px-4 py-2 rounded-full border text-xs font-semibold transition ${
                  isSelected
                    ? "bg-pine text-parchment border-pine"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIORITIES */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-1">
          Accommodation Priorities
          <span className="ml-2 text-xs font-sans text-neutral-400 font-normal">(optional)</span>
        </h3>
        <p className="text-xs text-neutral-400 mb-4">
          These are preference filters for future accommodation matching. Not all properties will include every feature.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => {
            const isSelected = priorities.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePriority(p.id)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                  isSelected
                    ? "bg-gold/20 text-gold-dark border-gold/40"
                    : "bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {isSelected ? "✓ " : ""}{p.label}
              </button>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-neutral-50 border border-neutral-150 rounded-lg p-3 flex gap-2">
          <Info size={13} className="text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Accommodation preferences are used for planning purposes only. Actual property availability, features, and pricing will be confirmed during the booking step.
          </p>
        </div>
      </div>
    </div>
  );
}
