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
  let text = (userMessage || "")
    .toLowerCase()
    .replace(/[!?;:]/g, " ")
    .replace(/\.(?!\d)/g, " ")
    .replace(/,(?!\d)/g, "")
    .replace(/\s+/g, " ")
    .trim();

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

  // 3a. BUDGET INCLUSIONS & BREAKDOWN
  if (
    text.includes("what is included in the estimated budget") ||
    text.includes("what is included in the budget") ||
    text.includes("what is included in the cost") ||
    text.includes("what is included") ||
    text.includes("what's included") ||
    text.includes("what does the budget include") ||
    text.includes("budget inclusions") ||
    text.includes("trip inclusions") ||
    text.includes("के के समावेश छ") ||
    text.includes("बजट में क्या शामिल है")
  ) {
    result.intent = "BUDGET_INCLUSIONS";
    result.isMutating = false;
    return result;
  }

  // 3b. INFORMATIONAL BUDGET INQUIRY (Must evaluate before REDUCE_BUDGET)
  if (
    text.includes("how much will a sikkim trip cost") ||
    text.includes("how much does a trip cost") ||
    text.includes("how much does a sikkim trip cost") ||
    text.includes("how much does it cost") ||
    text.includes("how much will it cost") ||
    text.includes("how much will this cost") ||
    text.includes("how much might it cost") ||
    text.includes("how much might a trip cost") ||
    text.includes("what is the cost") ||
    text.includes("trip cost") ||
    text.includes("cost of sikkim trip") ||
    text.includes("cost of a trip") ||
    text.includes("estimated trip cost") ||
    text.includes("खर्च कति लाग्छ") ||
    text.includes("कितना खर्च आएगा") ||
    text.includes("सिक्किम यात्रा का खर्च")
  ) {
    result.intent = "BUDGET_INQUIRY";
    result.isMutating = false;
    return result;
  }

  // 4. BUDGET OPTIMIZATION (Must evaluate after informational BUDGET_INQUIRY)
  if (
    text.includes("reduce budget") ||
    text.includes("reduce my budget") ||
    text.includes("limited budget") ||
    text.includes("tight budget") ||
    text.includes("reduce unnecessary travel costs") ||
    text.includes("reduce travel costs") ||
    text.includes("reduce costs") ||
    text.includes("cheaper") ||
    text.includes("reduce cost") ||
    text.includes("lower budget") ||
    text.includes("save money") ||
    text.includes("less expensive") ||
    text.includes("make it cheaper") ||
    text.includes("affordable") ||
    text.includes("budget to") ||
    (result.entities.budgetAmount && text.includes("budget")) ||
    text.includes("कम") ||
    text.includes("सस्ता") ||
    text.includes("सस्तो") ||
    text.includes("बजेट घटाउनु")
  ) {
    result.intent = "REDUCE_BUDGET";
    result.isMutating = true;
    return result;
  }

  // 5. ITINERARY RECOMMENDATION / SUGGEST TRIP (Evaluated before add/remove)
  if (
    text.includes("recommend") ||
    text.includes("suggest") ||
    text.includes("itinerary for") ||
    text.includes("trip plan") ||
    text.includes("5 day") ||
    text.includes("5-day") ||
    text.includes("५ दिने") ||
    text.includes("सुझाव") ||
    text.includes("सिफारिस")
  ) {
    result.intent = "ITINERARY_RECOMMENDATION";
    result.isMutating = false;
    return result;
  }

  // 5b. DESTINATION ADVICE & OVERVIEW (Must evaluate before ADD_DESTINATION)
  if (
    text.includes("which places should i visit") ||
    text.includes("which places to visit") ||
    text.includes("what places should i visit") ||
    text.includes("what places to visit") ||
    text.includes("what places would be suitable") ||
    text.includes("places would be suitable") ||
    text.includes("suitable places") ||
    text.includes("where should i go") ||
    text.includes("top places to visit") ||
    text.includes("best places in sikkim") ||
    text.includes("places to see") ||
    text.includes("कुन ठाउँ घुम्ने") ||
    text.includes("कहाँ जाना चाहिए")
  ) {
    result.intent = "DESTINATION_ADVICE";
    result.isMutating = false;
    return result;
  }

  // 5c. ROMANTIC / HONEYMOON TRIP
  if (
    text.includes("romantic") ||
    text.includes("romantic trip") ||
    text.includes("honeymoon") ||
    text.includes("couple trip") ||
    text.includes("couples trip") ||
    text.includes("रोमान्टिक") ||
    text.includes("हनीमून")
  ) {
    result.intent = "ROMANTIC_TRIP";
    result.isMutating = false;
    return result;
  }

  // 5d. FAMILY VACATION & SURPRISE
  if (
    text.includes("surprise my family") ||
    text.includes("family vacation") ||
    text.includes("family trip") ||
    text.includes("take my family") ||
    text.includes("with my family") ||
    text.includes("my family") ||
    text.includes("suitable for a family") ||
    text.includes("suitable for family") ||
    text.includes("with kids") ||
    text.includes("with parents") ||
    text.includes("परिवार") ||
    text.includes("बालबच्चा")
  ) {
    result.intent = "FAMILY_TRIP";
    result.isMutating = false;
    return result;
  }

  // 5e. SNOWFALL & WINTER INQUIRY
  if (
    text.includes("snowfall") ||
    text.includes("experience snowfall") ||
    text.includes("see snow") ||
    text.includes("snow in sikkim") ||
    text.includes("बर्फ") ||
    text.includes("हिउँ")
  ) {
    result.intent = "SNOWFALL_INQUIRY";
    result.isMutating = false;
    return result;
  }

  // 5e-1. BEST TIME TO VISIT / SEASON
  if (
    text.includes("which month would be best") ||
    text.includes("which month is best") ||
    text.includes("best month to visit") ||
    text.includes("best month") ||
    text.includes("best time to visit") ||
    text.includes("best season") ||
    text.includes("when should i visit") ||
    text.includes("कुन समय राम्रो") ||
    text.includes("सिक्किम जाने का सबसे अच्छा समय")
  ) {
    result.intent = "BEST_TIME_TO_VISIT";
    result.isMutating = false;
    return result;
  }

  // 5e-2. NORTH SIKKIM INQUIRY
  if (
    !text.includes("permit") &&
    !text.includes("परमिट") &&
    !text.includes("ilp") &&
    !text.includes("pap") &&
    (
      text.includes("can i visit north sikkim") ||
      text.includes("visit north sikkim") ||
      text.includes("how to visit north sikkim") ||
      text.includes("north sikkim trip") ||
      text.includes("north sikkim") ||
      text.includes("उत्तर सिक्किम")
    )
  ) {
    result.intent = "NORTH_SIKKIM_INQUIRY";
    result.isMutating = false;
    return result;
  }

  // 5f. PEACEFUL & LESS CROWDED GETAWAY
  if (
    text.includes("peaceful vacation") ||
    text.includes("peaceful trip") ||
    text.includes("peaceful") ||
    text.includes("less crowded") ||
    text.includes("somewhere less crowded") ||
    text.includes("offbeat") ||
    text.includes("quiet place") ||
    text.includes("quiet vacation") ||
    text.includes("peace and quiet") ||
    text.includes("भीड़भाड़ से दूर") ||
    text.includes("शान्त ठाउँ") ||
    text.includes("शांत जगह")
  ) {
    result.intent = "PEACEFUL_GETAWAY";
    result.isMutating = false;
    return result;
  }

  // 5g. TRAVEL ASPIRATION (Wishing to visit, falling in love with Sikkim)
  if (
    text.includes("wish i could visit") ||
    text.includes("wish to visit") ||
    text.includes("falling in love with this place") ||
    text.includes("falling in love with sikkim") ||
    text.includes("fall in love with this place") ||
    text.includes("want to experience these mountains") ||
    text.includes("want to experience the mountains") ||
    text.includes("experience these mountains") ||
    text.includes("dream of visiting") ||
    text.includes("सिक्किम घुम्ने रहर") ||
    text.includes("सिक्किम जाने की इच्छा")
  ) {
    result.intent = "TRAVEL_ASPIRATION";
    result.isMutating = false;
    return result;
  }

  // 5h. TRAVEL INSPIRATION & ADMIRATION (Landscape beauty & wonder)
  if (
    text.includes("sikkim looks beautiful") ||
    text.includes("looks beautiful") ||
    text.includes("looks so beautiful") ||
    text.includes("never seen such beautiful mountains") ||
    text.includes("beautiful mountains") ||
    text.includes("mountains are magnificent") ||
    text.includes("sikkim is stunning") ||
    text.includes("so breathtaking") ||
    text.includes("सिक्किम कति सुन्दर") ||
    text.includes("खूबसूरत पहाड़")
  ) {
    result.intent = "TRAVEL_INSPIRATION";
    result.isMutating = false;
    return result;
  }

  // 5i. START PLANNING VACATION
  if (
    text.includes("ready to plan my vacation") ||
    text.includes("ready to plan") ||
    text.includes("start planning") ||
    text.includes("plan my vacation") ||
    text.includes("let's plan") ||
    text.includes("योजना बनाउन तयार") ||
    text.includes("प्लान शुरू करें")
  ) {
    result.intent = "START_PLANNING";
    result.isMutating = false;
    return result;
  }

  // 6. EXPLAIN DESTINATION (Evaluated before add/remove)
  if (text.startsWith("why") || text.includes("why ") || text.includes("why did you choose") || text.includes("why is") || text.includes("किन ")) {
    result.intent = "EXPLAIN_DESTINATION";
    result.isMutating = false;
    return result;
  }

  // 7. DESTINATION MANAGEMENT (ADD / REMOVE) - Only triggers if destination entity is present
  if (
    (text.includes("remove ") || text.includes("delete ") || text.includes("drop ") || text.includes("skip ") || text.includes("हटाएं") || text.includes("हटाउनु")) &&
    result.entities.destinationSlug
  ) {
    result.intent = "REMOVE_DESTINATION";
    result.isMutating = true;
    return result;
  }

  if (
    (text.startsWith("add ") || text.startsWith("include ") || text.includes("please add ") || text.includes("also add ") || text.includes("जोड़ें") || text.includes("थप्नुहोस्")) &&
    result.entities.destinationSlug
  ) {
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

  // 20. BOOK TRIP / RESERVE JOURNEY
  if (
    text.includes("book this") ||
    text.includes("book my") ||
    text.includes("request this trip") ||
    text.includes("book a trip") ||
    text.includes("book trip") ||
    text.includes("book now") ||
    text.includes("want to book") ||
    text.includes("can i reserve") ||
    text.includes("reserve this itinerary") ||
    text.includes("reserve my trip") ||
    text.includes("reserve trip") ||
    text.includes("can i submit my reservation request") ||
    text.includes("submit my reservation request") ||
    text.includes("submit reservation request") ||
    text.includes("reservation request") ||
    text.includes("how do i confirm it") ||
    text.includes("confirm it") ||
    text.includes("how do i confirm my booking") ||
    text.includes("confirm my booking") ||
    text.includes("confirm booking") ||
    text.includes("how to book") ||
    text.includes("request booking") ||
    text.includes("order a trip") ||
    text.includes("want to order") ||
    text.includes("order now") ||
    text.includes("order") ||
    text.includes("बुकिंग करना है") ||
    text.includes("बुक गर्नुहोस्") ||
    text.includes("बुकिङ गर्न चाहन्छु") ||
    text.includes("बुक") ||
    text.includes("बुकिङ") ||
    text.includes("अर्डर")
  ) {
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

  // 22. EMOTIONAL / FRIENDLY COMPLIMENT ("i love you", "you are amazing", "you are so sweet", "marry me")
  if (
    text.includes("love you") ||
    text.includes("i love u") ||
    text.includes("love u") ||
    text === "i love" ||
    text.includes("marry me") ||
    text.includes("you are cute") ||
    text.includes("you are sweet") ||
    text.includes("so sweet") ||
    text.includes("you are best") ||
    text.includes("you are awesome") ||
    text.includes("you're amazing") ||
    text.includes("you are amazing") ||
    text.includes("you are wonderful") ||
    text.includes("you rock") ||
    text.includes("प्यार") ||
    text.includes("माया गर्छु") ||
    text.includes("माया")
  ) {
    result.intent = "LOVE_COMPLIMENT";
    result.isMutating = false;
    return result;
  }

  // 23. GREETINGS & CASUAL CHAT ("hello", "hi", "hey", "tashi delek", "नमस्ते")
  if (
    text === "hi" ||
    text === "hello" ||
    text === "hey" ||
    text === "namaste" ||
    text.includes("tashi delek") ||
    text === "नमस्ते" ||
    text === "नमस्कार" ||
    text.startsWith("hello ") ||
    text.startsWith("hi ") ||
    text.startsWith("hey ")
  ) {
    result.intent = "GREETING";
    result.isMutating = false;
    return result;
  }

  // 24. GRATITUDE & APPRECIATION ("thank you", "thanks", "dhanyabad", "धन्यवाद")
  if (
    text.includes("thank") ||
    text.includes("thx") ||
    text.includes("धन्यवाद") ||
    text.includes("धेरै धन्यवाद")
  ) {
    result.intent = "GRATITUDE";
    result.isMutating = false;
    return result;
  }

  return result;
}
