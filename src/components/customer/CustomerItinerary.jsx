import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mountain, ChevronDown, ChevronUp, Sun, Sunset, Moon, Sparkles } from "lucide-react";

export default function CustomerItinerary({ itinerary }) {
  const [expandedDay, setExpandedDay] = useState(1);
  const days = itinerary?.days || [];

  if (days.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-3">
        <Mountain className="w-10 h-10 mx-auto text-slate-600" />
        <p className="text-sm font-medium">Itinerary details are currently being customized for your trip.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Itinerary Roadmap</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">v{itinerary?.version || 1}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mt-1">
            {itinerary?.title || "Day-by-Day Journey"}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{days.length} Days Planned</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setExpandedDay(expandedDay === "all" ? 1 : "all")}
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 cursor-pointer"
          >
            {expandedDay === "all" ? "Collapse" : "Expand All"}
          </button>
        </div>
      </div>

      {/* Days Accordion List */}
      <div className="space-y-3">
        {days.map((day) => {
          const isOpen = expandedDay === "all" || expandedDay === day.dayNumber;

          return (
            <div
              key={day.dayNumber}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? "bg-slate-950/90 border-amber-500/30 shadow-lg shadow-black/40"
                  : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Day Header Button */}
              <button
                type="button"
                onClick={() => setExpandedDay(isOpen && expandedDay !== "all" ? null : day.dayNumber)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isOpen
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "bg-slate-900 border border-slate-800 text-amber-400"
                    }`}
                  >
                    Day {day.dayNumber}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                      {day.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span>{day.baseLocation}</span>
                      </span>
                      {day.elevation && (
                        <span className="flex items-center gap-1 text-amber-400/90">
                          <Mountain className="w-3 h-3" />
                          <span>{day.elevation}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Day Details Body */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/60"
                  >
                    {/* Highlights */}
                    {day.highlights && day.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {day.highlights.map((h, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium"
                          >
                            ✨ {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timeline Activities */}
                    {day.activities && day.activities.length > 0 ? (
                      <div className="space-y-2.5 pt-1">
                        {day.activities.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-start gap-3"
                          >
                            <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                              {act.time?.toLowerCase().includes("morning") ? (
                                <Sun className="w-3.5 h-3.5" />
                              ) : act.time?.toLowerCase().includes("afternoon") ? (
                                <Sunset className="w-3.5 h-3.5" />
                              ) : (
                                <Moon className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  {act.time}
                                </span>
                                <span className="text-xs font-semibold text-white">
                                  {act.title}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {act.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 leading-relaxed pt-2">
                        {day.description || "Detailed schedule arranged with private chauffeur."}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
