/**
 * Journey Created Modal Component — Module 17
 * Displays premium confirmation modal after creating a Sikkim journey.
 * Shows the simple 6-step journey timeline and direct dashboard link.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, Share2, ArrowRight, ShieldCheck, MapPin, Calendar, Users, X, Sparkles } from "lucide-react";

const JOURNEY_STEPS = [
  { label: "Trip Created", active: true, done: true },
  { label: "Trip Reviewed", active: true, done: false },
  { label: "Proposal Ready", active: false, done: false },
  { label: "Your Approval", active: false, done: false },
  { label: "Booking Confirmed", active: false, done: false },
  { label: "Ready for Sikkim", active: false, done: false },
];

export default function JourneyCreatedModal({ journeyResult, isOpen, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !journeyResult) return null;

  const { requestId, accessUrl, journeyRecord } = journeyResult;
  const fullUrl = `${window.location.origin}${accessUrl}`;

  const dests = (journeyRecord?.destinations || ["Gangtok"]).map(d => d.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())).join(" → ");
  const startDate = journeyRecord?.trip?.startDate || "Dates TBD";
  const duration = journeyRecord?.trip?.duration || 5;
  const travelerCount = journeyRecord?.traveler?.total || 2;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_err) {
      console.warn("Failed to copy link");
    }
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Sikkim Journey — ${requestId}`,
          text: `Here is our Sikkim travel itinerary and journey dashboard:`,
          url: fullUrl
        });
      } catch (_err) {
        // Ignored
      }
    } else {
      handleCopyLink();
    }
  };

  const handleViewJourney = () => {
    onClose?.();
    navigate(accessUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold block">
              Trip Saved Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Your Sikkim Journey is Ready
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              We've created your personalized journey. Here's what's happening next:
            </p>
          </div>
        </div>

        {/* What Happens Next — 6-Step Journey Timeline */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/90 font-semibold block">
            What Happens Next
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
            {JOURNEY_STEPS.map((s, idx) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    s.done
                      ? "bg-emerald-500 text-slate-950"
                      : s.active
                      ? "bg-amber-400 text-slate-950 ring-2 ring-amber-400/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {s.done ? "✓" : idx + 1}
                </div>
                <span className={`text-[9px] leading-tight ${s.active ? "text-white font-semibold" : "text-slate-500"}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Details Summary Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs text-slate-400">Journey ID</span>
            <span className="font-mono text-amber-400 font-bold text-xs">{requestId}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> Route
              </span>
              <p className="font-semibold text-white truncate">{dests}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" /> Dates
              </span>
              <p className="font-semibold text-white truncate">{startDate} ({duration}D)</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" /> Group
              </span>
              <p className="font-semibold text-white truncate">{travelerCount} Traveler(s)</p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleViewJourney}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Today's Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCopyLink}
              className="py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? "Copied Link" : "Copy Journey Link"}</span>
            </button>

            <button
              onClick={handleShareLink}
              className="py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share Trip</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Private passwordless link. Bookmark to return anytime.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

