/**
 * My Trips Cards Component — AI Trip Planner Dashboard
 * Displays customer trips across planning, proposal, confirmed, and active stages.
 * Provides easy trip switching and open-trip actions.
 */

import { Calendar, Users, MapPin, ChevronRight, Compass } from "lucide-react";

export default function MyTripsCards({ trips = [], activeTripId, onSelectTrip }) {
  if (!trips || trips.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3 text-slate-400">
        <Compass className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="font-semibold text-white">No active trips found.</p>
        <p className="text-xs text-slate-500">Start planning your Sikkim journey above using our AI Concierge.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          My Sikkim Journeys ({trips.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map(trip => {
          const isActive = trip.id === activeTripId || trip.requestId === activeTripId;
          const isConfirmed = trip.status === "CONFIRMED";

          return (
            <button
              key={trip.id}
              onClick={() => onSelectTrip?.(trip)}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-4 cursor-pointer ${
                isActive
                  ? "bg-slate-900 border-amber-500/80 shadow-xl shadow-amber-500/10 text-white"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-500">{trip.requestId}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    isConfirmed ? "bg-emerald-950/60 border-emerald-800 text-emerald-300" : "bg-amber-950/60 border-amber-800 text-amber-300"
                  }`}>
                    {trip.status?.replace(/_/g, " ")}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white leading-tight">
                  {trip.itinerary?.title || `${trip.trip?.duration || 5}-Day Sikkim Tour`}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{(trip.destinations || ["Gangtok"]).join(", ")}</span>
                </div>
              </div>

              {/* Sub Meta */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {trip.trip?.duration || 5} Days
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {trip.customer?.travelerCount || 2}
                  </span>
                </div>

                <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                  Open <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
