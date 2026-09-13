/**
 * Customer Notifications — Module 11
 * Displays event-based unread notifications with tab-navigation hooks.
 */
import { Bell, ShieldAlert, Check, X } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "../../services/customerPortal/customerPortalNotificationService";

export default function CustomerNotifications({ notifications = [], onNavigate, onMutation }) {
  const unread = notifications.filter(n => !n.read);

  const handleRead = (id) => {
    markNotificationRead(id);
    onMutation?.();
  };

  const handleReadAll = () => {
    markAllNotificationsRead(notifications);
    onMutation?.();
  };

  if (notifications.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Notifications Drawer
        </h2>
        {unread.length > 0 && (
          <button
            onClick={handleReadAll}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-850/60">
        {notifications.map(notif => {
          const isUrgent = notif.priority === "URGENT";
          return (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.section) onNavigate(notif.section);
                handleRead(notif.id);
              }}
              className={`p-4 flex gap-3 items-start justify-between cursor-pointer transition-all hover:bg-slate-800/40 ${
                notif.read ? "opacity-60" : "bg-indigo-950/5 border-l-2 border-indigo-500"
              }`}
            >
              <div className="flex gap-2.5 items-start text-xs leading-relaxed">
                <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${isUrgent ? "text-red-400" : "text-amber-400"}`} />
                <div>
                  <p className={`font-semibold ${notif.read ? "text-slate-400" : "text-slate-200"}`}>{notif.title}</p>
                  <p className="text-slate-400 mt-0.5 text-[11px]">{notif.message}</p>
                  <span className="text-[9px] text-slate-550 block mt-1">
                    {new Date(notif.timestamp).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRead(notif.id);
                  }}
                  title="Mark as read"
                  className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded border border-slate-750 shrink-0"
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
