import { motion } from "framer-motion";
import { Calendar, Clock, Heart, Sparkles, Map, Users, Wallet, Bed, Car, CheckSquare } from "lucide-react";

const STEPS = [
  { label: "Timing",       icon: Calendar,    subtitle: "When are you visiting?" },
  { label: "Duration",     icon: Clock,       subtitle: "How many days?" },
  { label: "Interests",    icon: Heart,       subtitle: "What do you love?" },
  { label: "Insights",     icon: Sparkles,    subtitle: "Season & weather" },
  { label: "Destinations", icon: Map,         subtitle: "Where to go" },
  { label: "Travelers",    icon: Users,       subtitle: "Who is joining?" },
  { label: "Budget",       icon: Wallet,      subtitle: "Trip style" },
  { label: "Stay",         icon: Bed,         subtitle: "Lodging preferences" },
  { label: "Transport",    icon: Car,         subtitle: "Travel mode" },
  { label: "Summary",      icon: CheckSquare, subtitle: "Review & Itinerary" }
];

function getDisplayIndex(step) {
  const map = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 9: 7, 10: 8, 11: 9, 12: 9 };
  return map[step] ?? 0;
}

export default function PlannerProgress({ currentStep }) {
  const activeIndex = getDisplayIndex(currentStep);
  const currentInfo = STEPS[activeIndex] || STEPS[0];
  const percent = Math.min(100, Math.round(((activeIndex + 1) / STEPS.length) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4 print:hidden">
      {/* Mobile & Tablet Compact Bar */}
      <div className="flex sm:hidden flex-col gap-2 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-neutral-200/70 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-marigold/20 text-marigold-dark text-[10px] font-bold flex items-center justify-center">
              {activeIndex + 1}
            </span>
            {currentInfo.label}
          </span>
          <span className="font-mono text-neutral-400 text-[11px]">
            {activeIndex + 1} / {STEPS.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-marigold to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Desktop Step Flow */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-[9px] h-[2px] bg-neutral-200 z-0" />
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-[9px] h-[2px] bg-gradient-to-r from-marigold to-amber-400 z-0"
            initial={{ width: "0%" }}
            animate={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.12 : 1,
                    backgroundColor: isActive
                      ? "#1A2E26"
                      : isCompleted
                      ? "#E2952E"
                      : "#FFFFFF",
                    borderColor: isActive ? "#E2952E" : isCompleted ? "#E2952E" : "#E5E7EB",
                    color: isActive ? "#FDFBF7" : isCompleted ? "#FFFFFF" : "#9CA3AF"
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm"
                >
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span
                  className={`mt-1.5 text-[10px] font-sans tracking-tight uppercase font-semibold text-center leading-tight max-w-[56px] ${
                    isActive ? "text-pine font-bold" : isCompleted ? "text-marigold-dark" : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

