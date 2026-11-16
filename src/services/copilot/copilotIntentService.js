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

  // Word to number helper
  const WORD_NUMBERS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
  };

  // Detect duration numbers (e.g., "add 2 days", "extra day", "four days", "reduce to 4 days")
  const durationMatch = text.match(/(?:reduce|shorten|extend|make\s+it|change\s+to|trip\s+to|add)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(extra|more)?\s*days?/i);
  if (durationMatch) {
    const rawVal = durationMatch[1];
    const parsedNum = rawVal ? (WORD_NUMBERS[rawVal] || Number(rawVal)) : null;
    if (parsedNum) {
      if (text.includes("extend") || text.includes("extra") || text.includes("more")) {
        result.entities.durationDiff = parsedNum;
      } else {
        result.entities.targetDuration = parsedNum;
      }
    }
  }

  // Detect budget amount (e.g., "budget to ₹15,000", "under 20k", "max 25000")
  const textWithoutCommas = text.replace(/,/g, "");
  const budgetMatch = textWithoutCommas.match(/(?:budget|cost|price|under|to|max)\s*(?:of|is|to)?\s*(?:₹|rs\.?|inr)?\s*(\d+)(k)?/i);
  if (budgetMatch) {
    let amt = Number(budgetMatch[1]);
    if (budgetMatch[2]) amt *= 1000;
    if (amt >= 500) {
      result.entities.budgetAmount = amt;
    }
  }

  // Detect accommodation preference
  if (text.includes("homestay")) {
    result.entities.accommodationType = "homestay";
  } else if (text.includes("resort")) {
    result.entities.accommodationType = "resort";
  } else if (text.includes("hotel")) {
    result.entities.accommodationType = "hotel";
  }

  // Detect transport mode
  if (text.includes("shared") || text.includes("sumo")) {
    result.entities.transportMode = "shared-sumo";
  } else if (text.includes("private") || text.includes("cab") || text.includes("suv")) {
    result.entities.transportMode = "private-cab";
  }

  // Detect travel pace
  if (text.includes("relaxed") || text.includes("slower")) {
    result.entities.pace = "relaxed";
  } else if (text.includes("packed") || text.includes("fast")) {
    result.entities.pace = "packed";
  }

  // INTENT CLASSIFICATION RULES

  if (text.includes("cheaper") || text.includes("reduce cost") || text.includes("lower budget") || text.includes("save money") || text.includes("less expensive") || text.includes("affordable") || text.includes("budget to")) {
    result.intent = "REDUCE_BUDGET";
    result.isMutating = true;
  } else if (text.includes("remove") || text.includes("delete") || text.includes("take out") || text.includes("don't want to visit") || text.includes("skip")) {
    result.intent = "REMOVE_DESTINATION";
    result.isMutating = true;
  } else if (text.includes("add ") || text.includes("include ") || text.includes("visit ") || text.includes("instead of")) {
    result.intent = "ADD_DESTINATION";
    result.isMutating = true;
  } else if (text.includes("relaxed") || text.includes("less busy") || text.includes("slower pace") || text.includes("free time") || text.includes("rest time") || text.includes("reduce sightseeing")) {
    result.intent = "MODIFY_DAY";
    result.isMutating = true;
  } else if (text.includes("drive") || text.includes("driving") || text.includes("long travel") || text.includes("road travel")) {
    result.intent = "REDUCE_DRIVING";
    result.isMutating = true;
  } else if (text.includes("shared transport") || text.includes("shared taxi") || text.includes("shared sumo") || text.includes("private cab") || text.includes("change transport")) {
    result.intent = "CHANGE_TRANSPORT";
    result.isMutating = true;
  } else if (text.includes("stay preference") || text.includes("homestay") || text.includes("change hotel") || text.includes("change accommodation") || text.includes("budget hotel") || text.includes("resort")) {
    result.intent = "CHANGE_ACCOMMODATION";
    result.isMutating = true;
  } else if ((result.entities.targetDuration || result.entities.durationDiff) && (text.includes("extend") || text.includes("reduce") || text.includes("shorten") || text.includes("make it") || text.includes("change duration") || text.includes("trip to"))) {
    result.intent = "CHANGE_DURATION";
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
  } else if (text.includes("what am i booking") || text.includes("permit") || text.includes("finalized") || text.includes("happens after") || text.includes("edit my trip") || text.includes("booking")) {
    result.intent = "BOOKING_QUESTION";
    result.isMutating = false;
  }

  return result;
}
