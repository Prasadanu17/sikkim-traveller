/**
 * Operations Booking Detail — Module 10
 * Master detail container with tabbed layout for all booking operations.
 */
import { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { getBookingById } from "../../services/operations/operationsBookingService";
import { STATUS_TAILWIND, PRIORITY_META, getPipelineSteps, getPipelineIndex } from "../../services/operations/operationsStatusService";
import { hasPermission, redactCustomerIfNeeded } from "../../services/operations/operationsPermissionService";
import OperationsTripOverview from "./OperationsTripOverview";
import OperationsItinerary from "./OperationsItinerary";
import OperationsAccommodation from "./OperationsAccommodation";
import OperationsTransportation from "./OperationsTransportation";
import OperationsPermitPanel from "./OperationsPermitPanel";
import OperationsRealtimePanel from "./OperationsRealtimePanel";
import OperationsQuotePanel from "./OperationsQuotePanel";
import OperationsProposalPanel from "./OperationsProposalPanel";
import OperationsNotes from "./OperationsNotes";
import OperationsActivityTimeline from "./OperationsActivityTimeline";
import OperationsAuditLog from "./OperationsAuditLog";
import OperationsAssignment from "./OperationsAssignment";
import OperationsConfirmationGate from "./OperationsConfirmationGate";
import OperationsFinancePanel from "./OperationsFinancePanel";

const TABS = [
  { id: "overview",      label: "Overview" },
  { id: "itinerary",     label: "Itinerary" },
  { id: "verification",  label: "Verification" },
  { id: "quote",         label: "Quote" },
  { id: "proposal",      label: "Proposal" },
  { id: "finance",       label: "Finance & Invoices" },
  { id: "notes",         label: "Notes" },
  { id: "timeline",      label: "Timeline" },
  { id: "audit",         label: "Audit Log" },
];

export default function OperationsBookingDetail({ bookingId, onBack, onRefresh, currentUser }) {
  const [booking, setBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    const b = getBookingById(bookingId);
    setBooking(b);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMutation = () => { reload(); onRefresh?.(); };

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading booking details...</div>;
  if (!booking) return (
    <div className="p-8 text-center">
      <p className="text-slate-400">Booking not found.</p>
      <button onClick={onBack} className="mt-4 text-indigo-400 underline text-sm">← Back to Inbox</button>
    </div>
  );

  const canViewPII = hasPermission(currentUser?.role, "canViewPII");
  const customer = redactCustomerIfNeeded(booking.customer, currentUser?.role);
  const statusClass = STATUS_TAILWIND[booking.status] || "bg-slate-700 text-slate-300 border-slate-600";
  const pipelineSteps = getPipelineSteps();
  const pipelineIdx = getPipelineIndex(booking.status);

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 space-y-3 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-slate-700">|</span>
          <h1 className="text-white font-semibold text-sm md:text-base flex-1 truncate">{booking.requestId}</h1>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusClass}`}>
              {booking.status?.replace(/_/g, " ")}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_META[booking.priority]?.color}`}>
              {booking.priority}
            </span>
            <button onClick={reload} title="Refresh" className="p-1.5 text-slate-500 hover:text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Customer Summary */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <span className="text-slate-300 font-medium">{customer.name}</span>
          {canViewPII && <span className="text-slate-500">{customer.email}</span>}
          {canViewPII && <span className="text-slate-500">{customer.phone}</span>}
          <span className="text-slate-500">{booking.destinations?.join(" → ")}</span>
          <span className="text-slate-500">{booking.trip?.startDate} → {booking.trip?.endDate} ({booking.trip?.duration}d)</span>
        </div>

        {/* Pipeline Progress */}
        <div className="hidden md:flex items-center gap-1 overflow-x-auto pb-1">
          {pipelineSteps.map((step, i) => {
            const isDone = i < pipelineIdx;
            const isCurrent = i === pipelineIdx;
            return (
              <div key={step} className="flex items-center gap-1 shrink-0">
                <div className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                  isCurrent ? "bg-indigo-600 text-white font-semibold" :
                  isDone ? "bg-slate-700 text-slate-400" :
                  "text-slate-600"
                }`}>
                  {step.replace(/_/g, " ")}
                </div>
                {i < pipelineSteps.length - 1 && <span className="text-slate-700 text-xs">›</span>}
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto border-b border-slate-800 -mb-4 -mx-6 px-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm px-4 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-400 font-medium"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <OperationsTripOverview booking={booking} customer={customer} canViewPII={canViewPII} />
            <OperationsAssignment booking={booking} currentUser={currentUser} onMutation={handleMutation} />
            {booking.requiresPermit && (
              <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm">⚠ Permit Attention Required</p>
                  <p className="text-amber-500 text-xs mt-0.5">This itinerary includes permit-sensitive destinations. Verify all permits before confirmation.</p>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "itinerary" && <OperationsItinerary booking={booking} currentUser={currentUser} onMutation={handleMutation} />}
        {activeTab === "verification" && (
          <div className="space-y-6">
            <OperationsAccommodation booking={booking} currentUser={currentUser} onMutation={handleMutation} />
            <OperationsTransportation booking={booking} currentUser={currentUser} onMutation={handleMutation} />
            <OperationsPermitPanel booking={booking} currentUser={currentUser} onMutation={handleMutation} />
            <OperationsRealtimePanel booking={booking} currentUser={currentUser} onMutation={handleMutation} />
          </div>
        )}
        {activeTab === "quote" && <OperationsQuotePanel booking={booking} currentUser={currentUser} onMutation={handleMutation} />}
        {activeTab === "proposal" && <OperationsProposalPanel booking={booking} currentUser={currentUser} onMutation={handleMutation} />}
        {activeTab === "finance" && <OperationsFinancePanel booking={booking} currentUser={currentUser} onMutation={handleMutation} />}
        {activeTab === "notes" && <OperationsNotes booking={booking} currentUser={currentUser} onMutation={handleMutation} />}
        {activeTab === "timeline" && <OperationsActivityTimeline booking={booking} />}
        {activeTab === "audit" && <OperationsAuditLog booking={booking} currentUser={currentUser} />}
      </div>

      {/* Confirmation Gate — Sticky Footer */}
      <OperationsConfirmationGate booking={booking} currentUser={currentUser} onMutation={handleMutation} />
    </div>
  );
}
