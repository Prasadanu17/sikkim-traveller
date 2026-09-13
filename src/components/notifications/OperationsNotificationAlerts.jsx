/**
 * Operations Notification Alerts Component — Module 13
 * High-priority alert banner for delivery failures, retry threshold warnings,
 * and unread urgent customer notifications.
 */

import { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle, RotateCcw } from "lucide-react";
import { getNotificationQueue } from "../../services/notifications/notificationQueueService";
import { retryNotification } from "../../services/notifications/notificationRetryService";
import NotificationChannelBadge from "./NotificationChannelBadge";

export default function OperationsNotificationAlerts({ currentUser, onMutation }) {
  const [failedAlerts, setFailedAlerts] = useState([]);
  const [retryingId, setRetryingId] = useState(null);

  const reload = () => {
    const queue = getNotificationQueue();
    const failures = queue.filter(n => n.status === "FAILED" || n.status === "ABANDONED");
    setFailedAlerts(failures);
  };

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 5000);
    return () => clearInterval(interval);
  }, []);

  if (failedAlerts.length === 0) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-emerald-300 font-semibold text-sm">Communication Pipeline Healthy</p>
            <p className="text-emerald-500 text-xs">All outbound customer messages across Email, WhatsApp, and SMS are delivering cleanly.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleRetry = async (notificationId) => {
    setRetryingId(notificationId);
    await retryNotification(notificationId, currentUser?.name || "Staff");
    setRetryingId(null);
    reload();
    onMutation?.();
  };

  return (
    <div className="bg-rose-950/30 border border-rose-800/40 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-rose-200">
            ⚠️ Communication Delivery Failures ({failedAlerts.length})
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        {failedAlerts.map(item => (
          <div key={item.notificationId || item.id} className="p-3 bg-slate-900 border border-rose-900/40 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <NotificationChannelBadge channel={item.channel} />
                <span className="font-mono text-slate-300 font-semibold">{item.requestId}</span>
                <span className="text-slate-500 text-[11px]">{item.recipient?.name}</span>
              </div>
              <p className="text-slate-300 truncate">{item.renderedContent?.subject}</p>
              <p className="text-rose-400 text-[11px] italic">Error: {item.failureReason || "Provider unreachable"}</p>
            </div>

            <button
              onClick={() => handleRetry(item.notificationId)}
              disabled={retryingId === item.notificationId}
              className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded-lg font-medium text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <RotateCcw className={`w-3 h-3 ${retryingId === item.notificationId ? "animate-spin" : ""}`} />
              {retryingId === item.notificationId ? "Retrying..." : "Retry Delivery"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
