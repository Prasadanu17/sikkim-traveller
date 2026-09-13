/**
 * Itinerary Workspace Component — AI Trip Planner Dashboard
 * Day-by-day interactive itinerary workspace.
 * Clearly demarcates `AI GENERATED / PROPOSED` vs `✓ VERIFIED / CONFIRMED` operational truth.
 */

import { useState } from "react";
import { Calendar, Hotel, Car, Sparkles, RefreshCw } from "lucide-react";

export default function ItineraryWorkspace({ itinerary, bookingStatus, onRefineAI }) {
  const [refinePrompt, setRefinePrompt] = useState("");
  const [refining, setRefining] = useState(false);

  const days = itinerary?.days || [];
  const isConfirmed = bookingStatus === "CONFIRMED";

  const handleRefine = (e) => {
    e.preventDefault();
    if (!refinePrompt.trim()) return;
    setRefining(true);
    onRefineAI?.(refinePrompt);
    setTimeout(() => {
      setRefinePrompt("");
      setRefining(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {itinerary?.title || "Day-by-Day Himalayan Itinerary Workspace"}
            </h2>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            {itinerary?.summary || "Curated multi-day route through Sikkim valleys."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
            isConfirmed ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-amber-950/60 border-amber-800 text-amber-300"
          }`}>
            {isConfirmed ? "✓ VERIFIED / CONFIRMED" : "AI GENERATED / PROPOSED"}
          </span>
        </div>
      </div>

      {/* AI Refinement Input Bar */}
      <form onSubmit={handleRefine} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 ml-1" />
        <input
          type="text"
          value={refinePrompt}
          onChange={e => setRefinePrompt(e.target.value)}
          placeholder="Refine with AI (e.g. 'Add a tea garden visit on Day 2', 'Reduce driving time')..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={refining || !refinePrompt.trim()}
          className="text-xs px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refining ? "animate-spin" : ""}`} />
          {refining ? "Refining..." : "Refine Day"}
        </button>
      </form>

      {/* Days List */}
      <div className="space-y-4">
        {days.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No itinerary days generated yet.</div>
        ) : (
          days.map((day, idx) => (
            <div key={idx} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800/50 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    {day.dayNumber || idx + 1}
                  </span>
                  <h3 className="font-bold text-sm text-white">{day.title || `Day ${idx + 1}`}</h3>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                  isConfirmed ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-300 border border-amber-800/40"
                }`}>
                  {isConfirmed ? "✓ CONFIRMED DAY" : "PROPOSED"}
                </span>
              </div>

              {/* Schedule Timeline (Morning, Afternoon, Evening) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {day.activities?.map((act, aIdx) => (
                  <div key={aIdx} className="bg-slate-900/60 border border-slate-800/60 rounded-lg p-3 space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">{act.time || "Schedule"}</span>
                    <p className="text-slate-300 leading-relaxed">{act.description}</p>
                  </div>
                ))}
              </div>

              {/* Stays & Transport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                  <Hotel className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate"><strong>Stay:</strong> {day.accommodation || "Recommended Hotel"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                  <Car className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate"><strong>Transport:</strong> {day.transport || "Private Cab"}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
