import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Map, Compass, Bed, Wallet, CheckCircle2 } from "lucide-react";

const STAGES = [
  { label: "Finding optimal Himalayan scenic routes...", icon: Compass },
  { label: "Checking mountain pass seasonality & weather...", icon: Map },
  { label: "Curating authentic stays & mountain lodges...", icon: Bed },
  { label: "Balancing daily sightseeing and travel pace...", icon: Sparkles },
  { label: "Finalizing your personalized Sikkim journey...", icon: Wallet }
];

export default function ItineraryLoading() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(timer);
  }, []);

  const ActiveIcon = STAGES[activeStage].icon;

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      {/* Animated Spinner Icon */}
      <div className="relative flex items-center justify-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full border-2 border-gold/30 border-t-gold flex items-center justify-center shadow-gold-glow bg-white"
        >
          <ActiveIcon size={30} className="text-gold-dark" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute w-24 h-24 bg-gold/20 rounded-full -z-10"
        />
      </div>

      <h3 className="font-display text-2xl text-ink font-semibold mb-2">
        Planning Your Sikkim Journey...
      </h3>
      <p className="text-xs text-neutral-500 max-w-xs mb-8">
        Our AI is tailoring a personalized Himalayan travel plan based on your dates, pace, and interests.
      </p>

      {/* STAGE LIST */}
      <div className="w-full bg-white border border-neutral-200 rounded-2xl p-5 shadow-premium space-y-3.5 text-left">
        {STAGES.map((st, idx) => {
          const isDone = idx < activeStage;
          const isCurrent = idx === activeStage;
          const Icon = st.icon;

          return (
            <div key={st.label} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                  isDone
                    ? "bg-emerald-100 text-emerald-700"
                    : isCurrent
                    ? "bg-gold text-pine animate-pulse"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {isDone ? <CheckCircle2 size={14} /> : <Icon size={12} />}
              </div>
              <span
                className={`text-xs transition-colors ${
                  isDone
                    ? "text-neutral-700 font-medium"
                    : isCurrent
                    ? "text-ink font-bold"
                    : "text-neutral-400"
                }`}
              >
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

