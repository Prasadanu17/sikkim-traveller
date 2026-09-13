import { ShieldCheck, EyeOff, Server, KeyRound } from "lucide-react";

export default function CustomerSecurityNotice() {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 text-slate-400 space-y-4 text-xs">
      <div className="flex items-center gap-2 text-slate-200 font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Customer Data Protection & Isolation Policy</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Token-Based Access</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Your tracking token strictly isolates your travel records. No shared passwords or vulnerable credentials are required.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
            <span>Privacy Guard</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Customer Personally Identifiable Information (PII) is encrypted. Internal notes and backend audit logs are never exposed.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Authoritative Backend</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All proposal approvals, itinerary mutations, and government permits are cryptographically validated server-side.
          </p>
        </div>
      </div>
    </div>
  );
}
