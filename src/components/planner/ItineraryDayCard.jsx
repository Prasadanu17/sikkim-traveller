import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Sunset, Moon, Car, Bed, AlertTriangle, Info, ChevronDown, ChevronUp, Clock, Edit3, ShieldAlert } from "lucide-react";
import AltitudeSafetyGauge from "./AltitudeSafetyGauge";
import { getDestinationGeoData } from "../../data/destinationCoordinates";

export default function ItineraryDayCard({ day, isDefaultExpanded = true, forceExpand = false, onEditDay, dayRealtimeAlerts = [] }) {
  const [internalExpanded, setInternalExpanded] = useState(isDefaultExpanded);
  const isExpanded = forceExpand || internalExpanded;

  const geoData = getDestinationGeoData(day.baseLocation);

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const hasRealtimeWarning = dayRealtimeAlerts.some((a) => a.severity === "HIGH" || a.severity === "NOTICE");

  return (
    <div className={`bg-white border rounded-2xl shadow-premium overflow-hidden transition-all hover:border-gold/30 ${
      hasRealtimeWarning ? "border-amber-300" : "border-neutral-200"
    }`}>

      {/* CARD HEADER */}
      <div className="p-5 sm:p-6 bg-white select-none flex items-center justify-between gap-4 border-b border-neutral-100">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setInternalExpanded(!isExpanded)}>
          <div className="w-12 h-12 rounded-xl bg-pine text-gold flex flex-col items-center justify-center font-display shrink-0 shadow-sm">
            <span className="text-[9px] uppercase font-bold tracking-widest text-gold/70 leading-none">DAY</span>
            <span className="text-xl font-bold leading-none mt-0.5">{day.dayNumber}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                📍 {day.baseLocation}
              </span>
              {geoData?.elevationM && (
                <AltitudeSafetyGauge
                  compact
                  elevationM={geoData.elevationM}
                  destinationName={day.baseLocation}
                  transitLeg={day.travel?.[0] || day.travelSegments?.[0]}
                />
              )}
              {day.date && (
                <span className="text-[10px] text-neutral-400 font-semibold">
                  {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
              {hasRealtimeWarning && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                  <ShieldAlert size={10} /> Live Alert
                </span>
              )}
            </div>
            <h3 className="font-display text-base sm:text-lg text-ink font-bold leading-tight">
              {day.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {day.estimatedCost && (
            <div className="hidden sm:block text-right mr-1">
              <span className="text-[10px] text-neutral-400 block uppercase font-bold tracking-wider">Est. Day Cost</span>
              <span className="text-xs font-semibold text-ink">
                {formatPrice(day.estimatedCost.min)} – {formatPrice(day.estimatedCost.max)}
              </span>
            </div>
          )}

          {/* EDIT DAY BUTTON */}
          {onEditDay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditDay(day);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-dark bg-gold/10 hover:bg-gold/20 px-2.5 py-1.5 rounded-lg border border-gold/30 transition print:hidden"
              title="Edit day pace & activities"
            >
              <Edit3 size={11} /> Edit
            </button>
          )}

          <button
            onClick={() => setInternalExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition"
            aria-label="Toggle day details"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* EXPANDABLE BODY */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-6 space-y-6 bg-cream/30"
          >
            {/* REAL-TIME DAY ALERTS */}
            {dayRealtimeAlerts && dayRealtimeAlerts.length > 0 && (
              <div className="space-y-2">
                {dayRealtimeAlerts.map((alert, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{alert.title}</span>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TRANSIT SEGMENT PILL */}
            {day.travel && day.travel.length > 0 && (
              <div className="space-y-2">
                {day.travel.map((tr, idx) => (
                  <div key={idx} className="bg-pine/5 border border-pine/15 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-pine">
                    <div className="flex items-center gap-2 font-semibold">
                      <Car size={15} className="text-gold-dark shrink-0" />
                      <span>Transit: {tr.from} → {tr.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-normal">
                      {tr.duration && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={12} /> {tr.duration}
                        </span>
                      )}
                      {tr.mode && <span className="bg-white px-2 py-0.5 rounded border border-neutral-200 font-semibold">{tr.mode}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TIMELINE ACTIVITIES */}
            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-neutral-200">

              {/* MORNING */}
              {day.morning && day.morning.length > 0 && (
                <div className="relative pl-9 space-y-2">
                  <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sun size={12} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 block">Morning</span>
                  {day.morning.map((act, idx) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-sm">
                      <h4 className="font-display text-sm font-semibold text-ink mb-1">{act.title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">{act.description}</p>
                      {act.duration && <span className="text-[10px] text-neutral-400 mt-2 block font-mono">⏱️ {act.duration}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* AFTERNOON */}
              {day.afternoon && day.afternoon.length > 0 && (
                <div className="relative pl-9 space-y-2">
                  <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                    <Sunset size={12} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-800 block">Afternoon</span>
                  {day.afternoon.map((act, idx) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-sm">
                      <h4 className="font-display text-sm font-semibold text-ink mb-1">{act.title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">{act.description}</p>
                      {act.duration && <span className="text-[10px] text-neutral-400 mt-2 block font-mono">⏱️ {act.duration}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* EVENING */}
              {day.evening && day.evening.length > 0 && (
                <div className="relative pl-9 space-y-2">
                  <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Moon size={12} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-800 block">Evening</span>
                  {day.evening.map((act, idx) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-sm">
                      <h4 className="font-display text-sm font-semibold text-ink mb-1">{act.title}</h4>
                      <p className="text-xs text-neutral-600 leading-relaxed">{act.description}</p>
                      {act.duration && <span className="text-[10px] text-neutral-400 mt-2 block font-mono">⏱️ {act.duration}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OVERNIGHT BADGE */}
            {day.overnight && (
              <div className="bg-gold/10 border border-gold/25 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bed size={15} className="text-gold-dark shrink-0" />
                  <span className="font-semibold text-ink">Overnight in {day.overnight.location}</span>
                </div>
                <span className="text-neutral-500 font-medium">{day.overnight.accommodationType}</span>
              </div>
            )}

            {/* NOTES & WARNINGS */}
            {((day.notes && day.notes.length > 0) || (day.warnings && day.warnings.length > 0)) && (
              <div className="space-y-2 pt-2">
                {day.notes?.map((note, i) => (
                  <div key={i} className="bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 flex items-start gap-2 text-xs text-neutral-600">
                    <Info size={14} className="text-gold-dark shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
                {day.warnings?.map((warn, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-xs text-amber-800">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
