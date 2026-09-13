/**
 * Customer Transportation — Module 11
 * Displays vehicle allocation and transport verification states.
 * Driver phone numbers are masked/redacted for safety.
 */
import { Car, User, ShieldAlert } from "lucide-react";

export default function CustomerTransportation({ transportation }) {
  if (!transportation) return null;

  const isConfirmed = transportation.verificationStatus === "CONFIRMED" || transportation.verificationStatus === "ASSIGNED";
  const driver = transportation.driver;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
          <Car className="w-4 h-4 text-indigo-400" /> Vehicle & Driver
        </h2>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
          isConfirmed ? "bg-green-900/60 text-green-300" : "bg-slate-800 text-slate-400"
        }`}>
          {transportation.verificationStatus?.replace(/_/g, " ")}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {isConfirmed && driver ? (
          <div className="space-y-4">
            {/* Vehicle Detail */}
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Confirmed Vehicle</p>
              <h3 className="text-white text-sm font-semibold">{driver.vehicle || "Private Sedan/SUV"}</h3>
              {driver.vehicleNumber && <p className="text-indigo-400 font-mono text-xs mt-0.5">{driver.vehicleNumber}</p>}
            </div>

            {/* Driver Card (Masked Phone) */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 flex gap-3 items-center">
              <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200">{driver.name}</p>
                <p className="text-slate-500 mt-0.5">Phone: {driver.phone || "Provided on arrival"}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Stays in verification stages */
          <div className="space-y-4">
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex gap-3 text-xs text-slate-450 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-300">Vehicle Arrangement In Progress</p>
                <p className="mt-0.5">
                  We are arranging vehicles and assigning driver schedules. Driver contact details and vehicle numbers will be displayed here 24 hours prior to travel.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-slate-400">
              <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Travel Preferences</p>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Preferred Modes</span>
                <span className="text-slate-200 capitalize">{transportation.preference?.preferredModes?.join(", ") || "private cab"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Long Drive Tolerance</span>
                <span className="text-slate-200 capitalize">{transportation.preference?.longDriveTolerance || "medium"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
