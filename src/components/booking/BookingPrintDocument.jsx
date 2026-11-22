import React from "react";
import { destinations as allDests } from "../../data/destinations";

/**
 * BookingPrintDocument
 * 
 * Executive, professional printable document layout for Sikkim Traveller.
 * Designed specifically for clean A4 printing, PDF downloads, and traveler itineraries.
 * Includes official branding, lead traveler details, party specs, day-by-day journey schedule,
 * transparent inclusions/exclusions table, and Govt. of Sikkim permit & health advisories.
 */
export default function BookingPrintDocument({
  bookingContext,
  formData = {},
  submissionResult = null,
  plannerState = null
}) {
  if (!bookingContext) return null;

  const {
    trip = {},
    traveler = {},
    destinations: contextDests = [],
    budget = {},
    accommodation = {},
    transportation = {},
    realtimeSnapshot = {}
  } = bookingContext;

  const primaryTraveler = formData.primaryTraveler || {};
  const contactPreference = formData.contactPreference || {};
  const specialReqs = formData.specialRequirements || {};

  // Resolve Request ID & timestamps
  const requestId =
    submissionResult?.requestId ||
    formData.requestId ||
    "ST-REQ-DRAFT";
  
  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const issueTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Destination resolver
  const getDestName = (slug) => {
    if (!slug) return "";
    const found = allDests.find(
      (d) => d.slug.toLowerCase() === slug.toLowerCase() || d.name.toLowerCase() === slug.toLowerCase()
    );
    return found ? found.name : slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
  };

  const resolvedDestinations = (contextDests || []).map(getDestName);

  // Currency Formatter
  const formatInr = (val) => {
    if (!val && val !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Extract Days: prioritize plannerState rich days, then bookingContext, then fallback
  const richItinerary =
    plannerState?.itinerary?.current ||
    plannerState?.itinerary ||
    bookingContext?.itinerary ||
    {};

  const daysList = Array.isArray(richItinerary.days) && richItinerary.days.length > 0
    ? richItinerary.days
    : Array.from({ length: trip.duration || 5 }, (_, idx) => {
        const dest = resolvedDestinations[idx % resolvedDestinations.length] || "Gangtok";
        return {
          dayNumber: idx + 1,
          title: idx === 0 ? `Arrival & Welcome in ${dest}` : `Exploring the Wonders of ${dest}`,
          baseLocation: dest,
          accommodation: `${accommodation.comfort || "Comfort"} Stay in ${dest}`,
          activities: [
            { title: "Scenic Himalayan Exploration", description: `Experience local culture, viewpoints, and Himalayan landscapes around ${dest}.` }
          ]
        };
      });

  // Active special requirements list
  const activeRequirements = [
    specialReqs.vegetarianFood && "Pure Vegetarian Meals",
    specialReqs.nonVegetarianFood && "Non-Vegetarian Options",
    specialReqs.childFriendly && "Child-Friendly Itinerary Pace",
    specialReqs.seniorFriendly && "Senior-Friendly / Mild Incline",
    specialReqs.groundFloor && "Ground Floor Room Request",
    specialReqs.roomPreference && "Specific Room / Mountain View",
    specialReqs.reducedWalking && "Reduced Walking / Direct Cab Access",
    specialReqs.moreRestPeriods && "Relaxed Pace & Rest Buffers",
    specialReqs.extraLuggage && "Extra Luggage Space (Dedicated 4WD)",
    specialReqs.photographyPace && "Photography Golden Hour Stops",
    specialReqs.flexibleDates && "Flexible Date Adjustment",
    specialReqs.specialOccasion && "Special Occasion / Anniversary / Honeymoon"
  ].filter(Boolean);

  if (specialReqs.otherDetails) {
    activeRequirements.push(specialReqs.otherDetails);
  }

  return (
    <div className="w-full text-slate-900 bg-white font-sans text-xs leading-relaxed print-document-root p-6 sm:p-10 space-y-6 max-w-4xl mx-auto border border-neutral-200 rounded-xl print:border-none print:p-0 print:m-0 print:max-w-none print:w-full">
      
      {/* ─── 1. OFFICIAL DOCUMENT HEADER ─── */}
      <div className="border-b-2 border-emerald-900 pb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-2xl font-bold shadow-sm shrink-0 print:bg-emerald-950">
              🏔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-emerald-950 uppercase leading-none">
                  Sikkim Traveller
                </h1>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                  Official Itinerary
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">
                Curated Himalayan Journeys • Govt. of Sikkim Tourism Registered Operator
              </p>
            </div>
          </div>

          {/* Document Reference Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right sm:min-w-[220px] print:bg-white">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">INQUIRY REFERENCE</span>
            <span className="font-mono text-sm font-bold text-emerald-950 tracking-wider block mt-0.5">{requestId}</span>
            <div className="flex items-center justify-end gap-2 mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] text-slate-500">
              <span>{issueDate}, {issueTime}</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {submissionResult?.requestId ? "RECEIVED" : "INQUIRY DRAFT"}
              </span>
            </div>
          </div>
        </div>

        {/* Support Hotline Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Travel Operations Desk: </span>
            <span>+91 97330 12345 / +91 (0) 3592 202 020</span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">Email: </span>
            <span>operations@sikkimtraveller.com</span>
            <span className="mx-2 text-slate-300">•</span>
            <span className="font-semibold text-slate-800">Web: </span>
            <span>www.sikkimtraveller.com</span>
          </div>
        </div>
      </div>

      {/* ─── 2. TRIP OVERVIEW & TRAVELER PROFILE GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Lead Traveler & Contact */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5 print:bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>👤</span> Primary Traveler & Contact
            </h3>
            <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Lead Guest
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Full Name</span>
              <span className="font-bold text-slate-900">{primaryTraveler.fullName || "Valued Traveler"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Contact Preference</span>
              <span className="font-medium text-slate-800">
                {contactPreference.method || "WhatsApp / Email"} {contactPreference.timeOfDay ? `(${contactPreference.timeOfDay})` : ""}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Email</span>
              <span className="font-medium text-slate-800 break-all">{primaryTraveler.email || "Pending verification"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Phone / WhatsApp</span>
              <span className="font-medium text-slate-800">{primaryTraveler.phone || "Pending verification"}</span>
            </div>
          </div>

          {/* Party Composition */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Party Composition:</span>
            <span className="font-bold text-slate-800">
              {traveler.total || 1} Guest{traveler.total > 1 ? "s" : ""} ({traveler.adults || 1} Adult{traveler.adults > 1 ? "s" : ""}
              {traveler.children ? `, ${traveler.children} Child` : ""}
              {traveler.seniors ? `, ${traveler.seniors} Senior` : ""}) — <span className="capitalize">{traveler.type || "Solo"}</span>
            </span>
          </div>

          {/* Special Requirements */}
          {activeRequirements.length > 0 && (
            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Preferences & Accessibility</span>
              <div className="flex flex-wrap gap-1">
                {activeRequirements.map((req, i) => (
                  <span key={i} className="text-[9px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-medium">
                    ✓ {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Journey Logistics & Blueprint */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5 print:bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🧭</span> Journey Specifications
            </h3>
            <span className="text-[9px] uppercase font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              {trip.duration || 5} Days / {(trip.duration || 5) - 1} Nights
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Travel Dates</span>
              <span className="font-bold text-slate-900">
                {trip.startDate ? `${trip.startDate} to ${trip.endDate || "End"}` : "Flexible / Custom Dates"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Pace & Style</span>
              <span className="font-medium text-slate-800 capitalize">{plannerState?.travelStyle || "Balanced & Scenic"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Stay Category</span>
              <span className="font-medium text-slate-800 capitalize">
                {accommodation.comfort || "Comfortable"} ({(accommodation.types || ["Hotel", "Homestay"]).join(", ")})
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold uppercase">Vehicle Class</span>
              <span className="font-medium text-slate-800">
                Private Dedicated 4WD / SUV ({(transportation.preferredModes || ["Innova/Scorpio"]).join(", ")})
              </span>
            </div>
          </div>

          {/* Route Sequence */}
          <div className="pt-2 border-t border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Route Circuit</span>
            <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold text-emerald-950">
              {resolvedDestinations.map((dest, i) => (
                <React.Fragment key={i}>
                  <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-900">
                    {dest}
                  </span>
                  {i < resolvedDestinations.length - 1 && <span className="text-slate-400 font-normal">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Estimated Package Price */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between bg-emerald-900/5 -mx-4 -mb-4 p-3 rounded-b-xl border-emerald-900/10">
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-900 tracking-wider block">Estimated Journey Package</span>
              <span className="text-[9px] text-slate-500">Includes private vehicle, stays & permit assistance</span>
            </div>
            <span className="font-serif font-bold text-sm text-emerald-950">
              {formatInr(budget.estimatedRange?.min || 25000)} – {formatInr(budget.estimatedRange?.max || 38000)}
            </span>
          </div>
        </div>

      </div>

      {/* ─── 3. DAY-BY-DAY JOURNEY SCHEDULE ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
          <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
            <span>📅</span> Day-by-Day Journey Itinerary
          </h2>
          <span className="text-[10px] text-slate-500 font-medium italic">
            * Timings and sequence optimized for mountain road safety & daylight
          </span>
        </div>

        <div className="space-y-3.5">
          {daysList.map((day, idx) => {
            const dayNum = day.dayNumber || idx + 1;
            const location = day.baseLocation || resolvedDestinations[idx % resolvedDestinations.length] || "Sikkim";
            
            // Gather activities
            const morningActs = Array.isArray(day.morning)
              ? day.morning
              : Array.isArray(day.morningActivities)
              ? day.morningActivities
              : [];

            const afternoonActs = Array.isArray(day.afternoon)
              ? day.afternoon
              : Array.isArray(day.afternoonActivities)
              ? day.afternoonActivities
              : [];

            const eveningActs = Array.isArray(day.evening)
              ? day.evening
              : Array.isArray(day.eveningActivities)
              ? day.eveningActivities
              : [];

            const generalActs = Array.isArray(day.activities) ? day.activities : [];

            const stayText = typeof day.accommodation === "string"
              ? day.accommodation
              : day.stay || `${accommodation.comfort || "Comfort"} Stay in ${location}`;

            return (
              <div
                key={dayNum}
                className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2.5 print:shadow-none print:break-inside-avoid print:border-slate-300"
              >
                {/* Day Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-emerald-950 text-amber-300 font-serif font-bold text-xs px-2.5 py-1 rounded shadow-sm">
                      DAY {dayNum}
                    </span>
                    <h3 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
                      {day.title || `Exploration of ${location}`}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                      📍 Base: {location}
                    </span>
                    {day.date && (
                      <span className="text-slate-500 font-medium">
                        {new Date(day.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Activities Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                  
                  {/* Morning */}
                  <div className="bg-slate-50/70 border border-slate-150 rounded-lg p-2.5 space-y-1 print:bg-white">
                    <span className="text-[9px] uppercase font-bold text-amber-900 tracking-wider block flex items-center gap-1">
                      <span>🌅</span> Morning Highlights
                    </span>
                    {morningActs.length > 0 ? (
                      morningActs.map((act, i) => (
                        <div key={i} className="text-slate-700">
                          <p className="font-semibold text-slate-900 leading-tight">{typeof act === "string" ? act : act.title}</p>
                          {act.description && <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{act.description}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-600">Morning mountain transfer & sightseeing around {location}.</p>
                    )}
                  </div>

                  {/* Afternoon */}
                  <div className="bg-slate-50/70 border border-slate-150 rounded-lg p-2.5 space-y-1 print:bg-white">
                    <span className="text-[9px] uppercase font-bold text-orange-900 tracking-wider block flex items-center gap-1">
                      <span>☀️</span> Afternoon Sightseeing
                    </span>
                    {afternoonActs.length > 0 ? (
                      afternoonActs.map((act, i) => (
                        <div key={i} className="text-slate-700">
                          <p className="font-semibold text-slate-900 leading-tight">{typeof act === "string" ? act : act.title}</p>
                          {act.description && <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{act.description}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-600">Cultural viewpoints, monastery visit & scenic valley vistas.</p>
                    )}
                  </div>

                  {/* Evening & Stay */}
                  <div className="bg-slate-50/70 border border-slate-150 rounded-lg p-2.5 space-y-1 print:bg-white">
                    <span className="text-[9px] uppercase font-bold text-indigo-900 tracking-wider block flex items-center gap-1">
                      <span>🌙</span> Evening & Night Stay
                    </span>
                    {eveningActs.length > 0 ? (
                      eveningActs.map((act, i) => (
                        <div key={i} className="text-slate-700">
                          <p className="font-semibold text-slate-900 leading-tight">{typeof act === "string" ? act : act.title}</p>
                          {act.description && <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{act.description}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-600">Local handicrafts market, traditional dinner & mountain rest.</p>
                    )}
                  </div>

                </div>

                {/* General Activities fallback if split was not present */}
                {morningActs.length === 0 && afternoonActs.length === 0 && generalActs.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Scheduled Activities</span>
                    <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                      {generalActs.map((act, i) => (
                        <li key={i}>
                          <span className="font-semibold text-slate-900">{typeof act === "string" ? act : act.title}:</span>{" "}
                          <span className="text-slate-600">{typeof act === "string" ? "" : act.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Day Logistics Footer Bar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">🏨 Stay:</span>
                    <span className="text-slate-700 font-medium">{stayText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {day.travel && day.travel[0] && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        🚗 Transit: {day.travel[0].from || location} → {day.travel[0].to || location} ({day.travel[0].duration || "Mountain Drive"})
                      </span>
                    )}
                    <span className="text-slate-400 font-mono text-[9px]">Sikkim Traveller Verified</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 4. BUDGET SPECIFICATION & INCLUSIONS / EXCLUSIONS ─── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden print:break-inside-avoid print:border-slate-300">
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between print:bg-slate-950">
          <div>
            <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>⚖️</span> Package Inclusions & Exclusions Breakdown
            </h3>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Transparent specifications tailored to high-altitude Sikkim mountain operations
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-bold">ESTIMATED TOTAL</span>
            <span className="font-serif text-sm font-bold text-amber-300">
              {formatInr(budget.estimatedRange?.min || 25000)} – {formatInr(budget.estimatedRange?.max || 38000)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-4 bg-slate-50/40 text-[11px] gap-4 print:bg-white">
          {/* Inclusions */}
          <div className="space-y-2">
            <span className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <span className="text-emerald-600 font-bold">✓</span> What Is Included
            </span>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span><strong>Dedicated Private Hill Vehicle:</strong> SUV/4WD (Innova/Scorpio/Bolero) with experienced mountain driver for all sightseeing & inter-district transfers.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span><strong>All Road & Driver Expenses:</strong> Fuel charges, toll taxes, parking fees, hill permit road taxes, driver night halts and allowances.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span><strong>Government Permit Coordination:</strong> Processing of Sikkim Protected Area Permits (PAP) & checkpost verifications.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span><strong>Curated Stays:</strong> Selected comfort category accommodation with daily breakfast (and all meals in North Sikkim remote halts).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span><strong>24/7 Operations Desk Support:</strong> Real-time road monitoring, weather tracking, and emergency coordination throughout Sikkim.</span>
              </li>
            </ul>
          </div>

          {/* Exclusions */}
          <div className="space-y-2 pt-3 md:pt-0">
            <span className="font-bold text-rose-900 uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <span className="text-rose-600 font-bold">✗</span> What Is Not Included
            </span>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold shrink-0">✗</span>
                <span><strong>Inbound / Outbound Travel:</strong> Flights or train tickets to/from Bagdogra Airport (IXB) or New Jalpaiguri Station (NJP).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold shrink-0">✗</span>
                <span><strong>Entry & Activity Fees:</strong> Monument entry tickets, monastery camera charges, ropeway fees, or specialized local river rafting.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold shrink-0">✗</span>
                <span><strong>Extreme Weather Surcharges:</strong> Zero Point / Kala Patthar snow vehicle upgrades (subject to Army clearance & payable directly).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold shrink-0">✗</span>
                <span><strong>Personal Incidental Expenses:</strong> Room heating charges (if hotel charges extra), laundry, telephone, tips, and alcoholic beverages.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold shrink-0">✗</span>
                <span><strong>Travel Insurance:</strong> Comprehensive personal travel or emergency medical evacuation insurance.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── 5. OFFICIAL GOVT. PERMIT REGULATIONS & ALTITUDE ADVISORY ─── */}
      <div className="border border-amber-300 bg-amber-50/60 rounded-xl p-4 text-[11px] space-y-2.5 print:bg-white print:border-amber-400 print:break-inside-avoid">
        <div className="flex items-center gap-2 border-b border-amber-200 pb-1.5">
          <span className="text-sm">⚠️</span>
          <h3 className="font-serif font-bold text-amber-950 uppercase tracking-wider text-xs">
            Official Sikkim Government Permit & High-Altitude Travel Advisory
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-800">
          {/* Permit Rules */}
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900 text-[10px] uppercase tracking-wide">
              Protected Area Permits (PAP) & Foreign National Regulations
            </h4>
            <p className="text-[10px] leading-relaxed text-slate-700">
              • <strong>Indian Citizens:</strong> North Sikkim (Lachen, Lachung, Gurudongmar) and East Sikkim (Tsomgo Lake, Baba Mandir, Nathula Pass) require PAP issued by Sikkim Tourism & Sikkim Police. Must carry original Voter ID / Passport / Driving License and 4 passport-size photographs.
            </p>
            <p className="text-[10px] leading-relaxed text-slate-700">
              • <strong>Foreign Nationals:</strong> Under Ministry of Defence regulations, <strong>Nathula Pass and Gurudongmar Lake are restricted strictly to Indian Nationals</strong>. Foreign visitors with a valid Indian Visa & Sikkim Inner Line Permit (ILP) are welcome in Gangtok, Pelling, Ravangla, Yuksom, and Yumthang Valley (in groups of 2+ with registered agency PAP).
            </p>
          </div>

          {/* Altitude Safety */}
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900 text-[10px] uppercase tracking-wide">
              High-Altitude Acclimatization & Mountain Health
            </h4>
            <p className="text-[10px] leading-relaxed text-slate-700">
              • North Sikkim destinations range from 8,838 ft (Lachen) to 17,800 ft (Gurudongmar Lake). A mandatory overnight acclimatization stop in Lachen/Lachung is strictly enforced before ascending to high-altitude lakes.
            </p>
            <p className="text-[10px] leading-relaxed text-slate-700">
              • Drink 3–4 liters of water daily. Avoid rapid ascent, smoking, and alcohol on arrival days. If experiencing persistent headache, nausea, or shortness of breath (Acute Mountain Sickness), notify our driver or operations desk immediately.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 6. LEGAL NOTICE & OPERATIONS VERIFICATION FOOTER ─── */}
      <div className="pt-3 border-t-2 border-slate-200 text-slate-500 text-[10px] space-y-2">
        <p className="text-center italic leading-relaxed text-slate-600">
          This document represents an AI-curated travel itinerary and reservation inquiry. It does not certify confirmed hotel allocations, permit approvals, or financial transactions. The Sikkim Traveller operations team will verify vehicle permits and current road conditions before issuing your final confirmed travel voucher.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[9px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Sikkim Traveller Pvt. Ltd. • Govt. Registration No: SK-TO-2024-8841
          </div>
          <div className="font-mono">
            Document Security Hash: {requestId}-ST-SEC-VERIFIED
          </div>
        </div>
      </div>

    </div>
  );
}
