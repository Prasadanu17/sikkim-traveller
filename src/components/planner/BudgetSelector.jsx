import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, DollarSign, AlertTriangle, Check, CheckCircle2, ChevronRight } from "lucide-react";

const BUDGET_TIERS = [
  { id: "budget", label: "Budget 💰", desc: "Basic guest rooms, shared travel, local dinings." },
  { id: "comfortable", label: "Comfortable ✨", desc: "Cozy 3-star stays, private SUV transport, cafe meals." },
  { id: "premium", label: "Premium 💎", desc: "Boutique rooms, private Innovas, guided trails." },
  { id: "luxury", label: "Luxury 👑", desc: "Heritage resort stays, luxury private SUVs, fine dining." }
];

const BUDGET_RANGES = [
  { label: "Under ₹20,000", min: 0, max: 20000 },
  { label: "₹20,000 – ₹30,000", min: 20000, max: 30000 },
  { label: "₹30,000 – ₹50,000", min: 30000, max: 50000 },
  { label: "₹50,000 – ₹75,000", min: 50000, max: 75000 },
  { label: "₹75,000 – ₹1,00,000", min: 75000, max: 100000 },
  { label: "₹1,00,000+", min: 100000, max: 250000 },
  { label: "Custom Budget", min: -1, max: -1 }
];

