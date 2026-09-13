import { Phone, Mail, MessageCircle, Clock, ShieldCheck } from "lucide-react";

export default function CustomerSupportCard() {
  const supportPhone = "+91 98000 12345";
  const emergencyPhone = "+91 3592 202020";
  const supportEmail = "concierge@sikkimtraveller.com";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 text-slate-100">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <Phone className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Direct Travel Support</h3>
          <p className="text-[11px] text-slate-400">Official Sikkim Concierge Channels</p>
        </div>
      </div>

      {/* Support list */}
      <div className="space-y-2.5 text-xs">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/919800012345?text=Hello%20Sikkim%20Traveller%20Desk,%20I%20have%20an%20inquiry%20regarding%20my%20trip.`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between text-slate-200 group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold group-hover:text-emerald-300">WhatsApp Concierge</div>
              <div className="text-[11px] text-slate-400">{supportPhone}</div>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800">
            Instant
          </span>
        </a>

        {/* Emergency Helpline */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold">24/7 Operations Desk</div>
              <div className="text-[11px] text-slate-400">{emergencyPhone}</div>
            </div>
          </div>
          <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800">
            24/7
          </span>
        </div>

        {/* Email */}
        <a
          href={`mailto:${supportEmail}`}
          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between text-slate-200 group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold group-hover:text-cyan-300">Email Support</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{supportEmail}</div>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800">
            Email
          </span>
        </a>
      </div>

      {/* Operating Hours info */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Desk Hours: 9:00 AM – 8:30 PM IST</span>
        </div>
        <span className="text-slate-500">Gangtok Office</span>
      </div>
    </div>
  );
}
