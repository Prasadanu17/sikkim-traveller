/**
 * Operations Permit Panel — Module 10
 * Permit record management. Only authorized staff can change permit status.
 * AI cannot mark permits as APPROVED.
 */
import { useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { PERMIT_STATUSES } from "../../services/operations/operationsContextService";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { updatePermit } from "../../services/operations/operationsBookingService";

const STATUS_COLORS = {
  NOT_REQUIRED:       "bg-slate-700 text-slate-300",
  REQUIRED:           "bg-amber-900 text-amber-300",
  DOCUMENTS_PENDING:  "bg-amber-900 text-amber-300",
  APPLICATION_PENDING:"bg-blue-900 text-blue-300",
  SUBMITTED:          "bg-blue-900 text-blue-300",
  UNDER_REVIEW:       "bg-indigo-900 text-indigo-300",
  APPROVED:           "bg-green-900 text-green-300",
  REJECTED:           "bg-red-900 text-red-300"
};

export default function OperationsPermitPanel({ booking, currentUser, onMutation }) {
  const canUpdate = hasPermission(currentUser?.role, "canUpdatePermit");
  const permits = booking.permits || [];

  if (!booking.requiresPermit || permits.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <h2 className="text-slate-200 font-semibold text-sm">Permits</h2>
        </div>
        <p className="text-slate-500 text-sm">No permit-sensitive destinations detected for this booking.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h2 className="text-slate-200 font-semibold text-sm">⚠ Permit Management</h2>
        <span className="ml-auto text-xs text-amber-400">{permits.filter(p => ["REQUIRED","DOCUMENTS_PENDING","APPLICATION_PENDING"].includes(p.status)).length} unresolved</span>
      </div>
      <div className="divide-y divide-slate-800/60">
        {permits.map(permit => (
          <PermitRow key={permit.id} permit={permit} bookingId={booking.id} canUpdate={canUpdate} currentUser={currentUser} onMutation={onMutation} />
        ))}
      </div>
    </div>
  );
}

function PermitRow({ permit, bookingId, canUpdate, currentUser, onMutation }) {
  const [editMode, setEditMode] = useState(false);
  const [updates, setUpdates] = useState({
    status: permit.status,
    applicationStatus: permit.applicationStatus || "NOT_STARTED",
    submissionDate: permit.submissionDate || "",
    referenceNumber: permit.referenceNumber || "",
    notes: permit.notes || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    updatePermit(bookingId, permit.id, { ...updates, destination: permit.destination }, currentUser?.id, currentUser?.role, currentUser?.name);
    setSaving(false);
    setEditMode(false);
    onMutation?.();
  };

  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-200 font-medium text-sm">{permit.label}</p>
          <p className="text-slate-500 text-xs">{permit.type} · {permit.destination}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[permit.status] || STATUS_COLORS.REQUIRED}`}>
            {permit.status?.replace(/_/g, " ")}
          </span>
          {canUpdate && (
            <button onClick={() => setEditMode(v => !v)} className="text-xs text-indigo-400 hover:text-indigo-300 underline">
              {editMode ? "Cancel" : "Update"}
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-500">
        <span className="font-medium text-slate-400">Documents Required:</span>{" "}
        {permit.documentsRequired?.join(", ") || "—"}
      </div>

      {permit.referenceNumber && (
        <div className="text-xs text-slate-400">Reference: <span className="text-slate-300">{permit.referenceNumber}</span></div>
      )}

      {editMode && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-xs text-amber-400">⚠ Only authorized staff can update permit status. APPROVED status requires official confirmation.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Status</label>
              <select value={updates.status} onChange={e => setUpdates(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                {PERMIT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Submission Date</label>
              <input type="date" value={updates.submissionDate} onChange={e => setUpdates(p => ({ ...p, submissionDate: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Reference Number</label>
              <input type="text" value={updates.referenceNumber} onChange={e => setUpdates(p => ({ ...p, referenceNumber: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Notes</label>
              <input type="text" value={updates.notes} onChange={e => setUpdates(p => ({ ...p, notes: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors">
            {saving ? "Saving..." : "Save Permit Update"}
          </button>
        </div>
      )}
    </div>
  );
}
