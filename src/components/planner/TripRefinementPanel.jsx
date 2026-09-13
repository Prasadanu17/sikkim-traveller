import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, RotateCcw, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

const QUICK_CHIPS = [
  { id: "more_relaxed",     label: "🌿 More Relaxed",     mode: "more_relaxed" },
  { id: "more_sightseeing", label: "🏔️ More Sightseeing", mode: "more_sightseeing" },
  { id: "more_photography", label: "📸 More Photography", mode: "more_photography" },
  { id: "lower_budget",     label: "💰 Lower Budget",     mode: "lower_budget" },
  { id: "more_premium",     label: "💎 More Premium",     mode: "more_premium" },
  { id: "fewer_drives",     label: "🚗 Fewer Long Drives", mode: "fewer_drives" },
  { id: "family_friendly",  label: "👨‍👩‍👧 Family Friendly", mode: "family_friendly" },
  { id: "more_culture",     label: "🏛️ More Culture",     mode: "more_culture" },
  { id: "more_food",        label: "🍜 Local Food",       mode: "more_food" },
  { id: "free_time",        label: "🧘 Free Time",        mode: "free_time" }
];

export default function TripRefinementPanel({
  onRefine,
  isRefining = false,
  explanation = null,
  tradeoffNotice = null,
  onResolveTradeoff = null
}) {
  const [inputText, setInputText] = useState("");
  const [selectedChip, setSelectedChip] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedChip) return;

    onRefine({
      instruction: inputText.trim(),
      mode: selectedChip
    });

    setInputText("");
    setSelectedChip(null);
  };

  const handleChipClick = (chip) => {
    const isSelected = selectedChip === chip.mode;
    const newChip = isSelected ? null : chip.mode;
    setSelectedChip(newChip);

    onRefine({
      instruction: inputText.trim(),
      mode: newChip
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-premium space-y-6 text-left">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-dark bg-gold/10 px-2.5 py-0.5 rounded inline-block mb-1">
            Smart AI Refinement
          </span>
          <h3 className="font-display text-lg sm:text-xl text-ink font-bold">
            Refine Your Sikkim Trip
          </h3>
        </div>
        <Sparkles size={20} className="text-gold-dark" />
      </div>

      {/* AI EXPLANATION BANNER */}
      {explanation && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 block">
              Trip Updated
            </span>
            <p className="text-xs text-emerald-900 leading-relaxed font-medium mt-0.5">{explanation}</p>
          </div>
        </motion.div>
      )}

      {/* TRADEOFF NOTICE ALERT BOX */}
      {tradeoffNotice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{tradeoffNotice.title || "Route Tradeoff Notice"}</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">{tradeoffNotice.message}</p>
          {tradeoffNotice.alternatives && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tradeoffNotice.alternatives.map((alt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onResolveTradeoff && onResolveTradeoff(alt)}
                  className="px-3 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition"
                >
                  {alt.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* NATURAL LANGUAGE FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block mb-1.5">
            What would you like to change?
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Make Day 3 more relaxed, remove long drives, or make it cheaper..."
              className="w-full text-xs p-3.5 pr-12 rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-gold bg-cream/30 text-ink shadow-inner"
              disabled={isRefining}
            />
            <button
              type="submit"
              disabled={isRefining || (!inputText.trim() && !selectedChip)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition ${
                inputText.trim() || selectedChip
                  ? "bg-pine text-gold hover:bg-gold hover:text-pine shadow"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <Send size={13} />
            </button>
          </div>
        </div>

        {/* QUICK SUGGESTION CHIPS */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block mb-2">
            Quick Refinement Suggestions
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => {
              const isSelected = selectedChip === chip.mode;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={isRefining}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                    isSelected
                      ? "bg-gold/20 text-gold-dark border-gold/50 shadow-sm"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
