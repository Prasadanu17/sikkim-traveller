/**
 * Customer Permit Center Component — Module 14
 * Dedicated destination permit tracking center displaying required PAP/RAP permits,
 * document submission status, application progress, and pending approval warnings.
 */

import { useState } from "react";
import { ShieldCheck, FileCheck, Clock, AlertTriangle, Upload, Check, Info } from "lucide-react";
import { getBookingPermitStatus, PERMIT_STATUSES } from "../../services/customer/customerPermitService";

export default function CustomerPermitCenter({ booking }) {
  const permitData = getBookingPermitStatus(booking);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [uploadNotice, setUploadNotice] = useState(null);

  const handleUpload = (permitId, docName) => {
    setUploadedDocs(prev => ({
      ...prev,
      [`${permitId}_${docName}`]: true
    }));
    setUploadNotice(`Document "${docName}" uploaded successfully for permit ${permitId}.`);
    setTimeout(() => setUploadNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Destination Permit Center</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Sikkim high-altitude & border regions (Nathula, Lachung, Yumthang, Zuluk) require Protected Area Permits (PAP). Track application progress and upload documents below.
          </p>
        </div>

        <div className="shrink-0">
          {permitData.isAllApproved ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> All Permits Approved
            </span>
          ) : permitData.hasPendingDocs ? (
            <span className="px-3.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Action Required: Docs Needed
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" /> Applications Processing
            </span>
          )}
        </div>
      </div>

      {/* Warnings & Advisories */}
      {permitData.warnings.length > 0 && (
        <div className="space-y-2">
          {permitData.warnings.map((w, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${w.severity === "URGENT" ? "bg-rose-950/30 border-rose-800/40 text-rose-200" : "bg-amber-950/30 border-amber-800/40 text-amber-200"}`}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {uploadNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" /> {uploadNotice}
        </div>
      )}

      {/* Permit List Cards */}
      <div className="space-y-4">
        {permitData.permits.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-2 text-slate-500">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-slate-400 text-sm font-medium">No restricted permits required for this itinerary.</p>
            <p className="text-slate-600 text-xs">Standard Sikkim destinations (Gangtok, Pelling, Namchi) do not require PAP permits for Indian nationals.</p>
          </div>
        ) : (
          permitData.permits.map(permit => (
            <div key={permit.permitId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{permit.destinationName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-bold">
                      {permit.permitType}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 font-mono">ID: {permit.permitId}</p>
                </div>

                <PermitStatusBadge status={permit.status} />
              </div>

              {/* Document Checklist */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-400" /> Required Document Checklist
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permit.docsRequired.map((doc, i) => {
                    const isUploaded = uploadedDocs[`${permit.permitId}_${doc}`] || permit.status === PERMIT_STATUSES.APPROVED;
                    return (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <span className={isUploaded ? "text-emerald-300 line-through" : "text-slate-300"}>{doc}</span>
                        {isUploaded ? (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Uploaded
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpload(permit.permitId, doc)}
                            className="text-[10px] px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 transition-colors"
                          >
                            <Upload className="w-3 h-3" /> Upload
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Notice */}
              {permit.issuedPassNumber && (
                <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between font-mono">
                  <span>Pass #: {permit.issuedPassNumber}</span>
                  <span>Valid Until: {permit.validUntil || "Trip End"}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Official Sikkim Tourism Guideline:</strong> Protected Area Permits (PAP) are issued by the Sikkim Police / Tourism Department 24–48 hours prior to high-altitude travel. Original photo IDs must be carried during travel.
        </p>
      </div>
    </div>
  );
}

function PermitStatusBadge({ status }) {
  const styles = {
    [PERMIT_STATUSES.APPROVED]: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
    [PERMIT_STATUSES.PROCESSING]: "bg-indigo-950/80 text-indigo-300 border-indigo-800/60 animate-pulse",
    [PERMIT_STATUSES.DOCUMENTS_PENDING]: "bg-amber-950/80 text-amber-300 border-amber-800/60",
    [PERMIT_STATUSES.REJECTED]: "bg-rose-950/80 text-rose-300 border-rose-800/60"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles[PERMIT_STATUSES.DOCUMENTS_PENDING]}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
