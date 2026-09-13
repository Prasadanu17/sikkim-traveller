/**
 * Operations Dashboard — Module 10
 * Main layout container for the internal travel operations command center.
 * Handles internal routing between Inbox, Detail, Calendar, Alerts, and AI views.
 */
import { useState, useEffect, useCallback } from "react";
import OperationsSidebar from "./OperationsSidebar";
import OperationsStats from "./OperationsStats";
import OperationsBookingInbox from "./OperationsBookingInbox";
import OperationsBookingDetail from "./OperationsBookingDetail";
import OperationsCalendar from "./OperationsCalendar";
import OperationsAlerts from "./OperationsAlerts";
import OperationsAI from "./OperationsAI";

import OperationsCommunicationPanel from "../notifications/OperationsCommunicationPanel";
import OperationsNotificationQueue from "../notifications/OperationsNotificationQueue";
import OperationsNotificationAlerts from "../notifications/OperationsNotificationAlerts";

import { initializeMockDataIfNeeded, loadMockBookings } from "../../services/operations/operationsFallbackService";
import { generateDashboardStats, generateOperationsAlerts } from "../../services/operations/operationsAlertService";
import { getCurrentMockUser } from "../../services/operations/operationsPermissionService";
import { STATUS_TAILWIND } from "../../services/operations/operationsStatusService";

const VIEWS = {
  DASHBOARD: "DASHBOARD",
  INBOX: "INBOX",
  DETAIL: "DETAIL",
  CALENDAR: "CALENDAR",
  ALERTS: "ALERTS",
  COMMUNICATIONS: "COMMUNICATIONS",
  AI: "AI"
};

export default function OperationsDashboard() {
  const [activeView, setActiveView] = useState(VIEWS.DASHBOARD);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentUser = getCurrentMockUser();

  const refreshData = useCallback(() => {
    const data = loadMockBookings();
    setBookings(data);
    setStats(generateDashboardStats(data));
    setAlerts(generateOperationsAlerts(data));
  }, []);

  useEffect(() => {
    initializeMockDataIfNeeded();
    refreshData();
  }, [refreshData]);

  const handleOpenDetail = (bookingId) => {
    setSelectedBookingId(bookingId);
    setActiveView(VIEWS.DETAIL);
  };

  const handleBackToInbox = () => {
    setSelectedBookingId(null);
    setActiveView(VIEWS.INBOX);
    refreshData();
  };

  const handleNavigate = (view) => {
    if (view !== VIEWS.DETAIL) setSelectedBookingId(null);
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <OperationsSidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        views={VIEWS}
        currentUser={currentUser}
        alertCount={alerts.filter(a => a.severity === "URGENT").length}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
        {/* Dev Mode Banner */}
        <div className="bg-amber-500 text-amber-950 text-xs font-bold px-4 py-1.5 text-center tracking-widest shrink-0">
          ⚠ DEVELOPMENT MODE — Mock data only. Not connected to production. All confirmations & communications are simulated.
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeView === VIEWS.DASHBOARD && (
            <DashboardHome
              stats={stats}
              alerts={alerts}
              bookings={bookings}
              onViewInbox={() => handleNavigate(VIEWS.INBOX)}
              onViewAlerts={() => handleNavigate(VIEWS.ALERTS)}
              onOpenDetail={handleOpenDetail}
              onRefresh={refreshData}
            />
          )}
          {activeView === VIEWS.INBOX && (
            <OperationsBookingInbox
              bookings={bookings}
              onOpenDetail={handleOpenDetail}
              onRefresh={refreshData}
              currentUser={currentUser}
            />
          )}
          {activeView === VIEWS.DETAIL && selectedBookingId && (
            <OperationsBookingDetail
              bookingId={selectedBookingId}
              onBack={handleBackToInbox}
              onRefresh={refreshData}
              currentUser={currentUser}
            />
          )}
          {activeView === VIEWS.CALENDAR && (
            <OperationsCalendar
              bookings={bookings}
              onOpenDetail={handleOpenDetail}
            />
          )}
          {activeView === VIEWS.ALERTS && (
            <OperationsAlerts
              alerts={alerts}
              onOpenDetail={handleOpenDetail}
              onRefresh={refreshData}
            />
          )}
          {activeView === VIEWS.COMMUNICATIONS && (
            <div className="p-6 space-y-6">
              <OperationsNotificationAlerts currentUser={currentUser} onMutation={refreshData} />
              <OperationsCommunicationPanel booking={bookings[0]} currentUser={currentUser} onMutation={refreshData} />
              <OperationsNotificationQueue currentUser={currentUser} onMutation={refreshData} />
            </div>
          )}
          {activeView === VIEWS.AI && (
            <OperationsAI
              bookings={bookings}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Home ───────────────────────────────────
function DashboardHome({ stats, alerts, bookings, onViewInbox, onViewAlerts, onOpenDetail, onRefresh }) {
  const urgentAlerts = alerts.filter(a => a.severity === "URGENT");
  const warningAlerts = alerts.filter(a => a.severity === "WARNING");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Operations Command Center</h1>
          <p className="text-slate-400 text-sm mt-0.5">Sikkim Traveller — Internal Operations</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
        >
          <span className="text-base">↻</span> Refresh
        </button>
      </div>

      {/* KPI Stats */}
      <OperationsStats stats={stats} onViewInbox={onViewInbox} />

      {/* Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-widest">🔴 Urgent Alerts</h2>
          {urgentAlerts.map(alert => (
            <div key={alert.id} className="bg-red-950/60 border border-red-800/50 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-red-200 font-medium text-sm">{alert.title}</p>
                <p className="text-red-400 text-xs mt-0.5">{alert.message}</p>
              </div>
              {alert.bookingId && (
                <button
                  onClick={() => onOpenDetail(alert.bookingId)}
                  className="text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-md ml-4 shrink-0"
                >
                  View
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-widest">🟡 Warnings</h2>
          {warningAlerts.slice(0, 3).map(alert => (
            <div key={alert.id} className="bg-amber-950/40 border border-amber-800/40 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-amber-200 font-medium text-sm">{alert.title}</p>
                <p className="text-amber-400 text-xs mt-0.5">{alert.message}</p>
              </div>
              {alert.bookingId && (
                <button
                  onClick={() => onOpenDetail(alert.bookingId)}
                  className="text-xs bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md ml-4 shrink-0"
                >
                  View
                </button>
              )}
            </div>
          ))}
          {warningAlerts.length > 3 && (
            <button onClick={onViewAlerts} className="text-xs text-amber-400 hover:text-amber-300 underline">
              View all {warningAlerts.length} warnings →
            </button>
          )}
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Recent Requests</h2>
          <button onClick={onViewInbox} className="text-xs text-indigo-400 hover:text-indigo-300 underline">View all →</button>
        </div>
        <div className="space-y-2">
          {bookings.slice(0, 5).map(b => (
            <RecentBookingRow key={b.id} booking={b} onOpen={() => onOpenDetail(b.id)} />
          ))}
          {bookings.length === 0 && (
            <p className="text-slate-500 text-sm py-4 text-center">No booking requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentBookingRow({ booking, onOpen }) {
  const badgeClass = STATUS_TAILWIND?.[booking.status] || "bg-slate-700 text-slate-300";

  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg px-4 py-3 transition-all flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-slate-200 text-sm font-medium truncate">{booking.requestId}</p>
          <p className="text-slate-500 text-xs truncate">{booking.customer?.name} · {booking.destinations?.join(" → ")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeClass}`}>
          {booking.status?.replace(/_/g, " ")}
        </span>
        <span className="text-slate-600">›</span>
      </div>
    </button>
  );
}
