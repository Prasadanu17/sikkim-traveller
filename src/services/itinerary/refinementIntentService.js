import { destinations as allDests } from "../../data/destinations";

/**
 * Natural Language & Chip Intent Parser.
 * Converts raw user requests or quick chips into a structured intent object.
 */
export function parseRefinementIntent(requestInput, options = {}) {
  const text = (typeof requestInput === "string" ? requestInput : requestInput?.instruction || "").toLowerCase().trim();
  const chipMode = typeof requestInput === "object" ? requestInput?.mode : null;
  const directChanges = typeof requestInput === "object" && requestInput?.changes ? requestInput.changes : {};

  // Default intent object
  const intentResult = {
    intent: "general_refine",
    scope: "trip",
    targetDay: null,
    targetDestination: null,
    targetActivity: null,
    changes: { ...directChanges },
    rawRequest: text || chipMode || ""
  };

  // If structured changes are explicitly passed from a mutation card
  if (directChanges.removeActivity) {
    intentResult.intent = "remove_activity";
    intentResult.targetDay = directChanges.targetDay || 2;
  } else if (directChanges.targetDay) {
    intentResult.targetDay = directChanges.targetDay;
    intentResult.intent = "change_day_pace";
  }
  if (directChanges.addDestination) {
    intentResult.intent = "add_destination";
    intentResult.targetDestination = directChanges.addDestination;
    intentResult.scope = "destination";
  }
  if (directChanges.removeDestination) {
    intentResult.intent = "remove_destination";
    intentResult.targetDestination = directChanges.removeDestination;
    intentResult.scope = "destination";
  }
  if (directChanges.duration) {
    intentResult.intent = "change_duration";
    intentResult.scope = "duration";
  }
  if (directChanges.transportMode) {
    intentResult.intent = "change_transport";
  }
  if (directChanges.accommodationType) {
    intentResult.intent = "change_accommodation";
  }
  if (directChanges.budgetCap) {
    intentResult.intent = "reduce_budget";
  }

  // Check preset chips first if provided
  if (chipMode) {
    if (chipMode === "more_relaxed") {
      intentResult.intent = "change_trip_pace";
      intentResult.changes.pace = "relaxed";
    } else if (chipMode === "more_sightseeing") {
      intentResult.intent = "increase_sightseeing";
      intentResult.changes.pace = "packed";
    } else if (chipMode === "more_photography") {
      intentResult.intent = "increase_photography";
      intentResult.changes.focus = "photography";
    } else if (chipMode === "lower_budget") {
      intentResult.intent = "reduce_budget";
      intentResult.changes.budgetLevel = "budget";
    } else if (chipMode === "more_premium") {
      intentResult.intent = "increase_budget";
      intentResult.changes.budgetLevel = "premium";
    } else if (chipMode === "fewer_drives") {
      intentResult.intent = "reduce_drive_time";
      intentResult.changes.longDriveTolerance = "prefer-shorter";
    } else if (chipMode === "family_friendly") {
      intentResult.intent = "change_traveler_focus";
      intentResult.changes.travelerType = "family";
    }
  }

  // Detect specific day references (e.g. "Day 3", "day 2", "third day")
  const dayMatch = text.match(/day\s*(\d+)/i);
  if (dayMatch) {
    intentResult.targetDay = Number(dayMatch[1]);
    intentResult.scope = "day";
  }

  // Detect destination references (e.g. "pelling", "lachung", "gangtok")
  const matchedDest = allDests.find((d) =>
    text.includes(d.slug) || text.includes(d.name.toLowerCase())
  );
  if (matchedDest) {
    intentResult.targetDestination = matchedDest.slug;
    if (text.includes("remove") || text.includes("delete") || text.includes("don't want")) {
      intentResult.intent = "remove_destination";
      intentResult.scope = "destination";
    } else if (text.includes("add") || text.includes("include") || text.includes("visit")) {
      intentResult.intent = "add_destination";
      intentResult.scope = "destination";
    }
  }

  // Keyword Intent Detection for Natural Language Prompts
  if (!chipMode) {
    if (text.includes("relaxed") || text.includes("slower") || text.includes("less busy") || text.includes("free time")) {
      intentResult.intent = intentResult.targetDay ? "change_day_pace" : "change_trip_pace";
      intentResult.changes.pace = "relaxed";
    } else if (text.includes("packed") || text.includes("more sightseeing") || text.includes("more places")) {
      intentResult.intent = "increase_sightseeing";
      intentResult.changes.pace = "packed";
    } else if (text.includes("drive") || text.includes("travel time") || text.includes("car journey")) {
      intentResult.intent = "reduce_drive_time";
      intentResult.changes.longDriveTolerance = "prefer-shorter";
    } else if (text.includes("cheaper") || text.includes("lower budget") || text.includes("less money")) {
      intentResult.intent = "reduce_budget";
      intentResult.scope = "budget";
    } else if (text.includes("premium") || text.includes("luxury") || text.includes("upgrade")) {
      intentResult.intent = "increase_budget";
      intentResult.scope = "budget";
    } else if (text.includes("shared sumo") || text.includes("shared transport")) {
      intentResult.intent = "change_transport";
      intentResult.changes.transportMode = "shared-sumo";
    } else if (text.includes("private cab") || text.includes("private suv")) {
      intentResult.intent = "change_transport";
      intentResult.changes.transportMode = "private-cab";
    } else if (text.includes("homestay")) {
      intentResult.intent = "change_accommodation";
      intentResult.changes.accommodationType = "homestay";
    } else if (text.includes("hotel")) {
      intentResult.intent = "change_accommodation";
      intentResult.changes.accommodationType = "hotel";
    } else if (text.includes("photography") || text.includes("photo")) {
      intentResult.intent = "increase_photography";
      intentResult.changes.focus = "photography";
    } else if (text.includes("culture") || text.includes("monastery")) {
      intentResult.intent = "increase_culture";
      intentResult.changes.focus = "culture";
    } else if (text.includes("food") || text.includes("cuisine") || text.includes("tea")) {
      intentResult.intent = "increase_food";
      intentResult.changes.focus = "food";
    }
  }

  return intentResult;
}
