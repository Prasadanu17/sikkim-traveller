/**
 * Notification Card Component — Module 13
 * Individual notification item with severity highlight, channel icon, timestamp,
 * action button deep links, and read toggle.
 */

import { Check, ShieldAlert, FileText, CreditCard, Calendar, Sparkles } from "lucide-react";
import NotificationChannelBadge from "./NotificationChannelBadge";
import NotificationStatusBadge from "./NotificationStatusBadge";
import { NOTIFICATION_STATUSES } from "../../services/notifications/notificationContextService";

export default function NotificationCard({ notification, onMarkRead, onNavigate }) {
  if (!notification) return null;

  const isRead = notification.status === NOTIFICATION_STATUSES.READ;
  const isUrgent = notification.eventType?.includes("ALERT") || notification.payload?.priority === "URGENT";

  const getEventIcon = () => {
    const evt = notification.eventType || "";
    if (evt.includes("ALERT") || evt.includes("WEATHER")) return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    if (evt.includes("PAYMENT") || evt.includes("INVOICE")) return <CreditCard className="w-4 h-4 text-emerald-400" />;
    if (evt.includes("PROPOSAL") || evt.includes("QUOTE")) return <FileText className="w-4 h-4 text-indigo-400" />;
    if (evt.includes("TRIP") || evt.includes("REMINDER")) return <Calendar className="w-4 h-4 text-cyan-400" />;
    return <Sparkles className="w-4 h-4 text-indigo-400" />;
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const elapsed = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const mins = Math.floor(elapsed / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isRead
          ? "bg-slate-900/60 border-slate-800/80 text-slate-400 opacity-80"
          : isUrgent
          ? "bg-amber-950/20 border-amber-800/40 text-slate-100 shadow-md shadow-amber-950/10"
          : "bg-slate-900 border-slate-800 text-slate-100 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 shrink-0 mt-0.5">
            {getEventIcon()}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-semibold leading-tight truncate ${isRead ? "text-slate-300" : "text-white"}`}>
                {notification.renderedContent?.subject || notification.subject}
              </h4>

              {notification._isAIDraft && (
                <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/50 px-1.5 py-0.5 rounded font-mono">
                  ✨ AI Draft
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed break-words">
              {notification.renderedContent?.body || notification.body || notification.message}
            </p>

            {/* Sub-meta */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-slate-500">
              <NotificationChannelBadge channel={notification.channel} showLabel={false} />
              <NotificationStatusBadge status={notification.status} />
              <span>•</span>
              <span className="font-mono text-slate-400">{notification.requestId}</span>
              <span>•</span>
              <span>{getRelativeTime(notification.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {!isRead && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification.notificationId)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigate && notification.requestId && (
            <button
              onClick={() => onNavigate(notification)}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/50 font-medium transition-colors"
            >
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
