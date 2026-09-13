import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, RotateCcw } from "lucide-react";

const PRESETS = [
  { id: "more_relaxed",      label: "More Relaxed 🌿",      desc: "Fewer activities, more rest and free time" },
  { id: "more_sightseeing",  label: "More Sightseeing 🏔️",  desc: "Pack in more highlights and viewpoints" },
  { id: "more_photography",  label: "More Photography 📸",  desc: "Prioritize sunrise, lakes, and scenic vistas" },
  { id: "lower_budget",      label: "Lower Budget 💰",      desc: "Optimize for cost efficiency and shared options" },
  { id: "more_premium",      label: "More Premium 💎",      desc: "Focus on top comfort stays and private transit" },
  { id: "fewer_drives",      label: "Fewer Long Drives 🚗",  desc: "Reduce transit hours and inter-city travel" },
  { id: "family_friendly",   label: "Family Friendly 👨‍👩‍👧", desc: "Easier pace, frequent breaks, kid-safe stops" }
];

export default function RegenerationModal({ isOpen, onClose, onRegenerate }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customInstruction, setCustomInstruction] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegenerate({
      mode: selectedPreset,
      instruction: customInstruction.trim()
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-left border border-gold/30 relative"
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-ink transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* HEADER */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-gold-dark" />
            <h3 className="font-display text-xl text-ink font-semibold">
              Regenerate Your Itinerary
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mb-6">
            How would you like to adjust your trip? Select a preference or type custom instructions below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* PRESETS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {PRESETS.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPreset(isSelected ? null : p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-cream border-gold ring-2 ring-gold/20 shadow-gold-glow"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <span className="font-display text-xs font-bold text-ink block mb-0.5">{p.label}</span>
                    <span className="text-[10px] text-neutral-400 leading-tight block">{p.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* CUSTOM INSTRUCTION TEXTAREA */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block mb-1.5">
                Custom Instruction (Optional)
              </label>
              <textarea
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Give me more photography time around Gangtok and MG Marg..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-gold bg-neutral-50"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-neutral-500 hover:text-ink px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-pine text-parchment font-semibold text-xs px-6 py-2.5 hover:bg-gold hover:text-pine transition shadow-premium"
              >
                Regenerate Now <RotateCcw size={13} />
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
