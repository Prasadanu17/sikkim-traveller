import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { getDemoTokens } from "../../services/customer/customerPortalFallbackService";

export default function CustomerAccessForm({ onAccess, initialToken = "", error = "" }) {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [localError, setLocalError] = useState(error);
  const [loading, setLoading] = useState(false);
  const isMockMode = import.meta.env.VITE_CUSTOMER_PORTAL_MOCK_MODE !== "false";
  const demoTokens = isMockMode ? getDemoTokens() : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      setLocalError("Please enter your trip tracking token.");
      return;
    }
    setLocalError("");
    setLoading(true);
    try {
      await onAccess(clean);
    } catch (err) {
      setLocalError(err.message || "Unable to locate booking with this tracking token.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (token) => {
    setTokenInput(token);
    setLocalError("");
    onAccess(token);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/50 text-slate-100"
      >
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Travel Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-white">
            Track Your Sikkim Journey
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Enter the unique tracking token provided in your booking confirmation message or email to review proposals and live travel status.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="trackingTokenInput" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Trip Tracking Token
            </label>
            <div className="relative">
              <input
                id="trackingTokenInput"
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setLocalError("");
                }}
                placeholder="e.g. ST-TRK-88219"
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                autoComplete="off"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
          </div>

          {(localError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{localError || error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Access Trip Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Development Demo Records Switcher */}
        {isMockMode && demoTokens.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Development Mode Demo Records</span>
              </span>
              <span className="text-[10px] text-slate-500">Quick Test Selector</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {demoTokens.map((item) => (
                <button
                  key={item.token}
                  type="button"
                  onClick={() => handleSelectDemo(item.token)}
                  className="w-full text-left p-2.5 sm:p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/60 hover:border-amber-500/40 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                        {item.token}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.label}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
