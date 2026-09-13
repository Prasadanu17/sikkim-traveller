/**
 * Operations Sidebar — Module 10
 * Navigation sidebar for the internal operations command center.
 */
import { Mountain, LayoutDashboard, Inbox, Calendar, Bell, Sparkles, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS } from "../../services/operations/operationsPermissionService";

const NAV_ITEMS = [
  { view: "DASHBOARD", icon: LayoutDashboard, label: "Dashboard" },
  { view: "INBOX", icon: Inbox, label: "Booking Inbox" },
  { view: "CALENDAR", icon: Calendar, label: "Calendar" },
  { view: "ALERTS", icon: Bell, label: "System Alerts", badge: true },
  { view: "COMMUNICATIONS", icon: MessageSquare, label: "Communications" },
  { view: "AI", icon: Sparkles, label: "AI Assistant" }
];

export default function OperationsSidebar({ activeView, onNavigate, views, currentUser, alertCount, sidebarOpen, onToggleSidebar }) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onToggleSidebar} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-30 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${!sidebarOpen && "justify-center px-2"}`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Mountain className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">Operations</p>
              <p className="text-slate-500 text-xs truncate">Sikkim Traveller</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.view || (activeView === "DETAIL" && item.view === "INBOX");
            const showBadge = item.badge && alertCount > 0;

            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                } ${!sidebarOpen && "justify-center"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {showBadge && (
                  <span className={`${sidebarOpen ? "ml-auto" : "absolute -top-1 -right-1"} bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        {currentUser && (
          <div className={`border-t border-slate-800 px-3 py-4 ${!sidebarOpen && "flex justify-center"}`}>
            {sidebarOpen ? (
              <div>
                <p className="text-slate-300 text-sm font-medium truncate">{currentUser.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[currentUser.role] || "bg-slate-700 text-slate-300"}`}>
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>
                {currentUser.isMock && (
                  <p className="text-slate-600 text-xs mt-1">Mock Session</p>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 text-xs font-bold">
                {currentUser.name?.[0] || "U"}
              </div>
            )}
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={onToggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors hidden md:flex"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
