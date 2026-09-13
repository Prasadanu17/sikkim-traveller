import { motion } from "framer-motion";
import { Check } from "lucide-react";

const INTEREST_OPTIONS = [
  { id: "mountains", label: "Mountains", emoji: "🏔️", desc: "Panoramic views of Kanchenjunga" },
  { id: "snow", label: "Snow", emoji: "❄️", desc: "High-altitude winter snowscapes" },
  { id: "nature", label: "Nature & Flowers", emoji: "🌸", desc: "Blooming rhododendrons & green valleys" },
  { id: "photography", label: "Photography", emoji: "📸", desc: "Crisp mountain air & panoramic skies" },
  { id: "trekking", label: "Trekking & Adventure", emoji: "🥾", desc: "Scenic mountain pass hiking & trails" },
  { id: "relaxation", label: "Relaxation", emoji: "🧘", desc: "Slow paces & quiet mountain retreats" },
  { id: "culture", label: "Culture & Monasteries", emoji: "🏛️", desc: "Cham masked dances & ancient shrines" },
  { id: "food", label: "Local Food", emoji: "🍜", desc: "Authentic hot momos & Sikkimese dishes" },
  { id: "roadtrip", label: "Scenic Road Trips", emoji: "🚗", desc: "Winding hairpins & legendary silk routes" },
  { id: "offbeat", label: "Offbeat Places", emoji: "🌿", desc: "Rustic homestays & untouched villages" },
  { id: "honeymoon", label: "Honeymoon", emoji: "❤️", desc: "Romantic, scenic-filled getaways" },
  { id: "family", label: "Family Experience", emoji: "👨👩👧", desc: "Comfortable, safe, all-age sightseeing" }
];

export default function InterestSelector({ selectedInterests, onToggleInterest }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-ink mb-2">
          What kind of Sikkim experience do you want?
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Pick everything that excites you — we'll build your trip around your interests.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {INTEREST_OPTIONS.map((opt) => {
          const isSelected = selectedInterests.includes(opt.id);

          return (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggleInterest(opt.id)}
              className={`relative flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-cream border-gold ring-2 ring-gold/25 shadow-gold-glow"
                  : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
              }`}
            >
              <div className="text-3xl shrink-0 mt-0.5">{opt.emoji}</div>
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-display text-base text-ink font-semibold leading-snug">
                  {opt.label}
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-normal">
                  {opt.desc}
                </p>
              </div>

              {/* Selection Checkmark Bubble */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-5 h-5 rounded-full bg-gold text-pine flex items-center justify-center"
                >
                  <Check size={12} strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
