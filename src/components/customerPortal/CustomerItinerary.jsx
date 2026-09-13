/**
 * Customer Itinerary — Module 11
 * Day-by-day travel itinerary viewer. Clears planning stages vs confirmed states.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Calendar } from "lucide-react";

export default function CustomerItinerary({ itinerary, status }) {
  const [expandedDays, setExpandedDays] = useState({});

  if (!itinerary) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
        No itinerary loaded on record.
      </div>
    );
  }

  // Determine itinerary status
  const isFinal = ["PROPOSAL_SENT", "AWAITING_CUSTOMER", "CUSTOMER_ACCEPTED", "READY_TO_CONFIRM", "CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(status);
  const versionText = isFinal 
    ? `Approved Itinerary · ${itinerary.version || "ST-v1"}` 
    : "AI-generated planning itinerary — final version pending operations verification.";

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  return (
    <div className="space-y-4">
      {/* Version Banner */}
      <div className={`p-4 border rounded-xl flex items-start gap-2.5 text-xs ${isFinal ? "bg-indigo-950/20 border-indigo-900/30 text-indigo-300" : "bg-amber-950/20 border-amber-900/30 text-amber-300"}`}>
        <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{isFinal ? "Operations Confirmed Route" : "Planning Draft Mode"}</p>
          <p className="mt-0.5 opacity-80">{versionText}</p>
        </div>
      </div>

      {/* Days List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-805/60">
        {(itinerary.days || []).map((day) => {
          const isOpen = !!expandedDays[day.dayNumber];
          return (
            <div key={day.dayNumber} className="px-5 py-3">
              <button
                onClick={() => toggleDay(day.dayNumber)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Day {day.dayNumber}</span>
                  <h3 className="text-slate-200 text-sm font-semibold mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {day.title}
                  </h3>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-650" /> : <ChevronDown className="w-4 h-4 text-slate-650" />}
              </button>

              {isOpen && (
                <div className="mt-3.5 pl-5 border-l-2 border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
                  {/* Activities */}
                  <div className="space-y-2">
                    <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Plan</p>
                    {(day.activities || []).map((act, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-500 font-medium shrink-0 w-16">{act.time || `Slot ${i+1}`}</span>
                        <span className="text-slate-250">{act.description || act}</span>
                      </div>
                    ))}
                  </div>

                  {/* Accommodation */}
                  {day.accommodation && (
                    <div className="pt-2">
                      <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px] mb-1">Overnight Stay</p>
                      <p className="text-slate-350">{day.accommodation}</p>
                    </div>
                  )}

                  {/* Transport */}
                  {day.transport && (
                    <div className="pt-2">
                      <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px] mb-1">Transit Details</p>
                      <p className="text-slate-355">{day.transport}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
