import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Lock, ArrowLeft } from "lucide-react";

const PRESETS = [
  { label: "2 Days", value: 2 },
  { label: "3 Days", value: 3 },
  { label: "4 Days", value: 4 },
  { label: "5 Days", value: 5 },
  { label: "6 Days", value: 6 },
  { label: "7 Days", value: 7 },
  { label: "8-10 Days", value: 9 },
  { label: "10+ Days", value: 12 }
];

export default function TripDurationSelector({ duration, setDuration, isFixedDates }) {
  const [isCustom, setIsCustom] = useState(false);
  const [customVal, setCustomVal] = useState("");

  // Determine initial state based on duration and presets
  useEffect(() => {
    if (isFixedDates) return;
    const isPreset = PRESETS.some((p) => p.value === duration);
    if (!isPreset && duration > 0) {
      setIsCustom(true);
      setCustomVal(duration.toString());
    } else {
      setIsCustom(false);
    }
  }, [duration, isFixedDates]);

  const handleSelectPreset = (val) => {
    if (isFixedDates) return;
    setIsCustom(false);
    setDuration(val);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    // Allow numbers only
    if (/^\d*$/.test(val)) {
      setCustomVal(val);
      const num = parseInt(val, 10);
      if (num > 0 && num <= 90) {
        setDuration(num);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-ink mb-2">
          How long would you like to stay?
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Longer trips let you explore more of Sikkim at a comfortable pace.
        </p>
      </div>

      {isFixedDates ? (
        /* Read Only Mode for Fixed Dates */
        <div className="bg-cream border border-gold rounded-xl p-8 text-center shadow-gold-glow flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gold text-pine flex items-center justify-center mb-4">
            <Lock size={20} />
          </div>
          <span className="text-xs uppercase tracking-widest text-gold-dark font-bold mb-1">
            Calculated Duration
          </span>
          <h3 className="font-display text-3xl text-ink mb-2">{duration} Days</h3>
          <p className="text-sm text-neutral-500 max-w-sm">
            This duration is locked to your selected travel dates. Go back to the previous step if you need to adjust your dates.
          </p>
        </div>
      ) : (
        /* Duration Selection Grid for Flexible Dates */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESETS.map((preset) => {
              const isSelected = !isCustom && duration === preset.value;
              return (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectPreset(preset.value)}
                  className={`py-4 px-3 rounded-lg border font-sans text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-cream border-gold ring-2 ring-gold/20 text-gold-dark"
                      : "bg-white border-neutral-200 hover:border-neutral-300 text-ink shadow-premium"
                  }`}
                >
                  {preset.label}
                </motion.button>
              );
            })}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsCustom(true);
                // Pre-fill custom if existing duration is custom
                const presetValues = PRESETS.map((p) => p.value);
                if (!presetValues.includes(duration)) {
                  setCustomVal(duration.toString());
                } else {
                  setCustomVal("");
                }
              }}
              className={`py-4 px-3 rounded-lg border font-sans text-sm font-semibold transition-all ${
                isCustom
                  ? "bg-cream border-gold ring-2 ring-gold/20 text-gold-dark"
                  : "bg-white border-neutral-200 hover:border-neutral-300 text-ink shadow-premium"
              }`}
            >
              Custom
            </motion.button>
          </div>

          {/* Custom Duration Input */}
          {isCustom && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="flex flex-col gap-1 text-left w-full sm:flex-1">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Enter Duration (Days)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customVal}
                    onChange={handleCustomChange}
                    placeholder="e.g. 10"
                    className="w-full rounded-lg border border-neutral-250 bg-white px-3.5 py-2.5 pl-10 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all font-sans text-ink"
                  />
                  <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>
              <div className="text-xs text-neutral-400 text-left sm:w-48 leading-relaxed">
                Min: 1 day, Max: 90 days. Most Sikkim road itineraries are between 4 and 10 days.
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
