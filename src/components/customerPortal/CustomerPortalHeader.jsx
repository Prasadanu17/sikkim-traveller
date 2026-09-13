/**
 * Customer Portal Header — Module 11
 * Navigation bar for the traveler portal showing countdown, unread counts, and logout trigger.
 */
import { Mountain, LogOut, Bell, Compass } from "lucide-react";

export default function CustomerPortalHeader({ bookingId, customerName, countdownText, unreadCount, onToggleNotifications, onLogout }) {
  const firstName = customerName ? customerName.split(" ")[0] : "Traveler";

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
      {/* Brand logo */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <Mountain className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="text-white font-semibold text-sm leading-tight truncate">My Trip</p>
          <p className="text-slate-500 text-xs truncate">Sikkim Traveller Companion</p>
        </div>
      </div>

      {/* Greeting and Countdown */}
      <div className="flex items-center gap-4 text-xs">
        <div className="text-right hidden md:block">
          <p className="text-slate-300 font-medium">Hello, {firstName}</p>
          <p className="text-slate-500 font-mono mt-0.5">{bookingId}</p>
        </div>

        <div className="bg-indigo-950/40 border border-indigo-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-indigo-300 font-semibold shrink-0">
          <Compass className="w-3.5 h-3.5" />
          <span>{countdownText}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-750 rounded-xl text-slate-400 hover:text-white transition-all relative"
          title="Trip Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Log Out */}
        <button
          onClick={onLogout}
          className="p-2 bg-slate-800 hover:bg-rose-950/30 border border-slate-750 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
          title="Exit Session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
