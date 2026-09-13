/**
 * Operations Activity Timeline — Module 10
 * Chronological log of all significant events on a booking.
 */
export default function OperationsActivityTimeline({ booking }) {
  const events = [...(booking.activityLog || [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const EVENT_ICONS = {
    RECEIVED: "📥",
    STATUS_CHANGED: "🔄",
    ASSIGNED: "👤",
    QUOTE_ADDED: "💰",
    QUOTE_STATUS_CHANGED: "📋",
    PROPOSAL_CREATED: "📄",
    PROPOSAL_SENT: "📤",
    CUSTOMER_ACCEPTED: "✅",
    CUSTOMER_DECLINED: "❌",
    CUSTOMER_APPROVAL_INVALIDATED: "⚠",
    NOTE_ADDED: "📝",
    PERMIT_UPDATED: "🛡",
    ACCOMMODATION_UPDATED: "🏨",
    TRANSPORT_UPDATED: "🚗",
    ITINERARY_REVISED: "🗺",
    CONFIRMED: "🎉",
    CANCELLED: "🚫",
    DECLINED: "🚫",
    COMPLETED: "✓",
    REALTIME_REFRESHED: "🔄"
  };

  return (
    <div className="space-y-4">
      <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Activity Timeline</h2>
      {events.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No activity recorded yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="flex gap-4 relative pl-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base shrink-0 relative z-10">
                  {EVENT_ICONS[event.type] || "•"}
                </div>
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                  <p className="text-slate-200 text-sm">{event.message}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {event.actorName} · {new Date(event.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
