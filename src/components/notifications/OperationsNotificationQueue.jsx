/**
 * Operations Notification Queue Component — Module 13
 * Staff monitoring table for outbound notification queue, delivery statuses,
 * failure reasons, and authorized retry execution.
 */

import { useState, useEffect } from "react";
import { RefreshCw, RotateCcw, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { getNotificationQueue } from "../../services/notifications/notificationQueueService";
import { retryNotification } from "../../services/notifications/notificationRetryService";
import NotificationStatusBadge from "./NotificationStatusBadge";
import NotificationChannelBadge from "./NotificationChannelBadge";

const STATUS_FILTERS = ["ALL", "QUEUED", "DELIVERED", "FAILED", "ABANDONED"];

export default function OperationsNotificationQueue({ currentUser, onMutation }) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [queue, setQueue] = useState([]);
  const [retryingId, setRetryingId] = useState(null);

  const reloadQueue = () => {
    setQueue(getNotificationQueue());
  };

  useEffect(() => {
    reloadQueue();
    const interval = setInterval(reloadQueue, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = queue.filter(item => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const handleRetry = async (notificationId) => {
    setRetryingId(notificationId);
    await retryNotification(notificationId, currentUser?.name || currentUser?.role || "Staff");
    setRetryingId(null);
    reloadQueue();
    onMutation?.();
  };

  return (
    <div className="space-y-5">
      {/* Header & Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Notification & Communication Queue</h2>
          <p className="text-slate-400 text-xs">
            Monitor real-time message delivery across Email, WhatsApp, SMS, and In-App channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                statusFilter === st
                  ? "bg-indigo-600 border-indigo-500 text-white font-medium"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={reloadQueue}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">ID / Request</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Channel / Event</th>
                <th className="px-4 py-3">Subject / Body</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No notification records match the filter.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.notificationId || item.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <p className="text-white font-semibold">{item.notificationId}</p>
                      <p className="text-slate-500">{item.requestId}</p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-slate-200 font-medium">{item.recipient?.name || "Traveler"}</p>
                      <p className="text-slate-500 text-[11px] truncate max-w-[140px]">{item.recipient?.email || item.recipient?.phone || "-"}</p>
                    </td>

                    <td className="px-4 py-3 space-y-1">
                      <NotificationChannelBadge channel={item.channel} />
                      <p className="text-[10px] text-slate-400 font-mono">{item.eventType}</p>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-slate-200 font-medium truncate">{item.renderedContent?.subject}</p>
                      <p className="text-slate-500 text-[11px] truncate">{item.renderedContent?.body}</p>
                      {item.failureReason && (
                        <p className="text-rose-400 text-[10px] italic mt-0.5">⚠️ {item.failureReason}</p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <NotificationStatusBadge status={item.status} />
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {(item.status === "FAILED" || item.status === "RETRY_SCHEDULED") && (
                        <button
                          onClick={() => handleRetry(item.notificationId)}
                          disabled={retryingId === item.notificationId}
                          className="text-xs px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/40 rounded-lg transition-colors font-medium inline-flex items-center gap-1"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === item.notificationId ? "animate-spin" : ""}`} />
                          {retryingId === item.notificationId ? "Retrying..." : "Retry"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
