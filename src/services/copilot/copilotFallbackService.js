import { executeCopilotTool } from "./copilotToolExecutor";
import { destinations as allDests } from "../../data/destinations";
import { buildMutationProposal } from "./copilotMutationService";
import { getMultilingualTemplates } from "../i18n/multilingualTemplates";

/**
 * Deterministic Copilot Fallback Executor.
 * Processes natural language requests deterministically using Modules 1–7 services
 * when offline or without LLM backend access.
 */
export async function executeFallbackCopilotRequest(plannerState, intent, normalizedContext) {
  const { intent: intentType, entities } = intent;
  const currentItinerary = plannerState.itinerary?.current;
  const lang = normalizedContext?.language || "en";
  const t = getMultilingualTemplates(lang);

  // ─── ACTIONABLE MUTATION PROPOSALS (Categories A–F) ───
  if (intent.isMutating && intentType !== "BOOK_TRIP") {
    const { validation, proposal } = buildMutationProposal({ intent, plannerState });

    if (!validation.isValid) {
      return {
        text: `I cannot apply that modification: ${validation.errors.join(". ")}`,
        actionCard: null
      };
    }

    if (proposal) {
      return {
        text: proposal.description,
        actionCard: proposal
      };
    }
  }

  // 1b. ACCOMMODATION SPECIFIC LOOKUP
  if (intentType === "ACCOMMODATION_LOOKUP") {
    const days = currentItinerary?.days || [];
    const hasItinerary = days.length > 0;
    const requestedDay = entities?.dayNumber || 1;

    if (!hasItinerary) {
      return {
        text: "You haven't generated an itinerary yet, so accommodations haven't been assigned. Please create or generate your itinerary first!",
        sourceBadge: { name: "Itinerary Engine", confidence: "HIGH" },
        language: lang
      };
    }

    if (requestedDay < 1 || requestedDay > days.length) {
      return {
        text: `Your current trip has ${days.length} days. Please specify a valid day number between 1 and ${days.length}.`,
        sourceBadge: { name: "Itinerary Engine", confidence: "HIGH" },
        language: lang
      };
    }

    const daySchedule = days[requestedDay - 1];
    const stayObj = daySchedule?.stay;
    const stayName = typeof stayObj === "string" ? stayObj : stayObj?.name;
    const stayLoc = stayObj?.location || daySchedule?.baseLocation || daySchedule?.overnightLocation;

    if (stayName) {
      return {
        text: `On Day ${requestedDay}, your stay is scheduled at ${stayName}${stayLoc ? ` in ${stayLoc}` : ""}.`,
        dataCard: {
          title: `Day ${requestedDay} Accommodation`,
          details: [
            `Property: ${stayName}`,
            `Location: ${stayLoc || "Sikkim"}`,
            `Type: ${stayObj?.type || "Hotel / Homestay"}`
          ]
        },
        sourceBadge: { name: "Itinerary Stays Master", confidence: "HIGH" },
        language: lang
      };
    }

    return {
      text: `For Day ${requestedDay}${stayLoc ? ` in ${stayLoc}` : ""}, specific accommodation has not been selected yet. You can choose a homestay, hotel, or resort in the Stay step!`,
      sourceBadge: { name: "Itinerary Engine", confidence: "HIGH" },
      language: lang
    };
  }

  // 2. EXPLAIN DESTINATION ("Why Lachung?")
  if (intentType === "EXPLAIN_DESTINATION") {
    const destName = entities.destination || "Lachung";
    const destSlug = entities.destinationSlug || "lachung";
    const found = allDests.find((d) => d.slug === destSlug || d.name.toLowerCase() === destName.toLowerCase());

    if (found) {
      return {
        text: `${found.name} was recommended for your itinerary because it offers high mountain scenic value (${found.highlights?.slice(0, 2).join(", ")}), fits your ${plannerState.duration}-day circuit, and aligns with your ${plannerState.travelStyle} travel style.`,
        dataCard: {
          title: `Why ${found.name}?`,
          details: [
            `Region: ${found.district}`,
            `Highlights: ${found.highlights?.join(", ")}`,
            `Ideal Stay: ${found.bestStayDuration || "1-2 days"}`
          ]
        }
      };
    }
  }

  // 3. CURRENT WEATHER
  if (intentType === "CURRENT_WEATHER") {
    const targetSlug = entities.destinationSlug || plannerState.destinations.selected[0] || "gangtok";
    const weatherRes = await executeCopilotTool("getCurrentWeather", targetSlug);
    const w = weatherRes.data;

    return {
      text: `Current forecast for ${targetSlug.toUpperCase()}: ${w.condition} ${w.icon} (${w.temperature.min}°C – ${w.temperature.max}°C). ${w.summary}`,
      sourceBadge: w.source
    };
  }

  // 4. PACKING ADVICE
  if (intentType === "PACKING_ADVICE") {
    const isNorthSikkim = plannerState.destinations.selected.some((s) => s.includes("lachung") || s.includes("yumthang"));
    return {
      text: `For your ${plannerState.duration}-day Sikkim trip, pack heavy thermal layers, windproof jacket, sturdy walking shoes, lip balm, and passport photos (for permits). ${isNorthSikkim ? "North Sikkim reaches sub-zero temperatures at Yumthang/Zero Point." : ""}`
    };
  }

  // 5. EXPLAIN ITINERARY
  if (intentType === "EXPLAIN_ITINERARY" && currentItinerary) {
    return {
      text: `Your ${currentItinerary.overview?.duration}-day itinerary covers ${currentItinerary.overview?.route?.join(" → ")}. It balances high-altitude mountain vistas with cultural stops at a ${currentItinerary.overview?.travelStyle} pace.`
    };
  }
  
  // 6. BOOK TRIP
  if (intentType === "BOOK_TRIP") {
    if (!currentItinerary) {
      return {
        text: "You need a generated AI itinerary before you can request a booking. Please configure your destinations and generate your itinerary first!"
      };
    }
    return {
      text: "Your trip is ready to send as a booking request. Please review the booking snapshot details and confirm to proceed.",
      actionCard: {
        type: "MUTATION_PROPOSAL",
        title: "Review Booking Request",
        description: "Open the booking request wizard to review stay preferences, traveler names, and contact details.",
        refinementInstruction: "LAUNCH_BOOKING_WIZARD",
        actionLabel: "Review Booking"
      }
    };
  }

  // 7. BOOKING QUESTIONS
  if (intentType === "BOOKING_QUESTION") {
    const queryText = (intent.rawText || "").toLowerCase();
    
    if (queryText.includes("budget") || queryText.includes("cost") || queryText.includes("price") || queryText.includes("estimated")) {
      const budgetIntel = plannerState.budgetIntelligence;
      const budgetMin = budgetIntel?.estimatedRange?.min ? `₹${budgetIntel.estimatedRange.min.toLocaleString("en-IN")}` : "TBD";
      const budgetMax = budgetIntel?.estimatedRange?.max ? `₹${budgetIntel.estimatedRange.max.toLocaleString("en-IN")}` : "TBD";
      return {
        text: `Your estimated planning budget for this trip is ${budgetMin} – ${budgetMax}. Please note that exact pricing is not confirmed yet and is subject to availability, season, and route conditions. Our team will verify the final cost.`
      };
    }

    if (queryText.includes("permit")) {
      const requiresPermit = plannerState.destinations?.selected?.some((s) => {
        const slug = s.toLowerCase();
        return slug.includes("lachung") || slug.includes("lachen") || slug.includes("yumthang") || slug.includes("gurudongmar") || slug.includes("nathula") || slug.includes("zuluk");
      });
      return {
        text: requiresPermit 
          ? "Yes, travel permits are required for the high-altitude regions on your route (like North Sikkim or East border areas). Our team will process these permits for you once the booking request is verified. Please note that permits are subject to military/governmental approvals and are never pre-approved."
          : "Based on your current route, special travel permits are not required for general Indian tourists. However, foreign nationals may require restricted area permits (RAP) for any part of Sikkim."
      };
    }

    if (queryText.includes("final")) {
      return {
        text: "Your AI-planned itinerary is finalized locally. However, actual booking availability, stays, vehicles, and high-pass permits must be manually verified and confirmed by our operations team before the trip is officially booked."
      };
    }

    if (queryText.includes("change hotel") || queryText.includes("change accommodation")) {
      return {
        text: "You can change your accommodation preferences (style and comfort level) by going back to the Stay selector step in the trip planner. The booking request snapshot will automatically update to reflect your new preferences."
      };
    }

    if (queryText.includes("change transport")) {
      return {
        text: "You can change your transport preferences (private cab vs shared sumo) by clicking the Transport step in the trip planner. The booking wizard will automatically capture your updated choice."
      };
    }

    if (queryText.includes("edit") || queryText.includes("change")) {
      return {
        text: "Yes, you can edit your trip configuration (dates, destinations, travelers, and stays) at any time in the trip planner before sending the request. If you edit anything after opening the booking review, you will be prompted to refresh the snapshot."
      };
    }

    if (queryText.includes("submit") || queryText.includes("what happens after") || queryText.includes("happen after")) {
      return {
        text: "After you submit the booking request, our travel team will review availability, check seasonal road statuses, pre-verify your permits, and contact you via your preferred channel (WhatsApp, Email, or Phone Call) with a confirmed pricing quote and step-by-step instructions. No payment is required right now."
      };
    }

    // Default booking details
    const destString = plannerState.destinations?.selected?.map(s => s.toUpperCase()).join(" → ") || "Sikkim";
    return {
      text: `You are requesting a booking for a ${plannerState.duration}-day Sikkim trip covering ${destString} for ${plannerState.travelers?.total || 1} traveler(s). This is a booking inquiry request; stays, permits, and vehicles will be confirmed manually by our team.`
    };
  }

  // 8. PERMITS
  if (intentType === "PERMIT_INQUIRY") {
    return {
      text: t.permits,
      sourceBadge: { name: "Sikkim Tourism & Civil Authorities", confidence: "VERIFIED", url: "https://www.sikkimtourism.gov.in" },
      language: lang
    };
  }

  // 9. ALTITUDE & ACCLIMATIZATION
  if (intentType === "ALTITUDE_ADVISORY") {
    return {
      text: t.altitudeWarning,
      sourceBadge: { name: "Himalayan Health & Acclimatization Advisory", confidence: "VERIFIED" },
      language: lang
    };
  }

  // 10. FOOD & CULTURE
  if (intentType === "FOOD_CULTURE") {
    return {
      text: t.foodCulture,
      sourceBadge: { name: "Sikkim Cultural & Culinary Guide", confidence: "CURATED" },
      language: lang
    };
  }

  // 11. ITINERARY RECOMMENDATION
  if (intentType === "ITINERARY_RECOMMENDATION") {
    return {
      text: t.recommend5Day,
      sourceBadge: { name: "Sikkim Route Specialist", confidence: "CURATED" },
      language: lang
    };
  }

  // DEFAULT
  return {
    text: t.generalFallback(plannerState.duration || 5),
    sourceBadge: { name: "Sikkim Traveller Copilot", confidence: "HIGH" },
    language: lang
  };
}
