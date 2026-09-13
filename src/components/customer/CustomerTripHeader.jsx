import { Calendar, Users, MapPin, Key, Clock, RefreshCw } from "lucide-react";
import NotificationBell from "../notifications/NotificationBell";

export default function CustomerTripHeader({ booking, onChangeToken, onRefresh, onOpenFullNotifications, onOpenPreferences }) {
  if (!booking) return null;

  const {
    customer,
    trip,
    status,
    trackingToken,
    publicRequestId,
    friendlyStatus,
    countdownText,
    _isMockData
  } = booking;

  return (
    <header className="relative bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80 px-4 sm:px-8 py-6 sm:py-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar: Token & Request ID & Notifications */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 font-mono">
              <Key className="w-3 h-3 text-amber-400" />
              <span>Journey Access</span>
              <strong className="text-amber-400">{trackingToken}</strong>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400 font-mono">
              <span>Reference No.</span>
              <span className="text-slate-300">{publicRequestId}</span>
            </div>

            {_isMockData && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-400 text-[10px] font-semibold tracking-wider uppercase">
                Mock Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell
              customerId={booking?.customerId || "CUST-98765"}
              onOpenFullCenter={onOpenFullNotifications}
              onOpenPreferences={onOpenPreferences}
            />

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                title="Refresh Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            {onChangeToken && (
              <button
                type="button"
                onClick={onChangeToken}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
              >
                Change Booking
              </button>
            )}
          </div>
        </div>

        {/* Main Title & Status Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
              <span>Namaste, {customer?.firstName || "Traveler"}</span>
              <span>•</span>
              <span>Your Customized Sikkim Journey</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white tracking-tight">
              {booking.itinerary?.title || `${trip?.duration || 5}-Day Custom Sikkim Tour`}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {friendlyStatus?.description || "Your booking request is being processed by our operations desk."}
            </p>
          </div>

          {/* Status Badge & Countdown */}
          <div className="flex flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 font-semibold text-sm sm:text-base shadow-lg ${friendlyStatus?.badgeClass || "bg-slate-800 text-slate-200 border-slate-700"}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${status === "CONFIRMED" ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"}`} />
              <span>{friendlyStatus?.label || status}</span>
            </div>

            {countdownText && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{countdownText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Travel Dates</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {trip?.startDate ? new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Flexible"}
                {trip?.endDate ? ` - ${new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Destinations</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {(trip?.destinations || ["Gangtok"]).join(", ")}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Travelers</div>
              <div className="text-xs font-semibold text-slate-200">
                {customer?.travelerCount || 1} Person{customer?.travelerCount > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Duration & Style</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {trip?.duration || 5} Days • {trip?.travelStyle || "Scenic"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
