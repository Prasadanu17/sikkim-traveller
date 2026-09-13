/**
 * Customer Support — Module 11
 * Contact help channels for travelers. Reuses messaging and change adjustments hooks.
 */
import { MessageSquare, PhoneCall, HelpCircle, FileClock } from "lucide-react";

export default function CustomerSupport({ onNavigate }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-slate-200 font-semibold text-sm">Customer Support Channels</h2>
        <p className="text-slate-500 text-xs mt-0.5">Contact the Sikkim Traveller operations desk directly.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <button
          onClick={() => onNavigate("messages")}
          className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-700 rounded-xl transition-all text-left"
        >
          <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <p className="font-semibold text-slate-250">Chat Operations Desk</p>
            <p className="text-slate-500 mt-0.5 text-[11px]">Send a direct text message</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("proposal")}
          className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 hover:border-slate-700 rounded-xl transition-all text-left"
        >
          <FileClock className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <p className="font-semibold text-slate-250">Request Change</p>
            <p className="text-slate-500 mt-0.5 text-[11px]">Modify itinerary, stays, or dates</p>
          </div>
        </button>

        <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-left">
          <PhoneCall className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="font-semibold text-slate-250">Operations Helpline</p>
            <p className="text-slate-500 mt-0.5 text-[11px]">+91 3592 202608 (10 AM - 6 PM)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-left">
          <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <p className="font-semibold text-slate-250">Email Support</p>
            <p className="text-slate-500 mt-0.5 text-[11px]">operations@sikkimtraveller.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
