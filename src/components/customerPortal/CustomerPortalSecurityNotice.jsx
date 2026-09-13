/**
 * Customer Portal Security Notice — Module 11
 * Informs travelers of secure access parameters and data isolation.
 */
import { ShieldCheck, Info } from "lucide-react";

export default function CustomerPortalSecurityNotice() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex gap-3 text-xs text-slate-500">
      <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-slate-400">Security & Privacy Guard</p>
        <p className="leading-relaxed">
          Your session is protected via token-based verification and isolated specifically to your booking request scope. Personally Identifiable Information (PII) is encrypted. Support documents are served via temporary, authenticated URLs. To terminate your active session, click log out in the header.
        </p>
      </div>
    </div>
  );
}
