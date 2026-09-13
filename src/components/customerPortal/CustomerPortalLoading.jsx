/**
 * Customer Portal Loading — Module 11
 * Simple centered loader skeleton.
 */
import { Compass } from "lucide-react";

export default function CustomerPortalLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <Compass className="w-12 h-12 text-indigo-500 animate-spin" />
        <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
      </div>
      <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">
        Retrieving secured travel details...
      </p>
    </div>
  );
}
