import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, Info, Sparkles } from "lucide-react";

const TRANSPORT_MODES = [
  {
    id: "private-cab",
    emoji: "🚙",
    label: "Private Cab / SUV",
    desc: "Dedicated vehicle with driver — flexible schedule, comfortable, ideal for families and couples.",
    badge: "Most Popular"
  },
  {
    id: "shared-sumo",
    emoji: "🚐",
    label: "Shared Sumo",
    desc: "Shared mountain vehicle on fixed routes — cost-efficient, great for solo and budget travelers.",
    badge: "Budget-Friendly"
  },
  {
    id: "premium-private",
    emoji: "🚗",
    label: "Premium Private",
    desc: "Innova Crysta / Fortuner with enhanced comfort — ideal for premium and luxury travelers.",
    badge: "Premium"
  }
];

const TRANSPORT_COMFORT = [
  { id: "budget",   label: "Budget",   desc: "Practical, functional transport" },
  { id: "balanced", label: "Balanced", desc: "Standard comfort, good value" },
  { id: "comfort",  label: "Comfort",  desc: "Enhanced ride comfort" },
  { id: "premium",  label: "Premium",  desc: "Premium vehicles and service" }
];

const DRIVE_TOLERANCE = [
  { id: "very-comfortable", label: "🧘 Very Comfortable", desc: "Long drives are fine, no issue" },
  { id: "comfortable",      label: "🙂 Comfortable",      desc: "Most drives are fine" },
  { id: "moderate",         label: "⚖️ Moderate",          desc: "Prefer to limit long stretches" },
  { id: "prefer-shorter",   label: "🌿 Prefer Shorter",   desc: "Shorter travel days where possible" }
];

const TRANSFER_PREFS = [
  { id: "fewer",         label: "Fewer Transfers",       desc: "Minimise the number of vehicle changes" },
  { id: "balanced",      label: "Balanced",              desc: "A mix of local and intercity runs" },
  { id: "no-preference", label: "No Preference",         desc: "Let the itinerary decide" }
];

