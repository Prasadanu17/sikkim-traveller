/**
 * Customer Portal Empty State — Module 11
 * Displays error screens for unauthorized, not found, or session expired events.
 */
import { ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";

export default function CustomerPortalEmptyState({ title = "No Trip Found", message = "We could not locate this booking request in our operations database.", onRetry, onBack }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-6 shadow-xl">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-red-950/40 border border-red-800/40 rounded-full flex items-center justify-center text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
          <p className="text-slate-400 text-xs max-w-xs">{message}</p>
        </div>

        <div className="flex gap-2 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Syncing Again
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl transition-all font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Access Another Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
