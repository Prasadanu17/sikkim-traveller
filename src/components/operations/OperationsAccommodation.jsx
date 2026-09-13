/**
 * Operations Accommodation — Module 10
 * Accommodation preference display and verification workflow.
 * Operators enter REAL verified data only — never invented properties.
 */
import { useState } from "react";
import { Plus } from "lucide-react";
import { ACCOMMODATION_VERIFY_STATUSES } from "../../services/operations/operationsContextService";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { updateAccommodation } from "../../services/operations/operationsBookingService";

const STATUS_COLORS = {
  NOT_CHECKED: "bg-slate-700 text-slate-300",
  CHECKING: "bg-blue-900 text-blue-300",
  OPTION_AVAILABLE: "bg-emerald-900 text-emerald-300",
  OPTION_UNAVAILABLE: "bg-red-900 text-red-300",
  CUSTOMER_SELECTION_REQUIRED: "bg-amber-900 text-amber-300",
  CONFIRMED: "bg-green-900 text-green-300"
};

export default function OperationsAccommodation({ booking, currentUser, onMutation }) {
  const [newStatus, setNewStatus] = useState(booking.accommodation?.verificationStatus || "NOT_CHECKED");
  const [showAddOption, setShowAddOption] = useState(false);
  const [saving, setSaving] = useState(false);
  const [option, setOption] = useState({
    propertyName: "", location: "", roomType: "", pricePerNight: "", nights: "", taxes: "", availabilityStatus: "AVAILABLE — VERIFIED", notes: "", source: ""
  });

  const canVerify = hasPermission(currentUser?.role, "canVerifyAccommodation");
  const accom = booking.accommodation;

  const handleSave = async () => {
    setSaving(true);
    const optionData = showAddOption && option.propertyName ? option : null;
    updateAccommodation(booking.id, newStatus, optionData, currentUser?.id, currentUser?.role, currentUser?.name);
    setSaving(false);
    setShowAddOption(false);
    setOption({ propertyName: "", location: "", roomType: "", pricePerNight: "", nights: "", taxes: "", availabilityStatus: "AVAILABLE — VERIFIED", notes: "", source: "" });
    onMutation?.();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm">Accommodation Verification</h2>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[accom?.verificationStatus] || STATUS_COLORS.NOT_CHECKED}`}>
          {accom?.verificationStatus?.replace(/_/g, " ") || "NOT CHECKED"}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Customer Preference */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Customer Preference</p>
          <div className="space-y-1 text-sm">
            <InfoRow label="Types" value={accom?.preference?.types?.join(", ") || "—"} />
            <InfoRow label="Comfort" value={accom?.preference?.comfort || "—"} />
            <InfoRow label="Mode" value={accom?.preference?.mode || "—"} />
          </div>
        </div>

        {/* Status Update */}
        {canVerify && (
          <div className="space-y-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider">Update Verification Status</p>
            <div className="flex gap-2 flex-wrap">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {ACCOMMODATION_VERIFY_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddOption(v => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Verified Option
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            {/* Add Option Form */}
            {showAddOption && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <p className="text-xs text-amber-400">⚠ Enter only verified, confirmed property information. Do not invent or estimate.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "propertyName", label: "Property Name *" },
                    { key: "location", label: "Location" },
                    { key: "roomType", label: "Room Type" },
                    { key: "pricePerNight", label: "Price per Night (₹)" },
                    { key: "nights", label: "Number of Nights" },
                    { key: "taxes", label: "Taxes & Fees (₹)" },
                    { key: "availabilityStatus", label: "Availability Status" },
                    { key: "source", label: "Source / Reference" }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={option[field.key]}
                        onChange={e => setOption(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Notes</label>
                  <textarea
                    value={option.notes}
                    onChange={e => setOption(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verified Options */}
        {accom?.options?.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Verified Options</p>
            <div className="space-y-3">
              {accom.options.map((opt, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-slate-200 font-semibold">{opt.propertyName}</p>
                    <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full shrink-0">{opt.availabilityStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                    {opt.location && <span>📍 {opt.location}</span>}
                    {opt.roomType && <span>🛏 {opt.roomType}</span>}
                    {opt.pricePerNight && <span>₹{Number(opt.pricePerNight).toLocaleString("en-IN")}/night</span>}
                    {opt.nights && <span>{opt.nights} nights</span>}
                    {opt.taxes && <span>+₹{Number(opt.taxes).toLocaleString("en-IN")} taxes</span>}
                    {opt.source && <span>Source: {opt.source}</span>}
                  </div>
                  {opt.notes && <p className="text-slate-500 text-xs mt-2 italic">{opt.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-600 italic">
          Note: "OPTION AVAILABLE" does not mean booked. Only a verified reservation confirmation can produce CONFIRMED status.
        </div>
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
