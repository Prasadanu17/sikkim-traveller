/**
 * Notification Status Badge Component — Module 13
 * Visual status pill for notification lifecycle states.
 */

import { NOTIFICATION_STATUSES } from "../../services/notifications/notificationContextService";

const STATUS_STYLES = {
  [NOTIFICATION_STATUSES.DRAFT]: "bg-slate-800 text-slate-300 border-slate-700",
  [NOTIFICATION_STATUSES.QUEUED]: "bg-blue-950/60 text-blue-300 border-blue-800/40",
  [NOTIFICATION_STATUSES.PROCESSING]: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40 animate-pulse",
  [NOTIFICATION_STATUSES.SENT]: "bg-cyan-950/60 text-cyan-300 border-cyan-800/40",
  [NOTIFICATION_STATUSES.DELIVERED]: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
  [NOTIFICATION_STATUSES.READ]: "bg-slate-900 text-slate-400 border-slate-800",
  [NOTIFICATION_STATUSES.FAILED]: "bg-rose-950/60 text-rose-300 border-rose-800/40",
  [NOTIFICATION_STATUSES.RETRY_SCHEDULED]: "bg-amber-950/60 text-amber-300 border-amber-800/40",
  [NOTIFICATION_STATUSES.ABANDONED]: "bg-red-950/60 text-red-400 border-red-900/40 font-bold"
};

export default function NotificationStatusBadge({ status = "QUEUED" }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.QUEUED;
  const label = status.replace(/_/g, " ");

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold border ${style}`}>
      {label}
    </span>
  );
}
