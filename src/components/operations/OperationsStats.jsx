/**
 * Operations Stats — Module 10
 * Dashboard KPI cards. Never fabricates numbers.
 */
import { Inbox, Search, Clock, CalendarDays, AlertTriangle, CheckCircle } from "lucide-react";

const STAT_CARDS = [
  { key: "newRequests",      label: "New Requests",       icon: Inbox,        color: "from-blue-600 to-blue-700",      text: "text-blue-300" },
  { key: "underReview",     label: "Under Review",        icon: Search,       color: "from-indigo-600 to-indigo-700",  text: "text-indigo-300" },
  { key: "awaitingCustomer",label: "Awaiting Customer",   icon: Clock,        color: "from-amber-600 to-amber-700",    text: "text-amber-300" },
  { key: "upcomingThisWeek",label: "Trips This Week",     icon: CalendarDays, color: "from-emerald-600 to-emerald-700",text: "text-emerald-300" },
  { key: "urgentAlerts",    label: "Urgent Alerts",       icon: AlertTriangle,color: "from-red-600 to-red-700",        text: "text-red-300" },
  { key: "confirmed",       label: "Confirmed",           icon: CheckCircle,  color: "from-teal-600 to-teal-700",      text: "text-teal-300" }
];

export default function OperationsStats({ stats, onViewInbox }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map(card => (
          <div key={card.key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
            <div className="h-8 w-8 bg-slate-800 rounded-lg mb-3" />
            <div className="h-6 w-12 bg-slate-800 rounded mb-1" />
            <div className="h-3 w-20 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats.hasData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
        <p className="text-slate-500 text-sm">Not enough data yet. Booking requests will appear here once submitted.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {STAT_CARDS.map(card => {
        const Icon = card.icon;
        const value = stats[card.key] ?? 0;
        return (
          <button
            key={card.key}
            onClick={card.key === "newRequests" || card.key === "underReview" ? onViewInbox : undefined}
            className={`bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 text-left transition-all group ${onViewInbox && (card.key === "newRequests" || card.key === "underReview") ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className={`text-xs mt-0.5 ${card.text}`}>{card.label}</p>
          </button>
        );
      })}
    </div>
  );
}
