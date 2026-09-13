/**
 * Operations Audit Log — Module 10
 * Append-only audit trail. Who / What / When / Before / After.
 * Read-only display — no delete or modify.
 */
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { formatAuditAction } from "../../services/operations/operationsAuditService";

export default function OperationsAuditLog({ booking, currentUser }) {
  const canView = hasPermission(currentUser?.role, "canViewAuditLog");
  const events = [...(booking.auditLog || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (!canView) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        You do not have permission to view the audit log.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Audit Log</h2>
        <span className="text-xs text-slate-600">{events.length} events · Append-only</span>
      </div>

      {events.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">No audit events recorded.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-x-4 px-4 py-2.5 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
            <span>When</span>
            <span>Action</span>
            <span>Before</span>
            <span>After</span>
            <span>By</span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {events.map(ev => (
              <div key={ev.eventId} className="px-4 py-3">
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-x-4 items-start text-sm">
                  <span className="text-slate-500 text-xs whitespace-nowrap">
                    {new Date(ev.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                  <span className="text-slate-200 font-medium">{formatAuditAction(ev.action)}</span>
                  <span className="text-slate-500 text-xs truncate">{ev.previousValue || "—"}</span>
                  <span className="text-slate-300 text-xs truncate">{String(ev.newValue || "—")}</span>
                  <span className="text-slate-500 text-xs whitespace-nowrap">{ev.actorId} ({ev.actorRole})</span>
                </div>
                {/* Mobile */}
                <div className="md:hidden space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-200 text-sm font-medium">{formatAuditAction(ev.action)}</span>
                    <span className="text-slate-500 text-xs">{new Date(ev.timestamp).toLocaleTimeString("en-IN")}</span>
                  </div>
                  <p className="text-slate-500 text-xs">{ev.previousValue || "—"} → {String(ev.newValue || "—")}</p>
                  <p className="text-slate-600 text-xs">by {ev.actorId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
