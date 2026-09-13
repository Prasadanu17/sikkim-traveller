/**
 * Operations Assignment — Module 10
 * Staff assignment with role-based restrictions.
 */
import { useState } from "react";
import { UserCheck } from "lucide-react";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { assignBooking } from "../../services/operations/operationsBookingService";

const MOCK_STAFF = [
  { id: "ankit-001", name: "Ankit Kumar", role: "TRAVEL_OPERATOR" },
  { id: "meera-001", name: "Meera Devi", role: "TRAVEL_OPERATOR" },
  { id: "rohan-001", name: "Rohan Singh", role: "SALES" },
  { id: "priya-001", name: "Priya Gupta", role: "OPERATIONS_MANAGER" }
];

export default function OperationsAssignment({ booking, currentUser, onMutation }) {
  const [selectedStaff, setSelectedStaff] = useState(booking.assignedTo || "");
  const [saving, setSaving] = useState(false);

  const canAssign = hasPermission(currentUser?.role, "canAssignStaff");

  const handleAssign = () => {
    if (!selectedStaff) return;
    setSaving(true);
    const staff = MOCK_STAFF.find(s => s.name === selectedStaff);
    assignBooking(booking.id, selectedStaff, staff?.role || "TRAVEL_OPERATOR", currentUser?.id, currentUser?.role, currentUser?.name);
    setSaving(false);
    onMutation?.();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
        <UserCheck className="w-4 h-4" /> Staff Assignment
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <InfoRow label="Assigned Operator" value={booking.assignedTo || "Unassigned"} />
        <InfoRow label="Sales" value={booking.assignedSales || "Unassigned"} />
        <InfoRow label="Operations" value={booking.assignedOperations || "Unassigned"} />
      </div>
      {canAssign && (
        <div className="flex gap-2 flex-wrap items-center pt-1">
          <select
            value={selectedStaff}
            onChange={e => setSelectedStaff(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select operator...</option>
            {MOCK_STAFF.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role.replace(/_/g," ")})</option>)}
          </select>
          <button
            onClick={handleAssign}
            disabled={!selectedStaff || saving}
            className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition-colors"
          >
            {saving ? "Assigning..." : "Assign"}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-slate-200 mt-0.5">{value}</p>
    </div>
  );
}
