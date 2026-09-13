import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Heart, Baby, Check, AlertCircle, Plus, Minus } from "lucide-react";

const TYPES = [
  { id: "solo", label: "Solo", emoji: "🧍", desc: "Traveling alone" },
  { id: "couple", label: "Couple", emoji: "❤️", desc: "Two travelers (partners/friends)" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", desc: "Traveling with kids or seniors" },
  { id: "friends", label: "Friends", emoji: "👥", desc: "Small group of friends" },
  { id: "group", label: "Group", emoji: "👨‍👩‍👧‍👦", desc: "Large tour group" }
];

const PACES = [
  { id: "relaxed", label: "Relaxed 🌿", desc: "Fewer places, more time to enjoy each one." },
  { id: "balanced", label: "Balanced ⚖️", desc: "A mix of sightseeing and relaxation." },
  { id: "packed", label: "Packed 🚀", desc: "See as much as possible." }
];

const AGE_GROUPS = [
  { id: "0-5", label: "Toddlers (0–5 years)" },
  { id: "6-12", label: "Kids (6–12 years)" },
  { id: "13-17", label: "Teens (13–17 years)" }
];

export default function TravelerSelector({ travelers, travelStyle, onChangeTravelers, onChangeStyle }) {
  const { type, adults, children, seniors, childrenAgeGroups } = travelers;

  const handleSelectType = (selectedType) => {
    const data = { type: selectedType };
    if (selectedType === "solo") {
      data.adults = 1;
      data.children = 0;
      data.seniors = 0;
    } else if (selectedType === "couple") {
      data.adults = 2;
      data.children = 0;
      data.seniors = 0;
    } else if (selectedType === "family") {
      data.adults = 2;
      data.children = 0;
      data.seniors = 0;
    } else {
      data.adults = 4;
      data.children = 0;
      data.seniors = 0;
    }
    onChangeTravelers(data);
  };

  const adjustCount = (key, delta) => {
    const minVal = key === "adults" ? 1 : 0;
    const currentVal = parseInt(travelers[key], 10) || 0;
    const newVal = Math.max(minVal, Math.min(50, currentVal + delta));
    onChangeTravelers({ [key]: newVal });
  };

  const toggleAgeGroup = (groupId) => {
    const updatedGroups = childrenAgeGroups.includes(groupId)
      ? childrenAgeGroups.filter((g) => g !== groupId)
      : [...childrenAgeGroups, groupId];
    onChangeTravelers({ childrenAgeGroups: updatedGroups });
  };

  // Group warnings check
  const showPaceWarning = (seniors > 0 || children > 0) && travelStyle === "packed";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 text-left">
      {/* SECTION 1: WHO'S TRAVELING */}
      <div>
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1">
            Who's travelling with you?
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            This helps us find the right stays and vehicles for your group.
          </p>
        </div>

        {/* Traveler Type Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {TYPES.map((t) => {
            const isSelected = type === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectType(t.id)}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? "bg-cream border-gold ring-2 ring-gold/25 shadow-gold-glow"
                    : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
                }`}
              >
                <span className="text-3xl mb-2">{t.emoji}</span>
                <span className="font-display text-sm font-semibold text-ink">{t.label}</span>
                <span className="text-[10px] text-neutral-400 mt-1 leading-normal line-clamp-1">{t.desc}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Count Adjusters based on Type */}
        <AnimatePresence mode="wait">
          {type && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-neutral-200 rounded-xl p-5 shadow-premium overflow-hidden space-y-4"
            >
              {type === "solo" && (
                <div className="text-center py-2 text-sm text-neutral-600 font-medium">
                  🧍 Planning a solo Himalayan adventure. Total travelers: 1
                </div>
              )}

              {type === "couple" && (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-ink text-sm">Number of Travelers</h4>
                    <p className="text-xs text-neutral-400">Default is 2 adults</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustCount("adults", -1)}
                      disabled={adults <= 1}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold font-mono">{adults}</span>
                    <button
                      onClick={() => adjustCount("adults", 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {type === "family" && (
                <div className="space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-ink text-sm">Adults</h4>
                      <p className="text-xs text-neutral-400">Age 18+</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => adjustCount("adults", -1)}
                        disabled={adults <= 1}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold font-mono">{adults}</span>
                      <button
                        onClick={() => adjustCount("adults", 1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Seniors */}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                    <div>
                      <h4 className="font-semibold text-ink text-sm">Seniors</h4>
                      <p className="text-xs text-neutral-400">Age 60+</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => adjustCount("seniors", -1)}
                        disabled={seniors <= 0}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold font-mono">{seniors}</span>
                      <button
                        onClick={() => adjustCount("seniors", 1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                    <div>
                      <h4 className="font-semibold text-ink text-sm">Children</h4>
                      <p className="text-xs text-neutral-400">Age 0–17</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => adjustCount("children", -1)}
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold font-mono">{children}</span>
                      <button
                        onClick={() => adjustCount("children", 1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Children age checkmarks */}
                  {children > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-neutral-50 p-4 rounded-lg border border-neutral-150 space-y-2 mt-2"
                    >
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block">
                        Select children age groups (for activity recommendations):
                      </span>
                      <div className="flex flex-col gap-2">
                        {AGE_GROUPS.map((group) => {
                          const isChecked = childrenAgeGroups.includes(group.id);
                          return (
                            <label key={group.id} className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleAgeGroup(group.id)}
                                className="rounded border-neutral-300 text-gold focus:ring-gold"
                              />
                              <span>{group.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {(type === "friends" || type === "group") && (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-ink text-sm">Total Travelers</h4>
                    <p className="text-xs text-neutral-400">
                      {type === "friends" ? "Friends group composition" : "Organized tour group"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustCount("adults", -1)}
                      disabled={adults <= 1}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50 disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold font-mono">{adults}</span>
                    <button
                      onClick={() => adjustCount("adults", 1)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-neutral-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 2: TRAVEL PACE */}
      <div className="border-t border-neutral-100 pt-8">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1">
            How do you like to travel?
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Travel style determines pace, daily transfer hours, and overall scheduling density.
          </p>
        </div>

        {/* Travel Pace choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PACES.map((p) => {
            const isSelected = travelStyle === p.id;
            return (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChangeStyle(p.id)}
                className={`p-5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-cream border-gold ring-2 ring-gold/25 shadow-gold-glow"
                    : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-base font-bold text-ink">{p.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-gold text-pine flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-400 leading-normal">{p.desc}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Seniors/Children Packed Warning Notice */}
        <AnimatePresence>
          {showPaceWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"
            >
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Travel Pace Notice
                </h5>
                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                  Your travel group includes young children or seniors, which might make a packed travel pace tiring. We recommend choosing a relaxed or balanced pace for comfortable mountain road transfers.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
