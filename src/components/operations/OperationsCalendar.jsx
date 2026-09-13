/**
 * Operations Calendar — Module 10
 * Upcoming trips timeline (7 / 30 / 90 days) with month grid overview.
 */
import { useState } from "react";
import { getUpcomingTrips } from "../../services/operations/operationsAlertService";
import { STATUS_TAILWIND, PRIORITY_META } from "../../services/operations/operationsStatusService";

const RANGE_OPTIONS = [
  { label: "Next 7 Days", value: 7 },
  { label: "Next 30 Days", value: 30 },
  { label: "Next 90 Days", value: 90 }
];

export default function OperationsCalendar({ bookings, onOpenDetail }) {
  const [range, setRange] = useState(30);
  const upcoming = getUpcomingTrips(bookings, range);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Operations Calendar</h1>
          <p className="text-slate-400 text-sm">{upcoming.length} upcoming trip{upcoming.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${range === opt.value ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month Grid */}
      <MonthGrid bookings={bookings} onOpenDetail={onOpenDetail} />

      {/* Upcoming List */}
      <div>
        <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-wider mb-3">Upcoming Trips</h2>
        {upcoming.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
            No upcoming trips in the next {range} days.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(b => <UpcomingTripRow key={b.id} booking={b} onOpen={() => onOpenDetail(b.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function MonthGrid({ bookings, onOpenDetail }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const tripsByDate = {};
  for (const b of bookings) {
    if (!b.trip?.startDate) continue;
    const d = b.trip.startDate.split("T")[0];
    const [y, m] = d.split("-").map(Number);
    if (y === year && m - 1 === month) {
      const day = parseInt(d.split("-")[2]);
      if (!tripsByDate[day]) tripsByDate[day] = [];
      tripsByDate[day].push(b);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-slate-300 font-semibold text-sm">{monthName}</p>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="text-center text-xs text-slate-600 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const trips = tripsByDate[day] || [];
            const isToday = day === now.getDate();
            return (
              <div key={day} className={`min-h-[48px] rounded-lg p-1 text-xs ${isToday ? "bg-indigo-900/40 border border-indigo-700" : trips.length > 0 ? "bg-slate-800" : ""}`}>
                <p className={`text-center mb-1 ${isToday ? "text-indigo-300 font-bold" : "text-slate-500"}`}>{day}</p>
                {trips.slice(0, 2).map(t => (
                  <button key={t.id} onClick={() => onOpenDetail(t.id)}
                    className="w-full text-left bg-indigo-800/60 hover:bg-indigo-700/60 rounded px-1 py-0.5 text-indigo-200 text-xs truncate mb-0.5 transition-colors">
                    {t.requestId.slice(-4)}
                  </button>
                ))}
                {trips.length > 2 && <p className="text-slate-600 text-center">+{trips.length - 2}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UpcomingTripRow({ booking, onOpen }) {
  const daysUntil = booking.trip?.startDate
    ? Math.ceil((new Date(booking.trip.startDate) - Date.now()) / 86400000)
    : null;

  const statusClass = STATUS_TAILWIND[booking.status] || "bg-slate-700 text-slate-300 border-slate-600";
  const priorityMeta = PRIORITY_META[booking.priority] || PRIORITY_META.NORMAL;

  const issues = [];
  if (booking.accommodation?.verificationStatus === "NOT_CHECKED") issues.push("Hotel unverified");
  if (booking.transportation?.verificationStatus === "NOT_CHECKED") issues.push("Transport unverified");
  if (booking.requiresPermit && booking.permits?.some(p => ["REQUIRED","DOCUMENTS_PENDING"].includes(p.status))) issues.push("Permit pending");

  return (
    <button onClick={onOpen} className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-200 font-medium text-sm">{booking.requestId}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
              {booking.status?.replace(/_/g, " ")}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${priorityMeta.color}`}>
              {booking.priority}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">{booking.customer?.name} · {booking.destinations?.join(" → ")} · {booking.trip?.duration}d</p>
          {issues.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-1.5">
              {issues.map(issue => (
                <span key={issue} className="text-xs bg-amber-950/40 border border-amber-800/30 text-amber-400 px-2 py-0.5 rounded">⚠ {issue}</span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-slate-200 text-sm font-semibold">
            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
          </p>
          <p className="text-slate-500 text-xs">
            {booking.trip?.startDate ? new Date(booking.trip.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
          </p>
        </div>
      </div>
    </button>
  );
}
