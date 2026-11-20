import { destinations as allDests } from "../../data/destinations";

/**
 * Common misspellings and transliterations for Sikkim destinations.
 */
const DESTINATION_ALIASES = {
  peling: "pelling",
  pelink: "pelling",
  पेलिंग: "pelling",
  gangtok: "gangtok",
  gantok: "gangtok",
  गंगटोक: "gangtok",
  गान्तोक: "gangtok",
  lachung: "lachung",
  lachun: "lachung",
  लाचुंग: "lachung",
  लाचुङ: "lachung",
  lachen: "lachen",
  लाचेन: "lachen",
  yumthang: "yumthang",
  "yumthang valley": "yumthang",
  युमथांग: "yumthang",
  युमथाङ: "yumthang",
  ravangla: "ravangla",
  rabangla: "ravangla",
  रवांगला: "ravangla",
  namchi: "namchi",
  नामची: "namchi",
  yuksom: "yuksom",
  yuksam: "yuksom",
  युक्सोम: "yuksom",
  zuluk: "zuluk",
  dzuluk: "zuluk",
  जुलुक: "zuluk",
  tsomgo: "tsomgo",
  changu: "tsomgo",
  "changu lake": "tsomgo",
  "tsomgo lake": "tsomgo",
  छोङ्गो: "tsomgo",
  nathula: "nathula",
  "natu la": "nathula",
  "nathu la": "nathula",
  नाथुला: "nathula",
  gurudongmar: "gurudongmar",
  "guru dongmar": "gurudongmar",
  गुरुडोंगमार्: "gurudongmar"
};

/**
 * Copilot Intent Parser.
 * Maps raw natural language user messages into structured intent objects and extracted entities.
 * Handles English, Hindi, and Nepali, spelling variants, and follow-ups.
 */
