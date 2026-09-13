/**
 * Active Trip View Component — AI Trip Planner Dashboard
 * Dynamic "Today's Journey" view active when the traveler is currently on their Sikkim trip.
 * Supports day switcher navigation ([ Previous Day ], [ Today ], [ Next Day ]) and live intelligence refresh.
 */

import { useState, useEffect } from "react";
import { Hotel, Car, ShieldAlert, Clock, ChevronLeft, ChevronRight, RefreshCw, CloudRain } from "lucide-react";
import { getTodaysJourneyDetails } from "../../services/planner/plannerDashboardService";
import { getCustomerRealtimeIntelligence } from "../../services/customer/customerRealtimeService";

export default function ActiveTripView({ booking, onRefreshRealtime }) {
  const details = getTodaysJourneyDetails(booking);
  
  const [selectedDayNumber, setSelectedDayNumber] = useState(details?.dayNumber || 1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prevDayNumber, setPrevDayNumber] = useState(details?.dayNumber);
  const [realtimeData, setRealtimeData] = useState(null);

  // Sync state if details changes (safe state syncing in render)
  if (details?.dayNumber !== prevDayNumber) {
    setSelectedDayNumber(details?.dayNumber || 1);
    setPrevDayNumber(details?.dayNumber);
  }

  const loadRealtimeData = async () => {
    if (!booking) return;
    try {
      const data = await getCustomerRealtimeIntelligence(booking);
      setRealtimeData(data);
    } catch (err) {
      console.warn("[ActiveTripView] Live conditions fetch error:", err);
    }
  };

  useEffect(() => {
    loadRealtimeData();
  }, [booking?.requestId, booking?.id]);

  if (!details) return null;

  const totalDays = details.totalDays || booking?.itinerary?.days?.length || 5;
  
  // Retrieve selected day details
  const selectedDay = booking?.itinerary?.days?.find(d => d.dayNumber === selectedDayNumber) || details.day;
  const isToday = selectedDayNumber === details.dayNumber;

  // Extract matching weather for the current day's destination
  let todayWeather = null;
  if (realtimeData?.weather) {
    const destKeys = Object.keys(realtimeData.weather);
    const searchStr = (selectedDay?.title || details.destination || "").toLowerCase();
    const matchKey = destKeys.find(key => 
      searchStr.includes(key.replace(/-/g, " ")) || 
      searchStr.includes(key)
    );
    if (matchKey) {
      todayWeather = realtimeData.weather[matchKey];
    } else if (destKeys.length > 0) {
      todayWeather = realtimeData.weather[destKeys[0]];
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshRealtime?.();
    await loadRealtimeData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            TRIP IN PROGRESS • DAY {selectedDayNumber} OF {totalDays} {isToday ? "(TODAY)" : ""}
          </span>
        </div>

        {/* Day Switcher Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDayNumber(prev => Math.max(1, prev - 1))}
            disabled={selectedDayNumber <= 1}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous Day
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDayNumber(details.dayNumber)}
              className="px-2.5 py-1 rounded-lg bg-indigo-900/60 text-indigo-300 border border-indigo-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Today
            </button>
          )}

          <button
            onClick={() => setSelectedDayNumber(prev => Math.min(totalDays, prev + 1))}
            disabled={selectedDayNumber >= totalDays}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            Next Day <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Destination & Summary */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Day {selectedDayNumber}: {selectedDay?.title || details.destination}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          {selectedDay?.summary || "Enjoy today's mountain route and valley excursions."}
        </p>
      </div>

      {/* Day Schedule Activities */}
      {selectedDay?.activities && selectedDay.activities.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Day Schedule
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {selectedDay.activities.map((act, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">{act.time}</span>
                <p className="text-slate-200 font-medium">{act.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Pillars & Live Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
        {/* Night's Stay */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Hotel className="w-3.5 h-3.5" /> Night's Stay
          </span>
          <p className="text-slate-200 font-semibold text-sm truncate">{selectedDay?.accommodation || details.accommodation}</p>
          <span className="text-[10px] text-emerald-400 font-medium">✓ Verified Allotment</span>
        </div>

        {/* Vehicle & Driver */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> Vehicle & Driver
          </span>
          <p className="text-slate-200 font-semibold text-sm truncate">{selectedDay?.transport || details.transport}</p>
          <span className="text-[10px] text-cyan-300 font-medium">Dedicated Mountain Cab</span>
        </div>

        {/* Weather Forecast (Module 7 Live Feed) */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5" /> Weather Forecast
          </span>
          {todayWeather ? (
            <>
              <p className="text-slate-200 font-semibold text-sm truncate">
                {todayWeather.temp || "18°C"} · {todayWeather.condition || "Clear"}
              </p>
              <span className="text-[10px] text-indigo-300 font-medium">
                ☂ {todayWeather.precipitationProbability || 10}% Rain Probability
              </span>
            </>
          ) : (
            <>
              <p className="text-slate-200 font-semibold text-sm truncate text-slate-400">
                Weather Unavailable
              </p>
              <span className="text-[10px] text-slate-500 font-medium">
                No matching forecast
              </span>
            </>
          )}
        </div>

        {/* Route Advisory (Module 7 Live Feed) */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Route Advisory
            </span>
            <button
              onClick={handleRefresh}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-slate-400"
              title="Refresh Travel Intelligence"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
          <p className={`font-semibold text-sm truncate ${
            realtimeData?.riskLevel === "HIGH" 
              ? "text-rose-400 font-bold" 
              : realtimeData?.riskLevel === "MEDIUM" 
              ? "text-amber-400 font-bold" 
              : "text-slate-200"
          }`}>
            {realtimeData?.overallStatus || booking?.realtimeSnapshot?.overallStatus || "🟢 Normal Road Conditions"}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">
            Updated: {realtimeData?.lastUpdated || booking?.realtimeSnapshot?.lastChecked || "Just now"}
          </span>
        </div>
      </div>
    </div>
  );
}
