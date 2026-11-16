import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  AlertTriangle,
  ShieldAlert,
  Info,
  HeartPulse,
  Droplet,
  Clock,
  Car
} from "lucide-react";
import { getAltitudeCategory } from "../../services/safety/altitudeSafetyService";

/**
 * Reusable Altitude and Transit Safety Indicator.
 * Can be rendered in compact mode (day card tag) or full summary mode (trip overview panel).
 */
export default function AltitudeSafetyGauge({
  elevationM,
  destinationName,
  transitLeg = null,
  compact = false,
  className = ""
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const elev = Number(elevationM);
  const category = getAltitudeCategory(elev);

  if (!category && !transitLeg) return null;

  // COMPACT MODE: For Day Cards and List Items
  if (compact) {
    return (
      <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
        {category && (
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition hover:opacity-90 ${category.badgeClass}`}
              title={`${destinationName || "Destination"} Elevation: ${elev}m (${category.label})`}
            >
              <Mountain size={11} />
              <span>{elev}m</span>
              <span className="font-normal opacity-80 hidden sm:inline">({category.label})</span>
              {category.key === "VERY_HIGH" && (
                <AlertTriangle size={11} className="text-rose-600 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Compact Tooltip / Drawer */}
            <AnimatePresence>
              {isDetailsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 bottom-full mb-2 w-72 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-xl p-3 shadow-2xl z-30 text-left text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-ink flex items-center gap-1">
                      <Mountain size={13} className="text-gold-dark" />
                      {destinationName || "Location"} • {elev}m
                    </span>
                    <button
                      onClick={() => setIsDetailsOpen(false)}
                      className="text-neutral-400 hover:text-neutral-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${category.badgeClass}`}>
                    {category.label}
                  </span>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    {category.guidance}
                  </p>
                  <div className="pt-1 border-t border-neutral-150 text-[10px] text-neutral-400 flex items-center gap-1">
                    <Info size={11} /> Altitude alone does not determine medical safety. Follow local advisories.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Transit Badge */}
        {transitLeg && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            <Car size={11} className="text-neutral-500" />
            <Clock size={11} className="text-gold-dark" />
            <span>{transitLeg.duration || transitLeg.hours}</span>
          </span>
        )}
      </div>
    );
  }

  // FULL SUMMARY CARD MODE
  return (
    <div className={`bg-white border border-neutral-200 rounded-2xl p-5 shadow-premium space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
            category.key === "VERY_HIGH" ? "bg-rose-500/20 text-rose-700" :
            category.key === "HIGH" ? "bg-amber-500/20 text-amber-700" : "bg-teal-500/20 text-teal-700"
          }`}>
            <Mountain size={18} />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-ink flex items-center gap-2">
              {destinationName || "Elevation Guide"}
              <span className="text-xs font-semibold text-neutral-500">({elev}m)</span>
            </h4>
            <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold border mt-0.5 ${category.badgeClass}`}>
              {category.label}
            </span>
          </div>
        </div>

        {category.key === "VERY_HIGH" && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <ShieldAlert size={13} /> High Altitude Advisory
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-600 leading-relaxed">
        {category.guidance}
      </p>

      {/* High Altitude Action Guidelines */}
      {elev > 2400 && (
        <div className="bg-neutral-50 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-700 border border-neutral-200">
          <div className="flex items-start gap-1.5">
            <Droplet size={13} className="text-teal-600 shrink-0 mt-0.5" />
            <span>Hydrate frequently with water and warm soups; avoid heavy alcohol intake.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <HeartPulse size={13} className="text-rose-600 shrink-0 mt-0.5" />
            <span>Descend immediately if experiencing persistent headache, dizziness, or vomiting.</span>
          </div>
        </div>
      )}

      {/* Transit Information */}
      {transitLeg && (
        <div className="pt-2 border-t border-neutral-150 flex items-center justify-between text-xs text-neutral-600">
          <span className="flex items-center gap-1.5 font-medium">
            <Car size={13} className="text-gold-dark" />
            Transit: {transitLeg.from} → {transitLeg.to}
          </span>
          <span className="font-bold text-pine flex items-center gap-1">
            <Clock size={12} className="text-gold-dark" />
            {transitLeg.duration || transitLeg.hours} ({transitLeg.mode || "SUV"})
          </span>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="pt-2 border-t border-neutral-150 flex items-start gap-1.5 text-[10px] text-neutral-400">
        <Info size={12} className="shrink-0 mt-0.5 text-neutral-400" />
        <span>
          Elevation alone does not determine medical safety. Road transit times are estimates based on standard mountain speeds. Follow local police/administration guidelines.
        </span>
      </div>
    </div>
  );
}
