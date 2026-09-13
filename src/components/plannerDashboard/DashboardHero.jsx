/**
 * Dashboard Hero Component — AI Trip Planner Dashboard
 * Prominent AI planning input banner with quick one-click prompt shortcuts.
 */

import { useState } from "react";
import { Sparkles, Compass, ArrowRight, Wand2 } from "lucide-react";

const PROMPT_SHORTCUTS = [
  { label: "Plan a 5-day Sikkim trip", prompt: "Plan a 5-day Sikkim trip covering Gangtok, Lachung & Yumthang" },
  { label: "Plan a budget trip under ₹20,000", prompt: "Plan a budget Sikkim trip under ₹20,000 for 4 days" },
  { label: "I want snow & scenic places", prompt: "Plan a Sikkim itinerary focusing on high-altitude snow & mountain views" },
  { label: "Family-friendly itinerary", prompt: "Create a relaxed family-friendly Sikkim itinerary with comfortable travel" },
  { label: "Optimize my route", prompt: "Optimize my Sikkim route to minimize long mountain driving hours" }
];

export default function DashboardHero({ onPlanTripPrompt }) {
  const [inputPrompt, setInputPrompt] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    onPlanTripPrompt?.(inputPrompt);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl text-slate-100">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Himalayan Travel Concierge</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            Plan Your Sikkim Journey with AI
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Specify dates, style, or budget preferences. Our AI intelligence engine builds bespoke itineraries, checks road advisories, and calculates live budget estimates.
          </p>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="e.g. Plan a 6-day scenic adventure to Lachung & Yumthang under ₹40,000..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim()}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Plan My Trip</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Prompt Shortcut Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-indigo-400" /> Quick AI Prompts
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PROMPT_SHORTCUTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputPrompt(item.prompt);
                  onPlanTripPrompt?.(item.prompt);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-amber-300 transition-all shrink-0 cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
