import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, RefreshCcw, ArrowRight, Star } from "lucide-react";

export default function BestTimeInsight({ travelIntelligence, state, onBookNow, onReset, onNext }) {
  if (!travelIntelligence) return null;

  const { mode, score, rating, reasons, considerations, seasonalHighlights, recommendedMonths, recommendedSeason, rankedOptions } = travelIntelligence;
  const { interests, duration, dates } = state;

  // Map interest IDs to human labels for visual tags
  const interestLabels = {
    mountains: "🏔️ Mountains",
    snow: "❄️ Snow",
    nature: "🌸 Nature & Flowers",
    photography: "📸 Photography",
    trekking: "🥾 Trekking",
    relaxation: "🧘 Relaxation",
    culture: "🏛️ Culture",
    food: "🍜 Local Food",
    roadtrip: "🚗 Road Trips",
    offbeat: "🌿 Offbeat",
    honeymoon: "❤️ Honeymoon",
    family: "👨‍👩‍👧 Family"
  };

  const getScoreColor = (s) => {
    if (s >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (s >= 75) return "text-gold-dark bg-gold/10 border-gold/20";
    return "text-amber-600 bg-amber-50 border-amber-250";
  };

  const handleInquire = () => {
    let subject = "";
    if (mode === "fixed") {
      subject = `AI Plan: Fixed Dates ${dates.start} to ${dates.end} (${duration} Days)`;
    } else {
      const monthsStr = recommendedMonths && recommendedMonths.length > 0 ? recommendedMonths.join("/") : "Flexible";
      subject = `AI Plan: Flexible ${duration} Days (Target: ${monthsStr})`;
    }
    onBookNow(subject);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-premium overflow-hidden">
        {/* Header Ribbon / Banner */}
        <div className="bg-pine py-6 px-6 sm:px-8 text-center relative border-b border-gold/10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold block mb-1">
            AI Travel Intelligence
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-parchment">
            {mode === "fixed" ? "Your Travel Timing Evaluation" : "Your Recommended Travel Window"}
          </h2>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Timing Match Panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 bg-cream border border-neutral-100 rounded-xl">
            <div className="text-left w-full sm:w-auto">
              <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-1 font-semibold">
                {mode === "fixed" ? "Selected Dates" : `Best Season: ${recommendedSeason}`}
              </span>
              <h3 className="font-display text-xl sm:text-2xl text-ink leading-tight">
                {mode === "fixed" ? (
                  <span className="font-sans font-semibold">
                    {new Date(dates.start).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}{" "}
                    –{" "}
                    {new Date(dates.end).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                ) : (
                  recommendedMonths.slice(0, 2).join(" – ")
                )}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Trip Duration: <span className="font-semibold text-ink">{duration} Days</span>
              </p>
            </div>

            <div className={`shrink-0 flex flex-col items-center justify-center border px-5 py-3 rounded-xl ${getScoreColor(score)}`}>
              <span className="text-3xl font-display font-bold leading-none">{score}%</span>
              <span className="text-[10px] uppercase tracking-widest font-bold mt-1.5 whitespace-nowrap">
                {rating || (mode === "fixed" ? "Match Score" : "Match Rating")}
              </span>
            </div>
          </div>

          {/* User Preferences tags */}
          <div className="text-left">
            <h4 className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-2.5">
              Matching Preferences
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 text-xs bg-neutral-100 border border-neutral-200/50 rounded-full font-sans text-neutral-600 font-medium"
                >
                  {interestLabels[interest] || interest}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-neutral-100" />

          {/* Why This Period / Highlights */}
          <div className="text-left space-y-4">
            <h4 className="font-display text-lg text-ink font-semibold flex items-center gap-1.5">
              <Star size={16} className="text-gold fill-gold/20" />
              Why this period fits?
            </h4>
            <ul className="space-y-2">
              {reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700 leading-normal">
                  <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
              {seasonalHighlights && seasonalHighlights.map((hl, idx) => (
                <li key={`hl-${idx}`} className="flex items-start gap-2.5 text-sm text-neutral-700 leading-normal">
                  <CheckCircle size={15} className="text-gold shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Flexible Options Sub-ranking */}
          {mode === "flexible" && rankedOptions && rankedOptions.length > 1 && (
            <div className="text-left bg-neutral-50 rounded-xl p-5 border border-neutral-150 space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                Alternative Recommendations
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {rankedOptions.slice(1, 3).map((opt, idx) => (
                  <div key={opt.name} className="bg-white border border-neutral-200 rounded-lg p-3 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase">
                      {idx === 0 ? "🥈 Second Choice" : "🥉 Third Choice"}
                    </span>
                    <span className="font-display text-base text-ink font-semibold mt-1">
                      {opt.name}
                    </span>
                    <span className="text-xs font-medium text-gold-dark mt-1">
                      {opt.score}% Match Score
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seasonal Considerations / Warnings Alert */}
          {considerations && considerations.length > 0 && (
            <div className="text-left bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 leading-tight">
                  Seasonal Consideration
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-amber-800 leading-relaxed mt-1.5">
                  {considerations.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button
              onClick={onNext}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-marigold text-pine font-semibold text-sm px-6 py-4 hover:bg-gold-light hover:shadow-gold-glow transition-all"
            >
              Continue Planning <ArrowRight size={15} />
            </button>
            <button
              onClick={handleInquire}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-neutral-250 text-neutral-600 font-semibold text-sm px-6 py-4 hover:bg-neutral-50 transition-all"
            >
              Quick Enquiry
            </button>
            <button
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 text-neutral-500 font-medium text-xs px-4 py-4 hover:bg-neutral-50 transition-all"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
