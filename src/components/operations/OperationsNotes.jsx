/**
 * Operations Notes — Module 10
 * Separate tabs for Internal Notes (staff-only) and Customer-Visible Notes.
 * Internal notes are NEVER mixed with customer notes.
 */
import { useState } from "react";
import { Lock, Eye } from "lucide-react";
import { hasPermission } from "../../services/operations/operationsPermissionService";
import { addInternalNote, addCustomerNote } from "../../services/operations/operationsBookingService";

export default function OperationsNotes({ booking, currentUser, onMutation }) {
  const [activeTab, setActiveTab] = useState("internal");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const canInternal = hasPermission(currentUser?.role, "canAddInternalNote");
  const canCustomer = hasPermission(currentUser?.role, "canAddCustomerNote");
  const canViewInternal = hasPermission(currentUser?.role, "canViewInternalNotes");

  const internalNotes = booking.notes?.internal || [];
  const customerNotes = booking.notes?.customerVisible || [];

  const handleAdd = () => {
    if (!noteText.trim()) return;
    setSaving(true);
    if (activeTab === "internal" && canInternal) {
      addInternalNote(booking.id, noteText, currentUser?.id, currentUser?.role, currentUser?.name);
    } else if (activeTab === "customer" && canCustomer) {
      addCustomerNote(booking.id, noteText, currentUser?.id, currentUser?.role, currentUser?.name);
    }
    setSaving(false);
    setNoteText("");
    onMutation?.();
  };

  return (
    <div className="space-y-4">
      {/* Tab Toggle */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("internal")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${activeTab === "internal" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
        >
          <Lock className="w-3.5 h-3.5" /> Internal Notes
          {internalNotes.length > 0 && <span className="bg-amber-800/50 text-amber-300 text-xs px-1.5 rounded-full">{internalNotes.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("customer")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${activeTab === "customer" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}
        >
          <Eye className="w-3.5 h-3.5" /> Customer Notes
          {customerNotes.length > 0 && <span className="bg-indigo-800/50 text-indigo-300 text-xs px-1.5 rounded-full">{customerNotes.length}</span>}
        </button>
      </div>

      {/* Internal Notes */}
      {activeTab === "internal" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-amber-950/20 border border-amber-900/30 rounded-lg px-4 py-3">
            <Lock className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-400 text-xs">Internal notes are only visible to authorized operations staff. They are NEVER shared with the customer.</p>
          </div>

          {!canViewInternal && (
            <p className="text-slate-500 text-sm text-center py-4">You do not have permission to view internal notes.</p>
          )}

          {canViewInternal && (
            <div className="space-y-3">
              {internalNotes.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No internal notes yet.</p>}
              {internalNotes.map(note => <NoteCard key={note.id} note={note} isInternal />)}
            </div>
          )}

          {canInternal && (
            <AddNoteForm value={noteText} onChange={setNoteText} onAdd={handleAdd} saving={saving} label="Add internal note..." />
          )}
        </div>
      )}

      {/* Customer Notes */}
      {activeTab === "customer" && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-indigo-950/20 border border-indigo-900/30 rounded-lg px-4 py-3">
            <Eye className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-indigo-400 text-xs">Customer-visible notes form part of the communication record and may be shared with the customer. Never include internal operational details here.</p>
          </div>

          <div className="space-y-3">
            {customerNotes.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No customer notes yet.</p>}
            {customerNotes.map(note => <NoteCard key={note.id} note={note} isInternal={false} />)}
          </div>

          {canCustomer && (
            <AddNoteForm value={noteText} onChange={setNoteText} onAdd={handleAdd} saving={saving} label="Add customer-visible note..." />
          )}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, isInternal }) {
  return (
    <div className={`rounded-xl p-4 border text-sm space-y-1.5 ${isInternal ? "bg-amber-950/10 border-amber-900/20" : "bg-indigo-950/10 border-indigo-900/20"}`}>
      <p className="text-slate-200">{note.text}</p>
      <p className="text-slate-500 text-xs">
        {note.addedByName || note.addedBy} · {note.addedByRole} · {new Date(note.addedAt).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function AddNoteForm({ value, onChange, onAdd, saving, label }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={label}
        rows={3}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
      />
      <button
        onClick={onAdd}
        disabled={!value.trim() || saving}
        className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
      >
        {saving ? "Adding..." : "Add Note"}
      </button>
    </div>
  );
}