export function parseCopilotIntent(userMessage) {
  let text = (userMessage || "").toLowerCase().trim();

  // Normalize spelling aliases
  for (const [alias, canonical] of Object.entries(DESTINATION_ALIASES)) {
    if (text.includes(alias) && alias !== canonical) {
      text = text.replace(new RegExp(alias, "gi"), canonical);
    }
  }

  const result = {
    intent: "GENERAL_INQUIRY",
    confidence: 0.85,
    entities: {},
    isMutating: false,
    rawText: text
  };

  // Detect specific day number (Day 1, Day 2, दिन 1, दिन २, etc.)
  const dayMatch = text.match(/(?:day|दिन)\s*([0-9१-९]+)/i);
  if (dayMatch) {
    const rawDay = dayMatch[1]
      .replace(/१/g, "1")
      .replace(/२/g, "2")
      .replace(/३/g, "3")
      .replace(/४/g, "4")
      .replace(/५/g, "5")
      .replace(/६/g, "6")
      .replace(/७/g, "7")
      .replace(/८/g, "8")
      .replace(/९/g, "9");
    result.entities.dayNumber = Number(rawDay);
  }

  // Detect destination slug/name
  const matchedDest = allDests.find((d) =>
    text.includes(d.slug) || text.includes(d.name.toLowerCase())
  );
  if (matchedDest) {
    result.entities.destination = matchedDest.name;
    result.entities.destinationSlug = matchedDest.slug;
  }

  // Word to number helper (English, Hindi, Nepali)
  const WORD_NUMBERS = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9, दस: 10
  };

  // Detect duration numbers (e.g., "add 2 days", "extra day", "four days", "reduce to 4 days", "एक दिन और", "एक दिन थप्नुहोस्")
  const durationMatch = text.match(/(?:reduce|shorten|extend|make\s+it|change\s+to|trip\s+to|add)?\s*([0-9१-९]+|one|two|three|four|five|six|seven|eight|nine|ten|एक|दो|तीन|चार|पांच|पाँच)?\s*(extra|more|और|थप)?\s*(?:days?|दिन)/i);
  if (durationMatch) {
    const rawVal = durationMatch[1];
    let parsedNum = null;
    if (rawVal) {
      const normalizedVal = rawVal
        .replace(/१/g, "1").replace(/२/g, "2").replace(/३/g, "3").replace(/४/g, "4")
        .replace(/५/g, "5").replace(/६/g, "6").replace(/७/g, "7").replace(/८/g, "8").replace(/९/g, "9");
      parsedNum = WORD_NUMBERS[normalizedVal] || Number(normalizedVal);
    }
    if (parsedNum) {
      if (text.includes("extend") || text.includes("extra") || text.includes("more") || text.includes("और") || text.includes("थप")) {
        result.entities.durationDiff = parsedNum;
      } else {
        result.entities.targetDuration = parsedNum;
      }
    }
  }

  // Detect budget amount (e.g., "budget to ₹15,000", "under 20k", "max 25000", "15000 तक")
  const textWithoutCommas = text.replace(/,/g, "");
  const budgetMatch = textWithoutCommas.match(/(?:budget|cost|price|under|to|max|बजट|खर्च)\s*(?:of|is|to|का)?\s*(?:₹|rs\.?|inr|रु)?\s*(\d+)(k)?/i);
  if (budgetMatch) {
    let amt = Number(budgetMatch[1]);
    if (budgetMatch[2]) amt *= 1000;
    if (amt >= 500) {
      result.entities.budgetAmount = amt;
    }
  }

  // Detect accommodation preference
  if (text.includes("homestay") || text.includes("होमस्टे")) {
    result.entities.accommodationType = "homestay";
  } else if (text.includes("resort") || text.includes("रिसॉर्ट")) {
    result.entities.accommodationType = "resort";
  } else if (text.includes("hotel") || text.includes("होटल")) {
    result.entities.accommodationType = "hotel";
  }

  // Detect transport mode
  if (text.includes("shared") || text.includes("sumo") || text.includes("साझा") || text.includes("शेयर्ड")) {
    result.entities.transportMode = "shared-sumo";
  } else if (text.includes("private") || text.includes("cab") || text.includes("suv") || text.includes("प्राइवेट") || text.includes("टैक्सी")) {
    result.entities.transportMode = "private-cab";
  }

  // Detect travel pace
  if (text.includes("relaxed") || text.includes("slower") || text.includes("आराम") || text.includes("शान्त")) {
    result.entities.pace = "relaxed";
  } else if (text.includes("packed") || text.includes("fast") || text.includes("तेज़")) {
    result.entities.pace = "packed";
  }

  // ─── STRICT ORDERED INTENT CLASSIFICATION ───

  // 1. DURATION CHANGE (Must evaluate before generic "add" or "remove")
  const hasDurationKeywords = text.includes("add a day") ||
    text.includes("add another day") ||
    text.includes("add 1 day") ||
    text.includes("add 2 days") ||
    text.includes("extra day") ||
    text.includes("another day") ||
    text.includes("extend trip") ||
    text.includes("shorten trip") ||
    text.includes("reduce days") ||
    text.includes("more days") ||
    text.includes("एक दिन और") ||
    text.includes("एक दिन थप्नुहोस्") ||
    text.includes("दिन थप्नु") ||
    text.includes("दिन घटाउनु") ||
    ((result.entities.targetDuration || result.entities.durationDiff) && (text.includes("extend") || text.includes("reduce") || text.includes("shorten") || text.includes("make it") || text.includes("change duration") || text.includes("trip to") || text.includes("अवधि")));

  if (hasDurationKeywords) {
    result.intent = "CHANGE_DURATION";
    result.isMutating = true;
    if (!result.entities.durationDiff && !result.entities.targetDuration) {
      result.entities.durationDiff = 1;
    }
    return result;
  }

  // 2. REMOVE ACTIVITY (Must evaluate before generic "remove")
  const isRemoveActivity = (text.includes("remove") || text.includes("delete") || text.includes("drop") || text.includes("हटाएं") || text.includes("हटाउनुहोस्")) &&
    (text.includes("activity") || text.includes("sightseeing") || text.includes("stop") || text.includes("गतिविधि") || text.includes("क्रियाकलाप"));

  if (isRemoveActivity) {
    result.intent = "REMOVE_ACTIVITY";
    result.isMutating = true;
    if (!result.entities.dayNumber) {
      result.entities.dayNumber = 2; // Default to Day 2 if unspecified
    }
    return result;
  }

  // 3. REPLACE DESTINATION ("replace X with Y" / "swap X for Y" / "instead of X go to Y")
  const replaceMatch = text.match(/(?:replace|swap)\s+([a-z]+)\s+(?:with|for)\s+([a-z]+)/i) ||
    text.match(/instead of\s+([a-z]+)\s+(?:go to|visit|add)?\s*([a-z]+)/i);
  if (replaceMatch) {
    const oldD = replaceMatch[1].toLowerCase();
    const newD = replaceMatch[2].toLowerCase();
    result.intent = "REPLACE_DESTINATION";
    result.isMutating = true;
    result.entities.oldDestination = DESTINATION_ALIASES[oldD] || oldD;
    result.entities.newDestination = DESTINATION_ALIASES[newD] || newD;
    return result;
  }

  // 4. BUDGET OPTIMIZATION (Must evaluate before generic recommendations)
  if (text.includes("reduce budget") || text.includes("reduce my budget") || text.includes("cheaper") || text.includes("reduce cost") || text.includes("lower budget") || text.includes("save money") || text.includes("less expensive") || text.includes("affordable") || text.includes("budget to") || (result.entities.budgetAmount && text.includes("budget")) || text.includes("कम") || text.includes("सस्ता") || text.includes("सस्तो") || text.includes("बजेट घटाउनु")) {
    result.intent = "REDUCE_BUDGET";
    result.isMutating = true;
    return result;
  }

  // 5. ITINERARY RECOMMENDATION / SUGGEST TRIP (Evaluated before add/remove)
  if (text.includes("recommend") || text.includes("suggest") || text.includes("itinerary for") || text.includes("trip plan") || text.includes("5 day") || text.includes("५ दिने") || text.includes("सुझाव") || text.includes("सिफारिस")) {
    result.intent = "ITINERARY_RECOMMENDATION";
    result.isMutating = false;
    return result;
  }

  // 6. EXPLAIN DESTINATION (Evaluated before add/remove)
  if (text.startsWith("why") || text.includes("why ") || text.includes("why did you choose") || text.includes("why is") || text.includes("किन ")) {
    result.intent = "EXPLAIN_DESTINATION";
    result.isMutating = false;
    return result;
  }

  // 7. DESTINATION MANAGEMENT (ADD / REMOVE)
  if (text.includes("remove") || text.includes("delete") || text.includes("take out") || text.includes("don't want to visit") || text.includes("skip") || text.includes("हटाएं") || text.includes("हटाउनु")) {
    result.intent = "REMOVE_DESTINATION";
    result.isMutating = true;
    return result;
  }

  if (text.includes("add ") || text.includes("include ") || text.includes("visit ") || text.includes("want to visit") || text.includes("जोड़ें") || text.includes("थप्नुहोस्")) {
    result.intent = "ADD_DESTINATION";
    result.isMutating = true;
    return result;
  }

  // 8. PACING / RELAX DAY
  if (text.includes("relaxed") || text.includes("slower") || text.includes("slow down") || text.includes("less busy") || text.includes("slower pace") || text.includes("free time") || text.includes("rest time") || text.includes("reduce sightseeing") || text.includes("आराम") || text.includes("शान्त")) {
    result.intent = "MODIFY_DAY";
    result.isMutating = true;
    return result;
  }

  // 7. DRIVING / ROUTE OPTIMIZATION
  if (text.includes("drive") || text.includes("driving") || text.includes("long travel") || text.includes("road travel") || text.includes("गाड़ी") || text.includes("सड़क यात्रा")) {
    result.intent = "REDUCE_DRIVING";
    result.isMutating = true;
    return result;
  }

  // 8. TRANSPORT MODE
  if (text.includes("shared transport") || text.includes("shared taxi") || text.includes("shared sumo") || text.includes("private cab") || text.includes("change transport") || text.includes("साझा सवारी") || text.includes("सवारी")) {
    result.intent = "CHANGE_TRANSPORT";
    result.isMutating = true;
    return result;
  }

  // 9. ACCOMMODATION LOOKUP & TYPE
  const isStayInquiry = text.includes("where are we staying") ||
    text.includes("where will we stay") ||
    text.includes("where do we stay") ||
    text.includes("where am i staying") ||
    text.includes("where are we sleeping") ||
    text.includes("what is our hotel") ||
    text.includes("which hotel") ||
    text.includes("what hotel") ||
    text.includes("which homestay") ||
    text.includes("stay tonight") ||
    text.includes("कहाँ रुकेंगे") ||
    text.includes("कहाँ बस्ने") ||
    text.includes("होटल कुन हो");

  if (isStayInquiry) {
    result.intent = "ACCOMMODATION_LOOKUP";
    result.isMutating = false;
    return result;
  }

  if (text.includes("stay preference") || text.includes("homestay") || text.includes("change hotel") || text.includes("change accommodation") || text.includes("budget hotel") || text.includes("resort") || text.includes("होमस्टे") || text.includes("होटल")) {
    result.intent = "CHANGE_ACCOMMODATION";
    result.isMutating = true;
    return result;
  }

  // 10. PERMITS (ILP / PAP / Nathula / North Sikkim)
  if (text.includes("permit") || text.includes("ilp") || text.includes("pap") || text.includes("permid") || text.includes("pass") || text.includes("परमिट") || text.includes("अनुमति")) {
    result.intent = "PERMIT_INQUIRY";
    result.isMutating = false;
    return result;
  }

  // 11. ALTITUDE SICKNESS & ACCLIMATIZATION
  if (text.includes("altitude") || text.includes("ams") || text.includes("oxygen") || text.includes("acclimat") || text.includes("high altitude") || text.includes("ऊंचाई") || text.includes("लेक लाग्ने") || text.includes("अक्सिजन")) {
    result.intent = "ALTITUDE_ADVISORY";
    result.isMutating = false;
    return result;
  }

  // 12. FOOD & CULTURE
  if (text.includes("food") || /\beat\b/.test(text) || text.includes("cuisine") || text.includes("momo") || text.includes("thukpa") || text.includes("gundruk") || text.includes("monaster") || text.includes("culture") || text.includes("खाना") || text.includes("भोजन") || text.includes("गुम्बा") || text.includes("मठ")) {
    result.intent = "FOOD_CULTURE";
    result.isMutating = false;
    return result;
  }


  // 14. CURRENT WEATHER
  if (text.includes("weather") || text.includes("rain") || text.includes("forecast") || text.includes("temperature") || text.includes("मौसम") || text.includes("तापक्रम")) {
    result.intent = "CURRENT_WEATHER";
    result.isMutating = false;
    return result;
  }

  // 15. ROAD & ROUTE STATUS
  if (text.includes("road") || text.includes("advisory") || text.includes("traffic") || text.includes("landslide") || text.includes("nh10") || text.includes("सड़क") || text.includes("बाटो") || text.includes("पहिरो")) {
    result.intent = "CURRENT_ROUTE_STATUS";
    result.isMutating = false;
    return result;
  }


  // 17. SCENARIO SIMULATION
  if (text.includes("what if") || text.includes("simulate") || text.includes("what happens if")) {
    result.intent = "SIMULATE_SCENARIO";
    result.isMutating = false;
    return result;
  }

  // 18. PACKING ADVICE
  if (text.includes("pack") || text.includes("packing") || text.includes("clothes") || text.includes("what to carry") || text.includes("कपड़े") || text.includes("लुगा")) {
    result.intent = "PACKING_ADVICE";
    result.isMutating = false;
    return result;
  }

  // 19. EXPLAIN ITINERARY
  if (text.includes("explain my trip") || text.includes("explain itinerary") || text.includes("summarize") || text.includes("विवरण")) {
    result.intent = "EXPLAIN_ITINERARY";
    result.isMutating = false;
    return result;
  }

  // 20. BOOK TRIP
  if (text.includes("book this") || text.includes("book my") || text.includes("request this trip") || text.includes("book trip") || text.includes("बुक") || text.includes("बुकिङ")) {
    result.intent = "BOOK_TRIP";
    result.isMutating = true;
    return result;
  }

  // 21. BOOKING INQUIRIES
  if (text.includes("what am i booking") || text.includes("finalized") || text.includes("happens after") || text.includes("edit my trip") || text.includes("booking")) {
    result.intent = "BOOKING_QUESTION";
    result.isMutating = false;
    return result;
  }

  return result;
}
