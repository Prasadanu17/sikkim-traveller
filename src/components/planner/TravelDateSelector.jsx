import { motion } from "framer-motion";
import { Calendar, RefreshCw, AlertCircle } from "lucide-react";

export default function TravelDateSelector({ dates, onChangeDates, setDuration }) {
  const { mode, start, end } = dates;

  const handleModeChange = (selectedMode) => {
    onChangeDates({ mode: selectedMode });
  };

  const handleDateChange = (key, value) => {
    const newDates = { ...dates, [key]: value };
    onChangeDates(newDates);

    // If both dates are valid, automatically calculate and update duration
    if (newDates.start && newDates.end) {
      const startDate = new Date(newDates.start);
      const endDate = new Date(newDates.end);
      if (startDate && endDate && endDate >= startDate) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start day
        if (diffDays > 0 && diffDays <= 90) {
          setDuration(diffDays);
        }
      }
    }
  };

  // Validation feedback
  const getValidationWarning = () => {
    if (mode === "flexible") return null;
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return "Start date cannot be in the past.";
    }
    if (endDate < startDate) {
      return "End date must be on or after the start date.";
    }

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 90) {
      return "Maximum trip duration supported is 90 days. For longer trips, please contact us directly.";
    }

    return null;
  };

  const warning = getValidationWarning();

  // Helper to calculate display duration
  const getDurationString = () => {
    if (!start || !end || warning) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const nights = diffDays - 1;

    return `${diffDays} Day${diffDays > 1 ? "s" : ""} / ${nights} Night${nights > 1 ? "s" : ""}`;
  };

  const durationStr = getDurationString();

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-ink mb-2">
          When are you thinking of visiting?
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Pick your travel dates, or stay flexible and we'll recommend the best time for your kind of trip.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeChange("fixed")}
          className={`flex flex-col items-center p-6 rounded-xl border text-center transition-all ${
            mode === "fixed"
              ? "bg-cream border-gold ring-2 ring-gold/25 shadow-gold-glow"
              : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
              mode === "fixed" ? "bg-gold text-pine" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            <Calendar size={20} />
          </div>
          <span className="font-display text-base text-ink mb-1">I know my dates</span>
          <span className="text-xs text-neutral-400">Select specific travel dates</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleModeChange("flexible")}
          className={`flex flex-col items-center p-6 rounded-xl border text-center transition-all ${
            mode === "flexible"
              ? "bg-cream border-gold ring-2 ring-gold/25 shadow-gold-glow"
              : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
              mode === "flexible" ? "bg-gold text-pine" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            <RefreshCw size={20} />
          </div>
          <span className="font-display text-base text-ink mb-1">I'm flexible</span>
          <span className="text-xs text-neutral-400">Let AI recommend the best window</span>
        </motion.button>
      </div>

      {/* Input Fields Content */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-150 shadow-premium min-h-[160px] flex flex-col justify-center">
        {mode === "fixed" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Start Date
                </label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-lg border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all font-sans text-ink"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  End Date
                </label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  min={start || new Date().toISOString().split("T")[0]}
                  className="rounded-lg border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all font-sans text-ink"
                />
              </div>
            </div>

            {/* Live feedback */}
            {warning ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-150">
                <AlertCircle size={14} className="shrink-0" />
                <span>{warning}</span>
              </div>
            ) : durationStr ? (
              <div className="text-center pt-2">
                <span className="inline-block text-xs uppercase tracking-widest bg-gold/10 text-gold-dark font-bold px-3 py-1 rounded-full">
                  Trip Duration: {durationStr}
                </span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="inline-block px-3 py-1 text-xs font-sans tracking-widest text-gold-dark uppercase bg-gold/10 rounded-full mb-3">
              Flexible Plan Selected
            </span>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
              "Great! Tell us what you want to experience and we'll recommend a suitable travel window based on season, route, and interests."
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
