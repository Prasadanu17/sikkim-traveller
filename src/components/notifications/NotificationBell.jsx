/**
 * Notification Bell Component — Module 13
 * Header icon button showing unread notification counter badge and dropdown popover.
 */

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, SlidersHorizontal, ArrowRight } from "lucide-react";
import NotificationCard from "./NotificationCard";
import { getNotificationQueue, markQueueNotificationRead, markAllQueueNotificationsRead } from "../../services/notifications/notificationQueueService";
import { NOTIFICATION_STATUSES } from "../../services/notifications/notificationContextService";

export default function NotificationBell({ customerId, onOpenFullCenter, onOpenPreferences }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const reloadNotifications = () => {
    const all = getNotificationQueue();
    const filtered = customerId ? all.filter(n => !n.customerId || n.customerId === customerId) : all;
    setNotifications(filtered);
  };

  useEffect(() => {
    reloadNotifications();
    const interval = setInterval(reloadNotifications, 5000);
    return () => clearInterval(interval);
  }, [customerId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.status !== NOTIFICATION_STATUSES.READ).length;
  const recentNotifications = notifications.slice(0, 4);

  const handleMarkRead = (id) => {
    markQueueNotificationRead(id);
    reloadNotifications();
  };

  const handleMarkAllRead = () => {
    markAllQueueNotificationsRead(customerId);
    reloadNotifications();
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-md shadow-indigo-900/50 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/80 z-50 overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {onOpenPreferences && (
                <button
                  onClick={() => { setOpen(false); onOpenPreferences(); }}
                  className="p-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Notification settings"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="p-3 space-y-2 overflow-y-auto flex-1 divide-y divide-slate-900">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2 text-slate-500">
                <Bell className="w-6 h-6 mx-auto text-slate-600" />
                <p className="text-xs">No notifications yet.</p>
              </div>
            ) : (
              recentNotifications.map(n => (
                <NotificationCard
                  key={n.notificationId || n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {onOpenFullCenter && (
            <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-center">
              <button
                onClick={() => { setOpen(false); onOpenFullCenter(); }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
              >
                Open Notification Center <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
