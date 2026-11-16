import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Droplet,
  HeartPulse
} from "lucide-react";
import { buildTripAltitudeProfile } from "../../services/safety/altitudeSafetyService";

export default function TripAltitudeOverview({ itinerary, className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const profile = useMemo(() => {
    return buildTripAltitudeProfile(itinerary);
  }, [itinerary]);

  if (!profile.isValid || profile.maxElevationM === 0) return null;

  return (
    <div className={`bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-premium space-y-4 ${className}`}>
      
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pine/10 text-pine flex items-center justify-center font-bold">
            <Mountain size={20} className="text-gold-dark" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-ink">
                Altitude & Acclimatization Profile
              </h3>
              {profile.hasVeryHighAltitude && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle size={10} /> Extreme Altitude
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Peak elevation: <strong className="text-pine">{profile.maxElevationM}m</strong> at {profile.highestDestination?.name} (Day {profile.highestDestination?.dayNumber})
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-pine hover:text-gold-dark transition"
        >
          {isExpanded ? (
            <>Hide Safety Details <ChevronUp size={14} /></>
          ) : (
            <>View Safety Details <ChevronDown size={14} /></>
          )}
        </button>
      </div>

      {/* DAY-BY-DAY ALTITUDE HISTOGRAM / PROGRESSION */}
      <div className="pt-2">
        <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2">
          Elevation by Trip Day (metres above sea level)
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {profile.dayProfiles.map((dp) => {
            const heightPercent = Math.min(100, Math.max(25, (dp.elevationM / 5500) * 100));
            const isPeak = dp.elevationM === profile.maxElevationM;

            return (
              <div
                key={dp.dayNumber}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isPeak
                    ? "bg-rose-50/80 border-rose-300 shadow-xs"
                    : dp.isHighAltitude
                    ? "bg-amber-50/60 border-amber-200"
                    : "bg-neutral-50 border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 mb-1">
                  <span>Day {dp.dayNumber}</span>
                  {isPeak && <span className="text-[9px] text-rose-600 uppercase font-black">Peak</span>}
                </div>

                <div className="space-y-1 my-1">
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dp.isExtremeAltitude ? "bg-rose-500" : dp.isHighAltitude ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="font-display font-bold text-xs text-ink block">
                    {dp.elevationM || "—"}m
                  </span>
                </div>

                <span className="text-[10px] text-neutral-500 truncate block mt-0.5" title={dp.peakLocationName}>
                  {dp.peakLocationName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* WARNINGS STRIP */}
      {profile.warnings.length > 0 && (
        <div className="space-y-2 pt-1">
          {profile.warnings.map((warn, i) => (
            <div
              key={i}
              className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900"
            >
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>{warn.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* EXPANDED ACCLIMATIZATION & MEDICAL GUIDANCE */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3 pt-3 border-t border-neutral-200 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="font-display font-bold text-xs text-ink flex items-center gap-1.5">
                  <Droplet size={14} className="text-teal-600" /> Acclimatization Guidelines
                </span>
                <ul className="space-y-1 text-neutral-600 text-[11px]">
                  <li>• Drink 3–4 litres of warm water/tea daily in high-altitude zones.</li>
                  <li>• Never climb directly from plains to &gt;3,000m without intermediate sleep stops.</li>
                  <li>• Limit exertion upon first reaching high passes (Yumthang, Nathula, Gurudongmar).</li>
                </ul>
              </div>

              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
                <span className="font-display font-bold text-xs text-ink flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-rose-600" /> Early AMS Warning Signs
                </span>
                <ul className="space-y-1 text-neutral-600 text-[11px]">
                  <li>• Throbbing headache, lightheadedness, nausea, or loss of appetite.</li>
                  <li>• <strong>Golden Rule:</strong> In case of worsening symptoms, immediate descent is the primary medical cure.</li>
                  <li>• Carry basic pain relief and consultation notes from your doctor.</li>
                </ul>
              </div>
            </div>

            <div className="bg-parchment/70 p-3 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-start gap-2">
              <Info size={13} className="text-gold-dark shrink-0 mt-0.5" />
              <span>{profile.medicalDisclaimer}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
