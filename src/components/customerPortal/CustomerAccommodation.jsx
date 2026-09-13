/**
 * Customer Accommodation — Module 11
 * Renders traveler stay preferences or verified lodging vouchers.
 * Hides supplier margins, supplier contact PII, and staff notes.
 */
import { Bed, ShieldAlert } from "lucide-react";

export default function CustomerAccommodation({ accommodation }) {
  if (!accommodation) return null;

  const isConfirmed = accommodation.verificationStatus === "CONFIRMED";
  const option = accommodation.confirmedOption;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
          <Bed className="w-4 h-4 text-indigo-400" /> Stays & Lodging
        </h2>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
          isConfirmed ? "bg-green-900/60 text-green-300" : "bg-slate-800 text-slate-400"
        }`}>
          {accommodation.verificationStatus?.replace(/_/g, " ")}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* If lodging is confirmed */}
        {isConfirmed && option ? (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Confirmed Property</p>
              <h3 className="text-white text-sm font-semibold">{option.propertyName}</h3>
              {option.location && <p className="text-slate-400 text-xs mt-0.5">📍 {option.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs leading-relaxed text-slate-350">
              {option.roomType && (
                <div>
                  <span className="text-slate-500 block">Room Option</span>
                  <span className="text-slate-200 font-medium">{option.roomType}</span>
                </div>
              )}
              {option.nights && (
                <div>
                  <span className="text-slate-500 block">Nights Count</span>
                  <span className="text-slate-200 font-medium">{option.nights} nights</span>
                </div>
              )}
            </div>
            
            {option.notes && (
              <p className="text-slate-500 text-xs italic bg-slate-950/40 border border-slate-850 px-3 py-2 rounded-lg mt-2">
                Note: {option.notes}
              </p>
            )}
          </div>
        ) : (
          /* Stays in verification stages */
          <div className="space-y-4">
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex gap-3 text-xs text-slate-450 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300">Lodging Verification In Progress</p>
                <p className="mt-0.5">
                  Our travel operations team is currently contacting guesthouses and verifying stay slots. Specific property confirmation details will be updated here.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Submitted Preferences</p>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Lodging Comfort</span>
                <span className="text-slate-200 capitalize">{accommodation.preference?.comfort || "comfortable"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Preferred Lodging Styles</span>
                <span className="text-slate-200">{accommodation.preference?.types?.join(", ") || "hotel/homestay"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
