/**
 * Notification Center Component — Module 13
 * Comprehensive customer-facing notification center with filtering (All, Booking, Payment, Travel, Permit, Reminders),
 * mark-as-read controls, relative timestamps, and deep-linking into portal sections.
 */

import { useState, useEffect } from "react";
import { Bell, CheckCheck, SlidersHorizontal, Info } from "lucide-react";
import NotificationCard from "./NotificationCard";
import { getNotificationQueue, markQueueNotificationRead, markAllQueueNotificationsRead } from "../../services/notifications/notificationQueueService";
import { NOTIFICATION_STATUSES } from "../../services/notifications/notificationContextService";

const FILTER_TABS = [
  { id: "ALL", label: "All" },
  { id: "BOOKING", label: "Bookings" },
  { id: "PAYMENT", label: "Payments" },
  { id: "TRAVEL", label: "Travel Alerts" },
  { id: "PERMIT", label: "Permits" },
  { id: "REMINDER", label: "Reminders" }
];

export default function NotificationCenter({ customerId, onNavigateToSection, onOpenPreferences }) {
  const [filter, setFilter] = useState("ALL");
  const [notifications, setNotifications] = useState([]);

  const reload = () => {
    const queue = getNotificationQueue();
    const filtered = customerId ? queue.filter(n => !n.customerId || n.customerId === customerId) : queue;
    setNotifications(filtered);
  };

  useEffect(() => {
    reload();
  }, [customerId]);

  const filteredList = notifications.filter(n => {
    if (filter === "ALL") return true;
    const evt = n.eventType || "";
    if (filter === "BOOKING") return evt.includes("BOOKING") || evt.includes("PROPOSAL") || evt.includes("QUOTE");
    if (filter === "PAYMENT") return evt.includes("PAYMENT") || evt.includes("INVOICE");
    if (filter === "TRAVEL") return evt.includes("ALERT") || evt.includes("WEATHER") || evt.includes("ROAD");
    if (filter === "PERMIT") return evt.includes("PERMIT");
    if (filter === "REMINDER") return evt.includes("REMINDER") || evt.includes("TRIP");
    return true;
  });

  const unreadCount = notifications.filter(n => n.status !== NOTIFICATION_STATUSES.READ).length;

  const handleMarkRead = (id) => {
    markQueueNotificationRead(id);
    reload();
  };

  const handleMarkAllRead = () => {
    markAllQueueNotificationsRead(customerId);
    reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Stay updated on booking confirmations, payment receipts, travel advisories, and permit statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all font-medium"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark All as Read
            </button>
          )}

          {onOpenPreferences && (
            <button
              onClick={onOpenPreferences}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all font-medium"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Preferences
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-xs px-4 py-2 rounded-xl border transition-all whitespace-nowrap font-medium ${
              filter === tab.id
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Development / Mock Simulation Notice */}
      <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-indigo-300">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong className="text-indigo-200 font-semibold">DEVELOPMENT SIMULATION MODE:</strong> Multi-channel delivery (Email, WhatsApp, In-App) is simulated in your browser store.
        </span>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">No notifications in this category.</p>
            <p className="text-slate-600 text-xs">When new travel updates or payment receipts arrive, they will appear here.</p>
          </div>
        ) : (
          filteredList.map(n => (
            <NotificationCard
              key={n.notificationId || n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onNavigate={onNavigateToSection}
            />
          ))
        )}
      </div>
    </div>
  );
}
