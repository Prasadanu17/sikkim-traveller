/**
 * Deterministic Itinerary Patch Service.
 * Applies localized modifications (day pace, activity removal, transport mode, stay type)
 * directly to an existing itinerary object without destroying unaffected days.
 */

export function applyItineraryPatch(existingItinerary, patch) {
  if (!existingItinerary || !existingItinerary.days) return existingItinerary;

  const cloned = JSON.parse(JSON.stringify(existingItinerary));
  const { operation, targetDay, targetActivityIndex, targetSection, changes } = patch;

  // ─── OPERATION 1: UPDATE DAY PACE / ACTIVITIES ───
  if (operation === "update_day_pace" && targetDay) {
    const dayObj = cloned.days.find((d) => d.dayNumber === targetDay);
    if (dayObj) {
      // 1a. Handle individual activity removals from DayEditModal
      if (Array.isArray(changes.removedMorning) && changes.removedMorning.length > 0 && Array.isArray(dayObj.morning)) {
        dayObj.morning = dayObj.morning.filter((_, idx) => !changes.removedMorning.includes(idx));
      }
      if (Array.isArray(changes.removedAfternoon) && changes.removedAfternoon.length > 0 && Array.isArray(dayObj.afternoon)) {
        dayObj.afternoon = dayObj.afternoon.filter((_, idx) => !changes.removedAfternoon.includes(idx));
      }
      if (Array.isArray(changes.removedEvening) && changes.removedEvening.length > 0 && Array.isArray(dayObj.evening)) {
        dayObj.evening = dayObj.evening.filter((_, idx) => !changes.removedEvening.includes(idx));
      }

      // 1b. Handle pace modifications
      if (changes.pace === "relaxed") {
        // Trim afternoon/evening activities to 1 max
        if (dayObj.afternoon && dayObj.afternoon.length > 1) {
          dayObj.afternoon = dayObj.afternoon.slice(0, 1);
        }
        if (dayObj.evening && dayObj.evening.length > 1) {
          dayObj.evening = dayObj.evening.slice(0, 1);
        }
        dayObj.notes = dayObj.notes || [];
        if (!dayObj.notes.includes("Pace relaxed: Dedicated rest & free time added.")) {
          dayObj.notes.push("Pace relaxed: Dedicated rest & free time added.");
        }
      } else if (changes.pace === "packed") {
        // Add additional exploration activity if empty
        if (!dayObj.afternoon || dayObj.afternoon.length === 0) {
          dayObj.afternoon = [
            {
              title: `Expanded ${dayObj.baseLocation} Sightseeing`,
              description: `Additional scenic lookout and cultural stop in ${dayObj.baseLocation}.`,
              duration: "2 hours"
            }
          ];
        }
      }
    }
  }

  // ─── OPERATION 2: REMOVE INDIVIDUAL ACTIVITY ───
  if (operation === "remove_activity" && targetDay && targetSection) {
    const dayObj = cloned.days.find((d) => d.dayNumber === targetDay);
    if (dayObj && Array.isArray(dayObj[targetSection])) {
      if (typeof targetActivityIndex === "number") {
        dayObj[targetSection].splice(targetActivityIndex, 1);
      }
      dayObj.notes = dayObj.notes || [];
      dayObj.notes.push("Activity removed by custom preference.");
    }
  }

  // ─── OPERATION 3: UPDATE TRANSPORT MODE ───
  if (operation === "update_transport" && changes.transportMode) {
    const newModeLabel = changes.transportMode === "shared-sumo" ? "Shared Sumo" : "Private Cab / SUV";
    cloned.days.forEach((day) => {
      if (Array.isArray(day.travel)) {
        day.travel.forEach((tr) => {
          tr.mode = newModeLabel;
        });
      }
    });
    if (cloned.overview) {
      cloned.overview.transportMode = newModeLabel;
    }
  }

  // ─── OPERATION 4: UPDATE ACCOMMODATION TYPE ───
  if (operation === "update_accommodation" && changes.accommodationType) {
    const accomLabel = changes.accommodationType.charAt(0).toUpperCase() + changes.accommodationType.slice(1);
    cloned.days.forEach((day) => {
      if (day.overnight) {
        day.overnight.accommodationType = `${accomLabel} in ${day.overnight.location}`;
      }
    });
  }

  // ─── OPERATION 5: TRIP-WIDE RELAXED PACE ───
  if (operation === "relax_trip") {
    cloned.days.forEach((day) => {
      if (day.afternoon && day.afternoon.length > 1) {
        day.afternoon = day.afternoon.slice(0, 1);
      }
      if (day.evening && day.evening.length > 1) {
        day.evening = day.evening.slice(0, 1);
      }
    });
    if (cloned.overview) {
      cloned.overview.travelStyle = "relaxed";
    }
  }

  return cloned;
}
