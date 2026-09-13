import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trash2, Sliders, Sparkles } from "lucide-react";

const FOCUS_TAGS = [
  { id: "photography", label: "📸 Photography" },
  { id: "nature",      label: "🌿 Nature & Lakes" },
  { id: "culture",     label: "🏛️ Culture & Monasteries" },
  { id: "food",        label: "🍜 Local Food" },
  { id: "adventure",   label: "🧗 Adventure" },
  { id: "relaxation",  label: "🧘 Rest & Free Time" }
];

export default function DayEditModal({ isOpen, day, onClose, onUpdateDay }) {
  const [pace, setPace] = useState("balanced");
  const [selectedFocus, setSelectedFocus] = useState([]);
  const [removedMorning, setRemovedMorning] = useState([]);
  const [removedAfternoon, setRemovedAfternoon] = useState([]);
  const [removedEvening, setRemovedEvening] = useState([]);

  if (!isOpen || !day) return null;

  const toggleFocus = (id) => {
    setSelectedFocus((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onUpdateDay(day.dayNumber, {
      pace,
      focus: selectedFocus,
      removedMorning,
      removedAfternoon,
      removedEvening
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
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-left border border-gold/30 relative max-h-[90vh] flex flex-col"
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-ink transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          {/* HEADER */}
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
              Edit Day {day.dayNumber} • {day.baseLocation}
            </span>
            <h3 className="font-display text-xl text-ink font-semibold mt-1">
              {day.title}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-1">

            {/* DAY PACE SELECTOR */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                Day Pace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["relaxed", "balanced", "packed"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPace(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition ${
                      pace === p
                        ? "bg-pine text-parchment border-pine"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* FOCUS TAGS */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                Day Focus & Experiences
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_TAGS.map((ft) => {
                  const isSelected = selectedFocus.includes(ft.id);
                  return (
                    <button
                      key={ft.id}
                      type="button"
                      onClick={() => toggleFocus(ft.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                        isSelected
                          ? "bg-gold/20 text-gold-dark border-gold/40 font-semibold"
                          : "bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      {isSelected ? "✓ " : ""}{ft.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* REMOVE ACTIVITIES LIST */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                Manage Day Activities
              </label>

              {/* MORNING */}
              {day.morning?.map((act, idx) => (
                <div
                  key={`m-${idx}`}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    removedMorning.includes(idx) ? "bg-rose-50 border-rose-200 line-through text-neutral-400" : "bg-neutral-50 border-neutral-200 text-ink"
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase text-amber-700 block">Morning</span>
                    <span className="font-semibold">{act.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRemovedMorning((prev) =>
                        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                      )
                    }
                    className="text-neutral-400 hover:text-rose-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* AFTERNOON */}
              {day.afternoon?.map((act, idx) => (
                <div
                  key={`a-${idx}`}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    removedAfternoon.includes(idx) ? "bg-rose-50 border-rose-200 line-through text-neutral-400" : "bg-neutral-50 border-neutral-200 text-ink"
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase text-orange-700 block">Afternoon</span>
                    <span className="font-semibold">{act.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRemovedAfternoon((prev) =>
                        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                      )
                    }
                    className="text-neutral-400 hover:text-rose-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* EVENING */}
              {day.evening?.map((act, idx) => (
                <div
                  key={`e-${idx}`}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                    removedEvening.includes(idx) ? "bg-rose-50 border-rose-200 line-through text-neutral-400" : "bg-neutral-50 border-neutral-200 text-ink"
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase text-indigo-700 block">Evening</span>
                    <span className="font-semibold">{act.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRemovedEvening((prev) =>
                        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                      )
                    }
                    className="text-neutral-400 hover:text-rose-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-neutral-500 hover:text-ink px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-full bg-pine text-parchment font-semibold text-xs px-6 py-2.5 hover:bg-gold hover:text-pine transition shadow-premium"
            >
              Save Day Changes <Check size={14} />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
