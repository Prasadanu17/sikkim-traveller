/**
 * Things To Do Checklist Component — AI Trip Planner Dashboard
 * Actionable task section highlighting required traveler actions with direct section jump links.
 */

import { CheckSquare, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ThingsToDoChecklist({ booking, readiness, onJumpToSection }) {
  const checklist = readiness?.checklist || [];
  const pendingTasks = checklist.filter(item => !item.completed);
  const completedCount = checklist.length - pendingTasks.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Smart Action Center</h2>
        </div>
        <span className="text-xs text-amber-400 font-semibold font-mono">
          {pendingTasks.length} Action{pendingTasks.length === 1 ? "" : "s"} Remaining
        </span>
      </div>

      {booking?.requestId && (
        <p className="text-[11px] text-slate-400">
          Actions required for booking <span className="font-mono text-slate-300">{booking.requestId}</span> ({completedCount}/{checklist.length} completed):
        </p>
      )}

      <div className="space-y-2">
        {pendingTasks.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All pre-trip checklist items completed! Your Sikkim journey is fully ready.</span>
          </div>
        ) : (
          pendingTasks.map(task => (
            <div key={task.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-200 font-medium">{task.title}</span>
              </div>
              <button
                onClick={() => onJumpToSection?.(task.section)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-sm"
              >
                <span>Action</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
