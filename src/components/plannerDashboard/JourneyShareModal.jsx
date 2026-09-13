/**
 * Journey Share Modal Component — Module 16
 * Displays the customer's direct shareable journey link, Journey ID,
 * and provides one-click copy and share actions.
 */

import { useState } from "react";
import { X, Copy, Check, Share2, ShieldCheck, Link2 } from "lucide-react";
import { generateCustomerJourneyToken } from "../../services/customer/customerSecurityService";

export default function JourneyShareModal({ booking, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const requestId = booking.requestId || booking.id || "ST-REQ-20260823-1042";
  const token = booking.accessToken || generateCustomerJourneyToken(requestId);

  const fullUrl = `${window.location.origin}/trip-planner/dashboard?token=${encodeURIComponent(token)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_err) {
      console.warn("Failed to copy URL to clipboard");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sikkim Journey — ${requestId}`,
          text: `Track and manage our Sikkim trip details here:`,
          url: fullUrl
        });
      } catch (_err) {
        // Share cancelled or unavailable
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Link2 className="w-4 h-4" />
            <span>Direct Journey Access Link</span>
          </div>
          <h3 className="text-xl font-bold text-white">Share Your Sikkim Journey</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Save or share this direct link to return to your journey anytime on any device. Passwordless & secure.
          </p>
        </div>

        {/* Journey ID Badge */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Journey Reference ID</span>
          <p className="font-mono text-amber-400 text-sm font-bold">{requestId}</p>
        </div>

        {/* Direct Link Input & Copy */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Shareable Direct URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={fullUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md shadow-amber-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Scoped strictly to your journey</span>
          </div>

          <button
            onClick={handleNativeShare}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
