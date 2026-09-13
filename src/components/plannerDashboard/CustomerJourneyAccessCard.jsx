/**
 * Customer Journey Access Card Component — Passwordless Access Screen
 * Rendered when a customer visits /trip-planner/dashboard without a valid token or active session.
 * Allows passwordless journey access via Journey Token input with zero email/password forms.
 */

import { useState } from "react";
import { Compass, Key, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { getCustomerTrips } from "../../services/planner/plannerDashboardService";
import { generateCustomerJourneyToken } from "../../services/customer/customerSecurityService";

export default function CustomerJourneyAccessCard({ onAuthenticateToken }) {
  const [tokenInput, setTokenInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validating, setValidating] = useState(false);

  // Sample valid mock tokens for quick developer/demo access
  const sampleTrips = getCustomerTrips().slice(0, 3);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      setErrorMsg("Please enter your Journey Token or Access Link.");
      return;
    }

    setValidating(true);
    setErrorMsg("");

    const success = onAuthenticateToken?.(clean);
    setValidating(false);

    if (!success) {
      setErrorMsg("Journey access could not be verified. Please check your token.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold block">
              Sikkim Traveller • Passwordless Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Access Your Sikkim Journey
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Enter your secure Journey Token or Access Link to view your itinerary, permits, status, and AI Concierge.
            </p>
          </div>
        </div>

        {/* Access Form Card */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Journey Access Token
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ST-REQ-20260823-1042-TK89F2A1"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={validating || !tokenInput.trim()}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View My Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>No password required. Scoped to your specific trip.</span>
            </p>
          </div>
        </form>

        {/* Demo Token Shortcuts (Development Mode) */}
        {sampleTrips.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Demo Sample Access Tokens:
            </span>
            <div className="space-y-1.5">
              {sampleTrips.map(trip => {
                const sampleToken = trip.accessToken || generateCustomerJourneyToken(trip.requestId);
                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => {
                      setTokenInput(sampleToken);
                      onAuthenticateToken?.(sampleToken);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left text-slate-300 hover:text-amber-300 font-mono text-[11px] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{sampleToken}</span>
                    <span className="text-[10px] text-slate-500 font-sans shrink-0 ml-2">({trip.customer?.firstName || "Guest"})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
