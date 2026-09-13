import { destinations as allDests } from "../../data/destinations";

/**
 * Copilot Intent Parser.
 * Maps raw natural language user messages into structured intent objects and extracted entities.
 */
export function parseCopilotIntent(userMessage) {
  const text = (userMessage || "").toLowerCase().trim();

  const result = {
    intent: "GENERAL_INQUIRY",
    confidence: 0.85,
    entities: {},
    isMutating: false,
    rawText: text
  };

  // Detect specific day number
  const dayMatch = text.match(/day\s*(\d+)/i);
  if (dayMatch) {
    result.entities.dayNumber = Number(dayMatch[1]);
  }

  // Detect destination slug/name
  const matchedDest = allDests.find((d) =>
    text.includes(d.slug) || text.includes(d.name.toLowerCase())
  );
  if (matchedDest) {
    result.entities.destination = matchedDest.name;
    result.entities.destinationSlug = matchedDest.slug;
  }

  // Detect duration numbers (e.g., "add 2 days", "extra day")
  const durationMatch = text.match(/(\d+)\s*(extra|more)?\s*days?/i);
  if (durationMatch) {
    result.entities.durationDiff = Number(durationMatch[1]);
  }

  // INTENT CLASSIFICATION RULES

  if (text.includes("cheaper") || text.includes("reduce cost") || text.includes("lower budget") || text.includes("save money") || text.includes("less expensive")) {
    result.intent = "REDUCE_BUDGET";
    result.isMutating = true;
  } else if (text.includes("remove") || text.includes("delete") || text.includes("take out") || text.includes("don't want to visit")) {
    result.intent = "REMOVE_DESTINATION";
    result.isMutating = true;
  } else if (text.includes("add ") || text.includes("include ") || text.includes("replace ") || text.includes("instead of")) {
    result.intent = "ADD_DESTINATION";
    result.isMutating = true;
  } else if (text.includes("relaxed") || text.includes("less busy") || text.includes("slower pace") || text.includes("free time")) {
    result.intent = "MODIFY_DAY";
    result.isMutating = true;
  } else if (text.includes("drive") || text.includes("driving") || text.includes("long travel") || text.includes("car ride")) {
    result.intent = "REDUCE_DRIVING";
    result.isMutating = true;
  } else if (text.includes("shared transport") || text.includes("shared taxi") || text.includes("private cab")) {
    result.intent = "CHANGE_TRANSPORT";
    result.isMutating = true;
  } else if (text.includes("weather") || text.includes("rain") || text.includes("forecast") || text.includes("temperature")) {
    result.intent = "CURRENT_WEATHER";
    result.isMutating = false;
  } else if (text.includes("road") || text.includes("advisory") || text.includes("traffic") || text.includes("landslide")) {
    result.intent = "CURRENT_ROUTE_STATUS";
    result.isMutating = false;
  } else if (text.includes("why did you choose") || text.includes("why is") || text.includes("why lachung") || text.includes("why pelling")) {
    result.intent = "EXPLAIN_DESTINATION";
    result.isMutating = false;
  } else if (text.includes("what if") || text.includes("simulate") || text.includes("what happens if")) {
    result.intent = "SIMULATE_SCENARIO";
    result.isMutating = false;
  } else if (text.includes("pack") || text.includes("packing") || text.includes("clothes") || text.includes("what to carry")) {
    result.intent = "PACKING_ADVICE";
    result.isMutating = false;
  } else if (text.includes("explain my trip") || text.includes("explain itinerary") || text.includes("summarize")) {
    result.intent = "EXPLAIN_ITINERARY";
    result.isMutating = false;
  } else if (text.includes("book this") || text.includes("book my") || text.includes("request this trip") || text.includes("book trip")) {
    result.intent = "BOOK_TRIP";
    result.isMutating = true;
  } else if (text.includes("what am i booking") || text.includes("permit") || text.includes("finalized") || text.includes("happens after") || text.includes("change hotel") || text.includes("change accommodation") || text.includes("change transport") || text.includes("edit my trip") || text.includes("booking")) {
    result.intent = "BOOKING_QUESTION";
    result.isMutating = false;
  }

  return result;
}
