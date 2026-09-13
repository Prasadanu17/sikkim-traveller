/**
 * Operations Itinerary — Module 10
 * Full day-by-day itinerary viewer with version history and revision comparison.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, GitCompare, Plus } from "lucide-react";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { addItineraryRevision } from "../../services/operations/operationsBookingService";

export default function OperationsItinerary({ booking, currentUser, onMutation }) {
  const [selectedVersion, setSelectedVersion] = useState(booking.itineraryVersions?.length - 1 || 0);
  const [showCompare, setShowCompare] = useState(false);
  const [showAddRevision, setShowAddRevision] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [expandedDays, setExpandedDays] = useState({});

  const canEdit = hasPermission(currentUser?.role, "canEditBooking") || hasPermission(currentUser?.role, "canVerifyAccommodation");
  const versions = booking.itineraryVersions || [];
  const activeVersion = versions[selectedVersion];

  const toggleDay = (dayNum) => setExpandedDays(p => ({ ...p, [dayNum]: !p[dayNum] }));

  const handleAddRevision = () => {
    if (!revisionReason.trim()) return;
    const baseVersion = versions[versions.length - 1];
    const result = addItineraryRevision(
      booking.id,
      { ...baseVersion, title: baseVersion.title + " (Revised)" },
      revisionReason,
      currentUser?.id,
      currentUser?.role,
      currentUser?.name
    );
    if (result.success) {
      setShowAddRevision(false);
      setRevisionReason("");
      onMutation?.();
    }
  };

  return (
    <div className="space-y-5">
      {/* Version Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {versions.map((v, i) => (
            <button
              key={i}
              onClick={() => setSelectedVersion(i)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                selectedVersion === i
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {v.version} {v.isOriginal ? "(Original)" : "(Revision)"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <button
              onClick={() => setShowCompare(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <GitCompare className="w-3 h-3" /> Compare
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setShowAddRevision(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Revision
            </button>
          )}
        </div>
      </div>

      {/* Add Revision Form */}
      {showAddRevision && (
        <div className="bg-slate-900 border border-indigo-800/40 rounded-xl p-4 space-y-3">
          <p className="text-slate-300 text-sm font-medium">Add Itinerary Revision</p>
          <p className="text-slate-500 text-xs">A new revision will be appended. The original itinerary will be preserved.</p>
          <textarea
            value={revisionReason}
            onChange={e => setRevisionReason(e.target.value)}
            placeholder="Reason for revision (e.g. Road advisory affecting Day 3 route)..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAddRevision} disabled={!revisionReason.trim()} className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
              Create Revision
            </button>
            <button onClick={() => setShowAddRevision(false)} className="text-xs px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comparison View */}
      {showCompare && versions.length > 1 && (
        <ItineraryCompare original={versions[0]} revised={versions[versions.length - 1]} />
      )}

      {/* Active Version Itinerary */}
      {activeVersion ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-200 font-semibold">{activeVersion.title || activeVersion.tripTitle}</p>
              <p className="text-slate-500 text-xs mt-0.5">{activeVersion.version} {activeVersion.isOriginal ? "· Original Submission" : `· Revision — ${activeVersion.reason}`}</p>
            </div>
          </div>
          <div className="divide-y divide-slate-800/60">
            {(activeVersion.days || []).map(day => (
              <div key={day.dayNumber} className="px-5 py-3">
                <button
                  onClick={() => toggleDay(day.dayNumber)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Day {day.dayNumber}</span>
                    <p className="text-slate-200 text-sm font-medium mt-0.5">{day.title}</p>
                  </div>
                  {expandedDays[day.dayNumber] ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
                </button>
                {expandedDays[day.dayNumber] && (
                  <div className="mt-3 space-y-2 text-sm pl-2 border-l-2 border-slate-800">
                    {(day.activities || []).map((act, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-slate-500 text-xs w-20 shrink-0 pt-0.5">{act.time || `Activity ${i + 1}`}</span>
                        <span className="text-slate-300">{act.description || act}</span>
                      </div>
                    ))}
                    {day.accommodation && (
                      <div className="flex gap-3">
                        <span className="text-slate-500 text-xs w-20 shrink-0 pt-0.5">Stay</span>
                        <span className="text-slate-400">{day.accommodation}</span>
                      </div>
                    )}
                    {day.transport && (
                      <div className="flex gap-3">
                        <span className="text-slate-500 text-xs w-20 shrink-0 pt-0.5">Transport</span>
                        <span className="text-slate-400">{day.transport}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {activeVersion.importantNotes?.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-800 space-y-1">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Important Notes</p>
              {activeVersion.importantNotes.map((n, i) => (
                <p key={i} className="text-slate-400 text-xs">• {n}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No itinerary on record.</p>
      )}
    </div>
  );
}

function ItineraryCompare({ original, revised }) {
  const origDays = original?.days || [];
  const revDays = revised?.days || [];
  const maxDays = Math.max(origDays.length, revDays.length);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 border-b border-slate-800">
        <div className="px-4 py-3 border-r border-slate-800">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Original — {original?.version}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">Revised — {revised?.version}</p>
          {revised?.reason && <p className="text-slate-500 text-xs mt-0.5">Reason: {revised.reason}</p>}
        </div>
      </div>
      <div className="divide-y divide-slate-800/60">
        {Array.from({ length: maxDays }, (_, i) => {
          const origDay = origDays[i];
          const revDay = revDays[i];
          const changed = origDay?.title !== revDay?.title;
          return (
            <div key={i} className={`grid grid-cols-2 ${changed ? "bg-amber-950/10" : ""}`}>
              <div className="px-4 py-3 border-r border-slate-800">
                <p className="text-slate-400 text-xs">Day {i + 1}</p>
                <p className="text-slate-300 text-sm mt-0.5">{origDay?.title || "—"}</p>
              </div>
              <div className="px-4 py-3">
                <p className={`text-xs ${changed ? "text-amber-400" : "text-slate-400"}`}>Day {i + 1}</p>
                <p className={`text-sm mt-0.5 ${changed ? "text-amber-200" : "text-slate-300"}`}>{revDay?.title || "—"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
