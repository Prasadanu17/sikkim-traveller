/**
 * Operations Transportation — Module 10
 * Transport verification and driver assignment. Driver PII only shown to authorized roles.
 */
import { useState } from "react";
import { Plus } from "lucide-react";
import { TRANSPORT_VERIFY_STATUSES } from "../../services/operations/operationsContextService";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { updateTransportation } from "../../services/operations/operationsBookingService";

const STATUS_COLORS = {
  NOT_CHECKED: "bg-slate-700 text-slate-300",
  CHECKING: "bg-blue-900 text-blue-300",
  AVAILABLE: "bg-emerald-900 text-emerald-300",
  UNAVAILABLE: "bg-red-900 text-red-300",
  ASSIGNED: "bg-indigo-900 text-indigo-300",
  CONFIRMED: "bg-green-900 text-green-300"
};

export default function OperationsTransportation({ booking, currentUser, onMutation }) {
  const [newStatus, setNewStatus] = useState(booking.transportation?.verificationStatus || "NOT_CHECKED");
  const [showAddOption, setShowAddOption] = useState(false);
  const [showDriver, setShowDriver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [option, setOption] = useState({ vehicleType: "", category: "", route: "", estimatedCost: "", provider: "", notes: "" });
  const [driver, setDriver] = useState({ name: "", phone: "", vehicle: "", vehicleNumber: "", permitStatus: "VALID" });

  const canVerify = hasPermission(currentUser?.role, "canVerifyTransport");
  const canViewDriverPII = hasPermission(currentUser?.role, "canViewDriverPII");
  const trans = booking.transportation;

  const handleSave = () => {
    setSaving(true);
    const optData = showAddOption && option.vehicleType ? option : null;
    const driverData = showDriver && driver.name ? driver : null;
    updateTransportation(booking.id, newStatus, optData, driverData, currentUser?.id, currentUser?.role, currentUser?.name);
    setSaving(false);
    setShowAddOption(false);
    setShowDriver(false);
    onMutation?.();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm">Transportation Verification</h2>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[trans?.verificationStatus] || STATUS_COLORS.NOT_CHECKED}`}>
          {trans?.verificationStatus?.replace(/_/g, " ") || "NOT CHECKED"}
        </span>
      </div>
      <div className="p-5 space-y-5">
        {/* Customer Preference */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Customer Preference</p>
          <div className="space-y-1 text-sm">
            <InfoRow label="Preferred Modes" value={trans?.preference?.preferredModes?.join(", ") || "—"} />
            <InfoRow label="Comfort" value={trans?.preference?.comfort || "—"} />
            <InfoRow label="Long Drive Tolerance" value={trans?.preference?.longDriveTolerance || "—"} />
            {booking.requires4WD && (
              <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2 text-amber-300 text-xs mt-2">
                ⚠ 4WD vehicle required for this route
              </div>
            )}
          </div>
        </div>

        {/* Verification Controls */}
        {canVerify && (
          <div className="space-y-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {TRANSPORT_VERIFY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              <button onClick={() => setShowAddOption(v => !v)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors">
                <Plus className="w-3 h-3" /> Add Vehicle
              </button>
              <button onClick={() => setShowDriver(v => !v)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors">
                <Plus className="w-3 h-3" /> Assign Driver
              </button>
              <button onClick={handleSave} disabled={saving} className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {showAddOption && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "vehicleType", label: "Vehicle Type" },
                  { key: "category", label: "Category (SUV, Sedan...)" },
                  { key: "route", label: "Route" },
                  { key: "estimatedCost", label: "Estimated Cost (₹)" },
                  { key: "provider", label: "Provider / Vendor" },
                  { key: "notes", label: "Notes" }
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-slate-500 block mb-1">{f.label}</label>
                    <input type="text" value={option[f.key]} onChange={e => setOption(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                ))}
              </div>
            )}

            {showDriver && (
              <div className="bg-slate-800/60 border border-indigo-900/40 rounded-xl p-4 space-y-3">
                <p className="text-xs text-slate-400">Driver contact information is only visible to authorized staff and is never shared publicly.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "name", label: "Driver Name" },
                    { key: "phone", label: "Driver Phone" },
                    { key: "vehicle", label: "Vehicle" },
                    { key: "vehicleNumber", label: "Vehicle Number" },
                    { key: "permitStatus", label: "Permit Status" }
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-slate-500 block mb-1">{f.label}</label>
                      <input type="text" value={driver[f.key]} onChange={e => setDriver(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Driver Info (PII protected) */}
        {trans?.driver && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Assigned Driver</p>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm space-y-1">
              <InfoRow label="Name" value={canViewDriverPII ? trans.driver.name : "•••••"} />
              <InfoRow label="Phone" value={canViewDriverPII ? trans.driver.phone : "•••• •••• ••••"} />
              <InfoRow label="Vehicle" value={trans.driver.vehicle || "—"} />
              <InfoRow label="Vehicle No." value={canViewDriverPII ? (trans.driver.vehicleNumber || "—") : "•••••"} />
              <InfoRow label="Permit Status" value={trans.driver.permitStatus || "—"} />
              {!canViewDriverPII && <p className="text-slate-600 text-xs italic mt-2">Contact details hidden. Request elevated access to view.</p>}
            </div>
          </div>
        )}

        {/* Vehicle Options */}
        {trans?.options?.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Vehicle Options</p>
            {trans.options.map((opt, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm space-y-1">
                <p className="text-slate-200 font-medium">{opt.vehicleType} — {opt.category}</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                  {opt.route && <span>Route: {opt.route}</span>}
                  {opt.estimatedCost && <span>₹{Number(opt.estimatedCost).toLocaleString("en-IN")}</span>}
                  {opt.provider && <span>Provider: {opt.provider}</span>}
                </div>
                {opt.notes && <p className="text-slate-500 text-xs italic">{opt.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300">{value}</span>
    </div>
  );
}
