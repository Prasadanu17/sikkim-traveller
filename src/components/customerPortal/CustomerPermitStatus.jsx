/**
 * Customer Permit Status — Module 11
 * Displays permit verification and documents status.
 * Customers CANNOT independently approve or bypass permit checks.
 */
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function CustomerPermitStatus({ permits = [] }) {
  if (permits.length === 0) return null;

  const getStatusIcon = (status) => {
    if (status === "APPROVED") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === "REQUIRED" || status === "DOCUMENTS_PENDING") return <AlertCircle className="w-4 h-4 text-amber-400" />;
    return <Clock className="w-4 h-4 text-blue-400" />;
  };

  const getStatusLabel = (status) => {
    if (status === "APPROVED") return "Approved";
    if (status === "DOCUMENTS_PENDING") return "Documents Pending";
    if (status === "APPLICATION_PENDING") return "Application Pending";
    if (status === "SUBMITTED" || status === "UNDER_REVIEW") return "Under Review";
    return "Action Needed";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" /> Travel Permits
        </h2>
        <span className="text-[10px] text-slate-500">{permits.length} required</span>
      </div>

      <div className="divide-y divide-slate-850/60 p-5 space-y-4">
        {permits.map((p, idx) => (
          <div key={p.id || idx} className="space-y-2 pt-3 first:pt-0 border-t first:border-0 border-slate-800/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 text-xs font-semibold">{p.label}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-0.5">{p.destination}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {getStatusIcon(p.status)}
                <span className={p.status === "APPROVED" ? "text-emerald-400" : "text-slate-400"}>
                  {getStatusLabel(p.status)}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-400 block mb-0.5">Documents Required:</span>
              {p.documentsRequired?.join(" · ") || "Passport copy & photograph"}
            </div>
          </div>
        ))}
        
        <p className="text-[10px] text-slate-600 italic leading-relaxed pt-2">
          Note: Travel permits are issued by Government border authorities. Approval status is updated here once officially confirmed by our operations team.
        </p>
      </div>
    </div>
  );
}
