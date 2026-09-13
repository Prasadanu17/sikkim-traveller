/**
 * Operations Page — Module 10
 * Main router route file. Hosts the authentication boundary.
 * If VITE_OPERATIONS_MOCK_MODE=true: allows dashboard access.
 * If VITE_OPERATIONS_MOCK_MODE=false: enforces access control gate.
 */
import { useState } from "react";
import { ShieldAlert, Key, UserCheck, HelpCircle } from "lucide-react";
import OperationsDashboard from "../components/operations/OperationsDashboard";

export default function OperationsPage() {
  const isMockMode = import.meta.env.VITE_OPERATIONS_MOCK_MODE !== "false";
  const [token, setToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleProdLogin = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please provide an authentication token.");
      return;
    }

    // In a real production deployment, this would perform a secure server-side exchange:
    // fetch("/api/auth/verify-token", { method: "POST", headers: { "Authorization": `Bearer ${token}` } })
    // If ok, stores token in HTTP-only secure cookie or secure app context.
    // Here we show the frontend integration boundary contract:
    setError("Secure production server connection unavailable. Production authentication must be server-side.");
  };

  // If in mock development mode, render dashboard immediately
  if (isMockMode || loggedIn) {
    return <OperationsDashboard />;
  }

  // Otherwise, render production access gate
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Banner */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-red-950/40 border border-red-800/40 rounded-full flex items-center justify-center text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Internal Operations Access</h1>
          <p className="text-slate-400 text-xs max-w-xs">
            Sikkim Traveller Travel Operations Portal. Unauthorized access is strictly prohibited.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleProdLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Operator Security Token</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={token}
                onChange={e => { setToken(e.target.value); setError(""); }}
                placeholder="Enter production token..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" /> Authenticate Session
          </button>
        </form>

        {/* Security Info */}
        <div className="border-t border-slate-800/60 pt-4 flex gap-2 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-400">Security & PII Protection Policy</p>
            <p className="leading-relaxed">
              Customer Personally Identifiable Information (PII) is encrypted at rest and restricted via server-side authorization. To enable development mode, configure <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded font-mono">VITE_OPERATIONS_MOCK_MODE=true</code> in your environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
