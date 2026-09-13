/**
 * Operations Booking Inbox — Module 10
 * Searchable, filterable, sortable booking request table.
 */
import { useState, useMemo } from "react";
import { Search, Filter, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { STATUS_TAILWIND, PRIORITY_META } from "../../services/operations/operationsStatusService";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { getBookings } from "../../services/operations/operationsBookingService";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "newest",   label: "Newest First" },
  { value: "oldest",   label: "Oldest First" },
  { value: "tripDate", label: "Trip Date" },
  { value: "priority", label: "Priority" },
  { value: "budget",   label: "Budget (High → Low)" },
];

const STATUS_OPTIONS = [
  "ALL","RECEIVED","UNDER_REVIEW","AVAILABILITY_CHECK","PRICE_PENDING",
  "PROPOSAL_SENT","AWAITING_CUSTOMER","CUSTOMER_ACCEPTED","READY_TO_CONFIRM",
  "CONFIRMED","IN_PROGRESS","COMPLETED","CANCELLED","DECLINED"
];

export default function OperationsBookingInbox({ bookings, onOpenDetail, onRefresh, currentUser }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => getBookings({
    query, status: statusFilter, priority: priorityFilter, sort: sortBy
  }), [query, statusFilter, priorityFilter, sortBy, bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  const paged = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paged.length < filtered.length;

  const canViewPII = hasPermission(currentUser?.role, "canViewPII");

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Booking Inbox</h1>
          <p className="text-slate-400 text-sm">{filtered.length} request{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${showFilters ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          <button onClick={onRefresh} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by ID, customer, destination..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Priority</label>
            <select
              value={priorityFilter}
              onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setQuery(""); setStatusFilter("ALL"); setPriorityFilter("ALL"); setSortBy("newest"); setPage(1); }}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Table Header — Desktop */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-3 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
          <span>Priority</span>
          <span>Request / Customer</span>
          <span>Trip</span>
          <span>Travelers</span>
          <span>Budget</span>
          <span>Status</span>
          <span>Assigned</span>
        </div>

        {/* Rows */}
        {paged.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">No bookings match your filters.</p>
            <button onClick={() => { setQuery(""); setStatusFilter("ALL"); setPriorityFilter("ALL"); }} className="text-xs text-indigo-400 underline mt-2">Clear filters</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {paged.map(b => (
              <BookingRow key={b.id} booking={b} canViewPII={canViewPII} onOpen={() => onOpenDetail(b.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="text-sm text-indigo-400 hover:text-indigo-300 underline"
          >
            Load more ({filtered.length - paged.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking, canViewPII, onOpen }) {
  const priorityMeta = PRIORITY_META[booking.priority] || PRIORITY_META.NORMAL;
  const statusClass = STATUS_TAILWIND[booking.status] || "bg-slate-700 text-slate-300 border-slate-600";

  const customerDisplay = canViewPII
    ? booking.customer?.name || "Unknown"
    : (booking.customer?.name?.split(" ")?.[0] || "Traveler") + " •••";

  const budgetMin = booking.budget?.aiEstimate?.min;
  const budgetMax = booking.budget?.aiEstimate?.max;
  const budgetDisplay = budgetMin && budgetMax
    ? `₹${Math.round(budgetMin / 1000)}K–₹${Math.round(budgetMax / 1000)}K`
    : "TBD";

  const startDate = booking.trip?.startDate
    ? new Date(booking.trip.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "Flexible";

  return (
    <button
      onClick={onOpen}
      className="w-full text-left hover:bg-slate-800/50 transition-colors"
    >
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-x-4 px-4 py-3.5 items-center">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityMeta.color}`}>
          {booking.priority}
        </span>
        <div className="min-w-0">
          <p className="text-slate-200 text-sm font-medium truncate">{booking.requestId}</p>
          <p className="text-slate-500 text-xs truncate">{customerDisplay} · {booking.destinations?.join(" → ")}</p>
        </div>
        <span className="text-slate-400 text-xs whitespace-nowrap">{startDate} · {booking.trip?.duration}d</span>
        <span className="text-slate-400 text-xs whitespace-nowrap">{booking.customer?.companions?.length + 1 || 1} pax</span>
        <span className="text-slate-400 text-xs whitespace-nowrap">{budgetDisplay}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${statusClass}`}>
          {booking.status?.replace(/_/g, " ")}
        </span>
        <span className="text-slate-500 text-xs truncate max-w-[80px]">{booking.assignedTo || "—"}</span>
      </div>

      {/* Mobile Card */}
      <div className="md:hidden px-4 py-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-200 text-sm font-medium">{booking.requestId}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
            {booking.status?.replace(/_/g, " ")}
          </span>
        </div>
        <p className="text-slate-400 text-xs">{customerDisplay} · {booking.destinations?.join(" → ")}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{startDate}</span>
          <span>·</span>
          <span>{booking.trip?.duration}d</span>
          <span>·</span>
          <span>{budgetDisplay}</span>
          <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-semibold ${PRIORITY_META[booking.priority]?.color}`}>
            {booking.priority}
          </span>
        </div>
      </div>
    </button>
  );
}
