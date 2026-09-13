import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Eye, ShieldCheck, X } from "lucide-react";
import { getMockDocumentPreviewContent } from "../../services/customer/customerDocumentService";

export default function CustomerDocuments({ booking }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const documents = booking?.documents || [];

  const handleOpenPreview = (doc) => {
    const previewContent = getMockDocumentPreviewContent(doc, booking);
    setPreviewDoc(previewContent);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Travel Documents</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{documents.length} File{documents.length === 1 ? "" : "s"}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mt-1">
            Trip Vouchers & Itinerary Files
          </h2>
        </div>

        <div className="text-xs text-slate-400">
          Encrypted & verified by Sikkim Travel Operations Desk
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3 text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-600" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-300">No Documents Issued Yet</h4>
            <p className="text-xs max-w-sm mx-auto leading-relaxed">
              Official hotel check-in vouchers, vehicle permits, and finalized PDF itineraries will be published here after proposal confirmation.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-950/60 border-emerald-800/80 text-emerald-300">
                    {doc.status || "READY"}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white leading-tight">
                    {doc.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{doc.version || "v1"}</span>
                    <span>•</span>
                    <span>{doc.date ? new Date(doc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(doc)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPreview(doc)}
                  className="py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo Document Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 relative my-8"
              role="dialog"
            >
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Verified Travel Document Preview
                </span>
                <h3 className="text-xl font-display font-semibold text-white">
                  {previewDoc.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {previewDoc.sampleWatermark}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500">Document Type</span>
                  <span className="text-slate-200 font-semibold">{previewDoc.type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500">Booking Reference</span>
                  <span className="text-amber-400 font-mono font-semibold">{previewDoc.bookingRef}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500">Lead Traveler</span>
                  <span className="text-slate-200 font-semibold">{previewDoc.travelerName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500">Destinations</span>
                  <span className="text-slate-200">{previewDoc.destinations}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500">Travel Period</span>
                  <span className="text-slate-200">{previewDoc.travelDates}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Issuing Authority</span>
                  <span className="text-slate-400 text-right">{previewDoc.issuer}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Verification ID: {booking?.trackingToken}</span>
                <span className="text-emerald-400 font-semibold">✓ Cryptographically Signed</span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
