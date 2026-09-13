/**
 * Customer Trip Timeline — Module 11
 * Displays traveler-safe activity log events.
 */

const EVENT_ICONS = {
  RECEIVED: "📥",
  STATUS_CHANGED: "🔄",
  PROPOSAL_SENT: "📄",
  CUSTOMER_ACCEPTED: "✅",
  CUSTOMER_DECLINED: "❌",
  CONFIRMED: "🎉",
  CANCELLED: "🚫",
  DECLINED: "🚫",
  COMPLETED: "✓",
  ACCOMMODATION_UPDATED: "🏨",
  TRANSPORT_UPDATED: "🚗",
  PERMIT_UPDATED: "🛡",
  ITINERARY_REVISED: "🗺",
  REALTIME_REFRESHED: "🔄"
};

export default function CustomerTripTimeline({ timeline = [] }) {
  const events = [...timeline].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Trip Updates</h2>

      {events.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-6">No status updates yet.</p>
      ) : (
        <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
          {events.map((evt, idx) => (
            <div key={evt.id || idx} className="relative flex gap-3 items-start text-xs">
              <div className="absolute -left-[19px] w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[8px] z-10">
                {EVENT_ICONS[evt.type] || "•"}
              </div>
              <div className="flex-1">
                <p className="text-slate-200">{evt.message}</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {new Date(evt.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