export default function BudgetSelector({
  budgetState,
  budgetIntelligence,
  onChangeBudget,
  goToStep
}) {
  const { mode, level, targetMin, targetMax } = budgetState;

  const [selectedRangeIdx, setSelectedRangeIdx] = useState(() => {
    if (!targetMin && !targetMax) return -1;
    return BUDGET_RANGES.findIndex((r) => r.min === targetMin && r.max === targetMax);
  });

  const [customMin, setCustomMin] = useState(targetMin ? targetMin.toString() : "");
  const [customMax, setCustomMax] = useState(targetMax ? targetMax.toString() : "");

  const handleModeChange = (selectedMode) => {
    onChangeBudget({ mode: selectedMode });
    if (selectedMode === "estimate") {
      onChangeBudget({ targetMin: 0, targetMax: 0 });
      setSelectedRangeIdx(-1);
    } else {
      // Default to Comfortable range index 2 (30k-50k)
      handleSelectRange(2);
    }
  };

  const handleSelectRange = (idx) => {
    setSelectedRangeIdx(idx);
    if (idx === -1) return;
    const range = BUDGET_RANGES[idx];
    if (range.min !== -1) {
      onChangeBudget({ targetMin: range.min, targetMax: range.max });
    } else {
      onChangeBudget({
        targetMin: parseInt(customMin, 10) || 0,
        targetMax: parseInt(customMax, 10) || 0
      });
    }
  };

  const handleCustomChange = (key, val) => {
    if (/^\d*$/.test(val)) {
      if (key === "min") {
        setCustomMin(val);
        onChangeBudget({ targetMin: parseInt(val, 10) || 0 });
      } else {
        setCustomMax(val);
        onChangeBudget({ targetMax: parseInt(val, 10) || 0 });
      }
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const budgetMatch = budgetIntelligence?.match || { status: "neutral", message: "" };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 text-left">
      {/* HEADER TITLE */}
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1">
          What feels comfortable for your budget?
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Set a rough budget and we'll match stays, transport, and experiences to fit.
        </p>
      </div>

      {/* CHOOSE BUDGET MODE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleModeChange("fixed")}
          className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all ${
            mode === "fixed"
              ? "bg-cream border-gold ring-2 ring-gold/25 shadow-gold-glow"
              : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-600 mb-3 flex items-center justify-center">
            <DollarSign size={18} />
          </div>
          <span className="font-display text-sm font-semibold text-ink mb-0.5">I have a budget</span>
          <span className="text-[10px] text-neutral-400">Match plan against a specific target amount</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleModeChange("estimate")}
          className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all ${
            mode === "estimate"
              ? "bg-cream border-gold ring-2 ring-gold/25 shadow-gold-glow"
              : "bg-white border-neutral-200 hover:border-neutral-300 shadow-premium"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gold text-pine mb-3 flex items-center justify-center">
            <Sparkles size={18} className="fill-current" />
          </div>
          <span className="font-display text-sm font-semibold text-ink mb-0.5">Help me estimate</span>
          <span className="text-[10px] text-neutral-400">Let AI calculate a realistic cost range</span>
        </motion.button>
      </div>

      {/* DYNAMIC MODE VIEWS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: BUDGET SETTINGS & SLIDERS */}
        {mode && (
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-neutral-150 shadow-premium space-y-4">
              <h4 className="font-display text-sm font-bold text-neutral-500 uppercase tracking-wide">
                1. Select Comfort Level
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUDGET_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => onChangeBudget({ level: tier.id })}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between transition ${
                      level === tier.id
                        ? "bg-neutral-50 border-gold ring-2 ring-gold/15"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <span className="text-xs font-bold font-display text-ink flex items-center justify-between">
                      {tier.label}
                      {level === tier.id && <Check size={12} className="text-gold" strokeWidth={3} />}
                    </span>
                    <span className="text-[9px] text-neutral-400 leading-normal mt-1 block">
                      {tier.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {mode === "fixed" && (
              <div className="bg-white p-5 rounded-xl border border-neutral-150 shadow-premium space-y-4">
                <h4 className="font-display text-sm font-bold text-neutral-500 uppercase tracking-wide">
                  2. Select Target Budget Range
                </h4>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_RANGES.map((range, idx) => (
                    <button
                      key={range.label}
                      onClick={() => handleSelectRange(idx)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                        selectedRangeIdx === idx
                          ? "bg-pine border-pine text-parchment"
                          : "bg-white hover:bg-neutral-50 text-neutral-500 border-neutral-200"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Custom budget inputs */}
                {selectedRangeIdx === BUDGET_RANGES.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Min Target (₹)</label>
                      <input
                        type="text"
                        value={customMin}
                        onChange={(e) => handleCustomChange("min", e.target.value)}
                        placeholder="e.g. 25000"
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-gold font-sans font-semibold text-ink"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Max Target (₹)</label>
                      <input
                        type="text"
                        value={customMax}
                        onChange={(e) => handleCustomChange("max", e.target.value)}
                        placeholder="e.g. 40000"
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-gold font-sans font-semibold text-ink"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN: CALCULATED ESTIMATE BREAKDOWN DISPLAY */}
        {budgetIntelligence && (
          <div className="md:col-span-2 space-y-4">
            <div className="bg-cream border border-gold rounded-xl p-5 shadow-gold-glow flex flex-col justify-between h-full">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-gold-dark font-bold block mb-1">
                  Estimated Cost Range
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-ink font-semibold leading-tight">
                  {formatPrice(budgetIntelligence.estimatedRange.min)} – {formatPrice(budgetIntelligence.estimatedRange.max)}
                </h3>
                <span className="text-[9px] text-neutral-400 block mt-1 leading-normal font-sans">
                  *Planning cost estimate only. Actual hotel & vehicle prices may vary.
                </span>

                {/* Match Analysis Status Badge */}
                {mode === "fixed" && budgetMatch.status !== "neutral" && (
                  <div className={`mt-4 p-3 rounded-lg border text-xs leading-normal flex gap-2 ${
                    budgetMatch.status === "match"
                      ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                      : budgetMatch.status === "high"
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-rose-50 border-rose-250 text-rose-800"
                  }`}>
                    {budgetMatch.status === "low" ? (
                      <AlertTriangle size={15} className="shrink-0 text-rose-600 mt-0.5" />
                    ) : (
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block uppercase text-[9px] tracking-wide mb-0.5">
                        {budgetMatch.status === "match" && "Good Budget Match"}
                        {budgetMatch.status === "high" && "Budget Headroom"}
                        {budgetMatch.status === "low" && "Budget Warning"}
                      </span>
                      <span>{budgetMatch.message}</span>
                    </div>
                  </div>
                )}

                {/* Itemized Cost Breakdown List */}
                <div className="mt-6 pt-5 border-t border-gold/15 space-y-3 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
                    Cost Category Estimates
                  </h4>
                  
                  {[
                    { label: "🏨 Stay Accommodation", cost: budgetIntelligence.breakdown.accommodation },
                    { label: "🚗 Private Transport & Permits", cost: budgetIntelligence.breakdown.transportation },
                    { label: "🍜 Food & Meals Surcharge", cost: budgetIntelligence.breakdown.food },
                    { label: "🎟️ Sanctuary Sights & Tickets", cost: budgetIntelligence.breakdown.activities },
                    { label: "Other Buffer (10%)", cost: budgetIntelligence.breakdown.miscellaneous }
                  ].map((category) => (
                    <div key={category.label} className="flex justify-between items-center py-0.5 text-neutral-600">
                      <span>{category.label}</span>
                      <span className="font-mono font-semibold text-ink">
                        {formatPrice(category.cost.min)}–{formatPrice(category.cost.max)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions detail link */}
              {budgetIntelligence.assumptions && budgetIntelligence.assumptions.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gold/15 text-[10px] text-neutral-400 leading-normal bg-neutral-100/50 p-2.5 rounded">
                  <span className="font-semibold block mb-0.5 uppercase tracking-wide">Estimating Assumptions:</span>
                  <ul className="list-disc pl-3.5 space-y-0.5">
                    {budgetIntelligence.assumptions.slice(0, 3).map((asm, aIdx) => (
                      <li key={aIdx}>{asm}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warning Box actions if budget is too low */}
      {mode === "fixed" && budgetMatch.status === "low" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-rose-50 border border-rose-250 rounded-xl flex gap-3 text-xs text-rose-800"
        >
          <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <div>
              <h5 className="font-bold uppercase tracking-wider text-[10px] text-rose-900">
                Plan Target Conflict
              </h5>
              <p className="mt-1 leading-relaxed">
                Your selected targets do not meet our pricing benchmarks. You can continue anyway, or select a optimization strategy:
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => goToStep(5)} // Go back to destinations
                className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded shadow transition"
              >
                Reduce Destinations <ChevronRight size={12} />
              </button>
              <button
                onClick={() => onChangeBudget({ level: "budget" })}
                className="text-rose-600 hover:text-rose-900 font-bold hover:underline"
              >
                Switch to Budget Comfort Level
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