const TIME_OPTIONS = [
  { id: "morning",   label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening",   label: "Evening" },
  { id: "flexible",  label: "Flexible" }
];

export default function TransportationSelector({
  transportation,
  travelPreferences,
  budget,
  destinations = [],
  travelers,
  travelStyle,
  onChangeTransportation
}) {
  const {
    mode,
    preferredModes,
    comfort,
    longDriveTolerance,
    transferPreference,
    arrivalPreference,
    departurePreference
  } = transportation;

  const budgetLevel = budget?.level || "comfortable";
  const transportSuggestions = travelPreferences?.transportSuggestions || [];
  const prefNotes = travelPreferences?.notes || [];

  // Detect North Sikkim or Silk Route destinations
  const NORTH_SLUGS = ["lachung", "lachen", "yumthang", "gurudongmar", "zero-point"];
  const SILK_SLUGS = ["zuluk", "silk", "pakyong"];
  const hasNorth = destinations.some((d) =>
    NORTH_SLUGS.some((s) => d.toLowerCase().includes(s))
  );
  const hasSilk = destinations.some((d) =>
    SILK_SLUGS.some((s) => d.toLowerCase().includes(s))
  );

  // Budget vs transport comfort mismatch
  const budgetOrder = ["budget", "comfortable", "premium", "luxury"];
  const transportOrder = ["budget", "balanced", "comfort", "premium"];
  const budgetIdx = budgetOrder.indexOf(budgetLevel);
  const transportIdx = transportOrder.indexOf(comfort);
  const hasMismatch = comfort && transportIdx > budgetIdx;

  // Packed pace + short drive conflict from notes
  const hasComfortConflict = prefNotes.some(
    (n) => n.type === "warning" && n.message.includes("packed travel pace")
  );

  const toggleMode = (id) => {
    const updated = preferredModes.includes(id)
      ? preferredModes.filter((m) => m !== id)
      : [...preferredModes, id];
    onChangeTransportation({ preferredModes: updated, mode: "custom" });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 text-left">

      {/* HEADER */}
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1">
          How would you like to travel?
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Choose the transport style that fits your comfort and budget. On Sikkim's mountain roads, transport choice significantly affects your trip experience.
        </p>
      </div>

      {/* AI SUGGESTIONS STRIP */}
      {transportSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gold/10 border border-gold/25 rounded-xl p-4 flex gap-3"
        >
          <Sparkles size={16} className="text-gold-dark shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gold-dark block">
              Recommendation for your group
            </span>
            {transportSuggestions.map((s, i) => (
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
            Let the planner decide the best transport based on your group, route, and budget
          </p>
        </div>
        <button
          onClick={() =>
            onChangeTransportation({ mode: mode === "recommend" ? "custom" : "recommend" })
          }
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

      {/* TRANSPORT MODE CARDS */}
      <div>
        <h3 className="font-display text-lg text-ink font-semibold mb-4">
          Transport Mode
          <span className="ml-2 text-xs font-sans text-neutral-400 font-normal">(select all that apply)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRANSPORT_MODES.map((tm) => {
            const isSelected = preferredModes.includes(tm.id);
            return (
              <motion.button
                key={tm.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleMode(tm.id)}
                className={`p-5 rounded-xl border text-left relative transition-all ${
                  isSelected
                    ? "bg-cream border-gold ring-2 ring-gold/20 shadow-gold-glow"
                    : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                    <Check size={9} strokeWidth={3} className="text-pine" />
                  </div>
                )}
                <span className="text-2xl block mb-2">{tm.emoji}</span>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-display text-sm font-bold text-ink">{tm.label}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide text-gold-dark bg-gold/10 px-1.5 py-0.5 rounded-full inline-block mb-1.5">
                  {tm.badge}
                </span>
                <p className="text-[10px] text-neutral-400 leading-normal">{tm.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* DESTINATION-AWARE NOTICES */}
      <AnimatePresence>
        {(hasNorth || hasSilk) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3"
          >
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-blue-700 block">
                Route Planning Note
              </span>
              {hasNorth && (
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>North Sikkim</strong> (Lachung, Lachen, Yumthang, Gurudongmar) requires a local Inner Line Permit and designated mountain vehicles. Shared transport is very limited — private transport is strongly recommended.
                </p>
              )}
              {hasSilk && (
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Silk Route / East Sikkim</strong> (Zuluk, Nathang) involves narrow mountain tracks requiring 4WD vehicles. Please confirm road access locally — conditions vary by season and weather.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMFORT LEVEL */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-4">
          Transport Comfort
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TRANSPORT_COMFORT.map((tc) => (
            <button
              key={tc.id}
              onClick={() => onChangeTransportation({ comfort: tc.id })}
              className={`p-4 rounded-xl border text-left transition-all ${
                comfort === tc.id
                  ? "bg-cream border-gold ring-2 ring-gold/20"
                  : "bg-white border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span className="font-display text-sm font-bold text-ink flex items-center justify-between">
                {tc.label}
                {comfort === tc.id && <Check size={12} className="text-gold" strokeWidth={3} />}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1">{tc.desc}</span>
            </button>
          ))}
        </div>

        {/* Budget mismatch warning */}
        <AnimatePresence>
          {hasMismatch && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"
            >
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Your selected transport comfort (<strong>{comfort}</strong>) is higher than your overall trip budget tier (<strong>{budgetLevel}</strong>). The planning estimate will reflect this.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LONG-DRIVE TOLERANCE */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-1">
          Long Road Journey Comfort
        </h3>
        <p className="text-xs text-neutral-400 mb-4">
          Sikkim's mountain roads can involve 4–6 hour drives between destinations. How comfortable are you with this?
        </p>

        {/* Pace conflict notice */}
        <AnimatePresence>
          {hasComfortConflict && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2"
            >
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Your packed travel pace combined with a short-drive preference may create tight travel days. Consider adjusting your pace on Step 6 or reducing destination stops.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DRIVE_TOLERANCE.map((dt) => (
            <button
              key={dt.id}
              onClick={() => onChangeTransportation({ longDriveTolerance: dt.id })}
              className={`p-4 rounded-xl border text-left transition-all ${
                longDriveTolerance === dt.id
                  ? "bg-cream border-gold ring-2 ring-gold/20"
                  : "bg-white border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span className="font-display text-sm font-bold text-ink flex justify-between">
                {dt.label}
                {longDriveTolerance === dt.id && <Check size={12} className="text-gold" strokeWidth={3} />}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-1">{dt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TRANSFER PREFERENCE */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-4">
          Transfer Preference
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRANSFER_PREFS.map((tp) => (
            <button
              key={tp.id}
              onClick={() => onChangeTransportation({ transferPreference: tp.id })}
              className={`p-4 rounded-xl border text-left transition-all ${
                transferPreference === tp.id
                  ? "bg-cream border-gold ring-2 ring-gold/20"
                  : "bg-white border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span className="font-display text-sm font-bold text-ink block">{tp.label}</span>
              <span className="text-[10px] text-neutral-400 block mt-1">{tp.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ARRIVAL / DEPARTURE (OPTIONAL) */}
      <div className="border-t border-neutral-100 pt-8">
        <h3 className="font-display text-lg text-ink font-semibold mb-1">
          Arrival & Departure Preference
          <span className="ml-2 text-xs font-sans text-neutral-400 font-normal">(optional)</span>
        </h3>
        <p className="text-xs text-neutral-400 mb-4">
          Helps us schedule your first and last day more accurately.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">
              Preferred Arrival Time
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTransportation({ arrivalPreference: t.id })}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    arrivalPreference === t.id
                      ? "bg-pine text-parchment border-pine"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">
              Preferred Departure Time
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTransportation({ departurePreference: t.id })}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    departurePreference === t.id
                      ? "bg-pine text-parchment border-pine"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-neutral-50 border border-neutral-150 rounded-lg p-3 flex gap-2">
          <Info size={13} className="text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Transportation preferences are for planning purposes only. Actual vehicle availability, road conditions, and permit requirements are subject to local conditions and will be confirmed during booking.
          </p>
        </div>
      </div>
    </div>
  );
}
