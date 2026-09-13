/**
 * Operations Trip Overview — Module 10
 * Displays the trip summary card with customer details and realtime status.
 */
export default function OperationsTripOverview({ booking, customer, canViewPII }) {
  const startDate = booking.trip?.startDate
    ? new Date(booking.trip.startDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "Flexible";
  const endDate = booking.trip?.endDate
    ? new Date(booking.trip.endDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "—";

  const totalPax = 1 + (booking.customer?.companions?.length || 0);
  const budgetMin = booking.budget?.aiEstimate?.min;
  const budgetMax = booking.budget?.aiEstimate?.max;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Trip Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Trip Summary</h2>
        <div className="space-y-2 text-sm">
          <InfoRow label="Trip Title" value={booking.itineraryVersions?.[0]?.title || booking.itineraryVersions?.[0]?.tripTitle || "Untitled Journey"} />
          <InfoRow label="Start Date" value={startDate} />
          <InfoRow label="End Date" value={endDate} />
          <InfoRow label="Duration" value={`${booking.trip?.duration || 0} Days`} />
          <InfoRow label="Travel Style" value={booking.trip?.travelStyle || "Balanced"} />
          <InfoRow label="Destinations" value={booking.destinations?.join(" → ") || "—"} />
          <InfoRow label="Interests" value={booking.trip?.interests?.join(", ") || "—"} />
          <InfoRow label="Itinerary Version" value={booking.itineraryVersions?.[booking.itineraryVersions.length - 1]?.version || "—"} />
        </div>
      </div>

      {/* Customer Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Customer Details</h2>
        <div className="space-y-2 text-sm">
          <InfoRow label="Primary Traveler" value={customer.name} />
          {canViewPII && <InfoRow label="Email" value={customer.email || "—"} />}
          {canViewPII && <InfoRow label="Phone" value={customer.phone || "—"} />}
          <InfoRow label="City / Country" value={[customer.city, customer.country].filter(Boolean).join(", ") || "—"} />
          <InfoRow label="Total Travelers" value={`${totalPax} pax`} />
          <InfoRow label="Contact Method" value={customer.contactMethod || "—"} />
          <InfoRow label="Preferred Time" value={customer.contactTime || "—"} />
          {booking.customer?.companions?.length > 0 && (
            <div>
              <span className="text-slate-500">Companions:</span>
              <ul className="mt-1 space-y-0.5 pl-3">
                {booking.customer.companions.map((c, i) => (
                  <li key={i} className="text-slate-300">• {canViewPII ? c : "• •••"}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Budget Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Budget</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">AI Estimate</span>
            <span className="text-slate-200 font-medium">
              {budgetMin && budgetMax ? `₹${budgetMin.toLocaleString("en-IN")} – ₹${budgetMax.toLocaleString("en-IN")}` : "Not available"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Budget Level</span>
            <span className="text-slate-300 capitalize">{booking.budget?.aiBreakdown ? booking.trip?.travelStyle : "—"}</span>
          </div>
          {booking.budget?.operationsQuote && (
            <div className="flex justify-between items-center border-t border-slate-800 pt-2 mt-2">
              <span className="text-slate-400 font-medium">Operations Quote</span>
              <span className="text-indigo-300 font-bold">₹{Number(booking.budget.operationsQuote).toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Realtime Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Realtime Snapshot</h2>
        <div className="space-y-2 text-sm">
          <p className="text-slate-300">{booking.realtimeSnapshot?.overallStatus || "No data"}</p>
          <InfoRow label="Risk Level" value={booking.realtimeSnapshot?.riskLevel || "UNKNOWN"} />
          {booking.realtimeSnapshot?.lastChecked && (
            <InfoRow label="Last Checked" value={booking.realtimeSnapshot.lastChecked} />
          )}
          {(booking.realtimeSnapshot?.alerts || []).map((a, i) => (
            <div key={i} className="bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2 text-amber-300 text-xs">
              ⚠ {a.message || JSON.stringify(a)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-300 text-right">{value || "—"}</span>
    </div>
  );
}
