/**
 * backend/src/services/ai/copilotAIService.js
 * Server-side AI Trip Copilot service utilizing Google Gemini.
 * Coordinates input sanitization, context integration, tool emulation,
 * action card proposals, and robust fallback responses.
 */

import { callGemini, streamGemini, isGeminiConfigured } from './geminiClient.js';
import { detectLanguage, getLocalizedDestinationName } from '../i18n/languageService.js';
import { getMultilingualTemplates } from '../i18n/multilingualTemplates.js';

const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /system prompt/i,
  /secret api key/i,
  /print env/i,
  /override safety/i,
  /process\.env/i,
  /vite_/i
];

function sanitizeCopilotInput(text) {
  if (typeof text !== 'string') return '';
  let clean = text.trim().slice(0, 1000);
  for (const p of INJECTION_PATTERNS) {
    if (p.test(clean)) {
      clean = clean.replace(p, '[neutralized]');
    }
  }
  return clean;
}

function getDeterministicCopilotFallback(cleanInput, intent, context, preferredLanguage = null) {
  const lang = preferredLanguage || context?.language || detectLanguage(cleanInput) || 'en';
  const t = getMultilingualTemplates(lang);

  const lower = cleanInput.toLowerCase();
  const intentType = intent?.intent || 'GENERAL_INQUIRY';
  const duration = context?.duration || 5;
  const currentCost = context?.budget?.estimatedMax || 45000;

  // 1b. ACCOMMODATION SPECIFIC LOOKUP
  const isStayInquiry = lower.includes("where are we staying") ||
    lower.includes("where will we stay") ||
    lower.includes("where do we stay") ||
    lower.includes("where am i staying") ||
    lower.includes("what is our hotel") ||
    lower.includes("which hotel") ||
    lower.includes("what hotel") ||
    lower.includes("which homestay") ||
    lower.includes("stay tonight") ||
    lower.includes("कहाँ रुकेंगे") ||
    lower.includes("कहाँ बस्ने") ||
    intentType === "ACCOMMODATION_LOOKUP";

  if (isStayInquiry) {
    const days = context?.itinerary?.days || [];
    const hasItinerary = days.length > 0;
    const requestedDay = intent?.entities?.dayNumber || 1;

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

  if (intentType === 'REDUCE_BUDGET' || lower.includes('cheaper') || lower.includes('budget') || lower.includes('cost') || lower.includes('कम') || lower.includes('सस्ता') || lower.includes('घटाउनु')) {
    const savings = Math.round(currentCost * 0.2);
    return {
      text: t.budgetReduced(duration, savings),
      actionCard: {
        id: `prop_${Date.now()}_budget`,
        type: 'MUTATION_PROPOSAL',
        category: 'BUDGET',
        title: t.budgetCardTitle,
        description: t.budgetCardDesc,
        proposedChanges: { budgetLevel: 'budget', transportMode: 'shared-sumo', accommodationType: 'homestay' },
        expectedImpact: `Reduces trip cost by ~₹${savings.toLocaleString('en-IN')}`,
        estimatedSavings: `Save ~₹${savings.toLocaleString('en-IN')}`,
        refinementInstruction: 'Make the trip cheaper by using shared transport and homestays.',
        actionLabel: t.budgetActionLabel
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'ESTIMATED', engine: 'Budget Model' },
      language: lang
    };
  }

  if (intentType === 'MODIFY_DAY' || lower.includes('relaxed') || lower.includes('rest time') || lower.includes('slow') || lower.includes('आराम') || lower.includes('शान्त')) {
    const dayNum = intent?.entities?.dayNumber || 2;
    return {
      text: t.dayRelaxed(dayNum),
      actionCard: {
        id: `prop_${Date.now()}_day`,
        type: 'MUTATION_PROPOSAL',
        category: 'DAY_PACE',
        title: t.dayCardTitle(dayNum),
        description: t.dayCardDesc(dayNum),
        proposedChanges: { targetDay: dayNum, pace: 'relaxed' },
        expectedImpact: 'Adds flexible rest periods and eliminates transit rush',
        estimatedSavings: null,
        refinementInstruction: `Make Day ${dayNum} more relaxed with dedicated rest time.`,
        actionLabel: t.dayActionLabel(dayNum)
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'CURATED', engine: 'Pacing Rule Engine' },
      language: lang
    };
  }

  if (intentType === 'CHANGE_TRANSPORT' || intentType === 'REDUCE_DRIVING' || lower.includes('shared transport') || lower.includes('sumo') || lower.includes('drive') || lower.includes('गाड़ी') || lower.includes('सवारी')) {
    const isShared = lower.includes('shared') || lower.includes('sumo') || lower.includes('साझा');
    return {
      text: isShared ? t.transportShared : 'I can re-organize your route sequence to reduce consecutive mountain driving hours.',
      actionCard: {
        id: `prop_${Date.now()}_transport`,
        type: 'MUTATION_PROPOSAL',
        category: 'TRANSPORT',
        title: isShared ? t.transportCardTitle : 'Reduce Long Driving Hours',
        description: isShared
          ? 'Switches inter-city transfers to shared Sumo vehicles.'
          : 'Re-sequences itinerary stops to eliminate long continuous drives.',
        proposedChanges: { transportMode: isShared ? 'shared-sumo' : 'private-cab', avoidLongDrives: true },
        expectedImpact: isShared ? 'Lowers transportation costs by ~30%' : 'Caps daily driving time to 4 hours max where possible',
        estimatedSavings: isShared ? 'Save ~₹6,000' : null,
        refinementInstruction: isShared ? 'Change transport mode to shared sumo.' : 'Reduce driving time by optimizing route.',
        actionLabel: isShared ? t.transportActionLabel : 'Apply Shorter Drives'
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'CURATED', engine: 'Transit Engine' },
      language: lang
    };
  }

  if (intentType === 'CHANGE_ACCOMMODATION' || lower.includes('homestay') || lower.includes('hotel') || lower.includes('resort') || lower.includes('होमस्टे')) {
    const stayType = intent?.entities?.accommodationType || (lower.includes('homestay') || lower.includes('होमस्टे') ? 'homestay' : lower.includes('resort') ? 'resort' : 'hotel');
    return {
      text: stayType === 'homestay' ? t.stayHomestay : `I can update your stay preferences to ${stayType}s across all overnight locations.`,
      actionCard: {
        id: `prop_${Date.now()}_stay`,
        type: 'MUTATION_PROPOSAL',
        category: 'ACCOMMODATION',
        title: stayType === 'homestay' ? t.stayCardTitle : `Switch Stay Preference to ${stayType}s`,
        description: `Updates all overnight stays to authentic ${stayType}s.`,
        proposedChanges: { accommodationType: stayType },
        expectedImpact: `Overnight stays updated to ${stayType} properties`,
        estimatedSavings: stayType === 'homestay' ? 'Save ~₹4,500' : null,
        refinementInstruction: `Change accommodation preference to ${stayType}.`,
        actionLabel: stayType === 'homestay' ? t.stayActionLabel : `Set Stays to ${stayType}`
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'CURATED', engine: 'Stay Catalog' },
      language: lang
    };
  }

  if (intentType === 'CHANGE_DURATION' || lower.includes('extend') || lower.includes('shorten') || lower.includes('reduce to') || lower.includes('दिन')) {
    const targetDur = intent?.entities?.targetDuration || (intent?.entities?.durationDiff ? duration + intent.entities.durationDiff : (duration > 4 ? duration - 1 : duration + 1));
    return {
      text: t.durationChange(duration, targetDur),
      actionCard: {
        id: `prop_${Date.now()}_duration`,
        type: 'MUTATION_PROPOSAL',
        category: 'DURATION',
        title: t.durationCardTitle(targetDur),
        description: `Re-balances the daily itinerary across ${targetDur} days.`,
        proposedChanges: { duration: targetDur },
        expectedImpact: `Trip schedule resized to ${targetDur} days`,
        estimatedSavings: null,
        refinementInstruction: `Change trip duration to ${targetDur} days.`,
        actionLabel: t.durationActionLabel(targetDur)
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'CURATED', engine: 'Duration Engine' },
      language: lang
    };
  }

  if (intentType === 'REMOVE_ACTIVITY' || lower.includes('remove activity') || lower.includes('delete activity') || lower.includes('गतिविधि हटाएं') || lower.includes('क्रियाकलाप हटाउनुहोस्')) {
    const dayNum = intent?.entities?.dayNumber || 2;
    return {
      text: t.removeActivity(dayNum),
      actionCard: {
        id: `prop_${Date.now()}_remove_activity`,
        type: 'MUTATION_PROPOSAL',
        category: 'ACTIVITY_REMOVAL',
        title: t.removeActivityCardTitle(dayNum),
        description: t.removeActivityCardDesc(dayNum),
        proposedChanges: { targetDay: dayNum, removeActivity: true },
        expectedImpact: `Lightens Day ${dayNum} schedule for relaxed exploration`,
        estimatedSavings: null,
        refinementInstruction: `Remove one non-essential activity from Day ${dayNum}.`,
        actionLabel: t.removeActivityActionLabel(dayNum)
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'CURATED', engine: 'Schedule Engine' },
      language: lang
    };
  }

  if (intentType === 'REPLACE_DESTINATION') {
    const oldD = intent?.entities?.oldDestination || 'Pelling';
    const newD = intent?.entities?.newDestination || 'Ravangla';
    return {
      text: t.replaceDest(oldD, newD),
      actionCard: {
        id: `prop_${Date.now()}_replace_dest`,
        type: 'MUTATION_PROPOSAL',
        category: 'DESTINATION_REPLACE',
        title: t.replaceDestCardTitle(oldD, newD),
        description: t.replaceDestCardDesc(oldD, newD),
        proposedChanges: { replaceDestination: { oldDestination: oldD.toLowerCase(), newDestination: newD.toLowerCase() } },
        expectedImpact: `Replaces ${oldD} with ${newD} and recalculates scenic mountain transit`,
        estimatedSavings: null,
        refinementInstruction: `Replace ${oldD} with ${newD} in the itinerary.`,
        actionLabel: t.replaceDestActionLabel(oldD, newD)
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'CURATED', engine: 'Route Circuit Engine' },
      language: lang
    };
  }

  if (intentType === 'ADD_DESTINATION' || intentType === 'REMOVE_DESTINATION') {
    const isAdd = intentType === 'ADD_DESTINATION';
    const destName = intent?.entities?.destination || (lower.includes('pelling') || lower.includes('पेलिंग') ? 'Pelling' : 'Lachung');
    
    // North Sikkim feasibility check on duration
    const isNorth = destName.toLowerCase().includes('lachung') || destName.toLowerCase().includes('lachen') || destName.toLowerCase().includes('yumthang');
    if (isAdd && isNorth && duration < 4) {
      return {
        text: t.northSikkimDurationNotice(duration),
        actionCard: {
          id: `prop_${Date.now()}_duration_north`,
          type: 'MUTATION_PROPOSAL',
          category: 'DURATION',
          title: t.durationCardTitle(5),
          description: `Extending to 5 days allows a safe North Sikkim circuit without rushed high-altitude driving.`,
          proposedChanges: { duration: 5, addDestination: destName.toLowerCase() },
          expectedImpact: `Expands trip to 5 days and incorporates ${destName} with proper acclimatization`,
          estimatedSavings: null,
          refinementInstruction: `Extend trip to 5 days and add ${destName}.`,
          actionLabel: t.durationActionLabel(5)
        },
        sourceBadge: { name: 'Deterministic Intelligence', confidence: 'VERIFIED', engine: 'Altitude Safety Rule Base' },
        language: lang
      };
    }

    return {
      text: isAdd
        ? `I can add ${destName} into your route circuit.`
        : `I can remove ${destName} from your route and redistribute your days.`,
      actionCard: {
        id: `prop_${Date.now()}_dest`,
        type: 'MUTATION_PROPOSAL',
        category: 'DESTINATION',
        title: isAdd ? `Add ${destName} to Route` : `Remove ${destName} from Route`,
        description: isAdd
          ? `Integrates ${destName} into your itinerary circuit.`
          : `Removes ${destName} and redistributes available days.`,
        proposedChanges: isAdd ? { addDestination: destName.toLowerCase() } : { removeDestination: destName.toLowerCase() },
        expectedImpact: isAdd ? `Added ${destName} to circuit` : `Removed ${destName} from circuit`,
        estimatedSavings: null,
        refinementInstruction: isAdd ? `Add ${destName} to the itinerary.` : `Remove ${destName} from the itinerary.`,
        actionLabel: isAdd ? `Add ${destName}` : `Remove ${destName}`
      },
      sourceBadge: { name: 'Deterministic Intelligence', confidence: 'CURATED', engine: 'Route Circuit Engine' },
      language: lang
    };
  }

  if (intentType === 'PERMIT_INQUIRY' || lower.includes('permit') || lower.includes('परमिट') || lower.includes('अनुमति') || lower.includes('ilp') || lower.includes('pap')) {
    return {
      text: t.permits,
      sourceBadge: { name: 'Sikkim Tourism & Civil Authorities', confidence: 'VERIFIED', url: 'https://www.sikkimtourism.gov.in' },
      language: lang
    };
  }


  if (intentType === 'PACKING_ADVICE' || lower.includes('pack') || lower.includes('clothes') || lower.includes('कपड़े')) {
    return {
      text: `For a ${duration}-day Sikkim trip, pack layered woolens, windproof jackets, thermal inners, sturdy walking shoes, sunscreen, sunglasses, and passport-size photos with valid ID proofs for permit checkpoints.`,
      sourceBadge: { name: 'Himalayan Travel Advisory', confidence: 'CURATED' },
      language: lang
    };
  }

  if (intentType === 'ALTITUDE_ADVISORY' || lower.includes('ams') || lower.includes('oxygen') || lower.includes('ऊंचाई') || lower.includes('लेक लाग्ने') || (lower.includes('altitude') && !lower.includes('pack'))) {
    return {
      text: t.altitudeWarning,
      sourceBadge: { name: 'Himalayan Health & Acclimatization Advisory', confidence: 'VERIFIED' },
      language: lang
    };
  }

  if (intentType === 'FOOD_CULTURE' || lower.includes('food') || lower.includes('momo') || lower.includes('thukpa') || lower.includes('खाना') || lower.includes('भोजन') || lower.includes('monaster') || lower.includes('गुम्बा')) {
    return {
      text: t.foodCulture,
      sourceBadge: { name: 'Sikkim Cultural & Culinary Guide', confidence: 'CURATED' },
      language: lang
    };
  }

  if (intentType === 'ITINERARY_RECOMMENDATION' || lower.includes('recommend') || lower.includes('suggest a trip') || lower.includes('5 day') || lower.includes('५ दिने')) {
    return {
      text: t.recommend5Day,
      sourceBadge: { name: 'Sikkim Route Specialist', confidence: 'CURATED' },
      language: lang
    };
  }

  if (intentType === 'CURRENT_WEATHER' || lower.includes('weather') || lower.includes('rain') || lower.includes('मौसम')) {
    return {
      text: t.weather,
      sourceBadge: { name: 'Open-Meteo Weather Proxy', confidence: 'VERIFIED', url: 'https://open-meteo.com' },
      language: lang
    };
  }



  if (intentType === 'EXPLAIN_ITINERARY' || lower.includes('explain my trip') || lower.includes('explain itinerary') || lower.includes('explain my itinerary')) {
    const routeStr = (context?.itinerary?.route && context.itinerary.route.length > 0) ? context.itinerary.route.join(' → ') : 'Gangtok and scenic mountain passes';
    return {
      text: `Your ${duration}-day Sikkim itinerary covers ${routeStr}. It balances high-altitude mountain vistas with cultural stops at a comfortable pace.`,
      sourceBadge: { name: 'Sikkim Traveller Copilot', confidence: 'HIGH' },
      language: lang
    };
  }

  return {
    text: t.generalFallback(duration),
    sourceBadge: { name: 'Sikkim Traveller Copilot', confidence: 'HIGH' },
    language: lang
  };
}

export async function processCopilotAI({ message, intent, context }) {
  const cleanInput = sanitizeCopilotInput(message);
  const targetLang = context?.language || detectLanguage(cleanInput) || 'en';

  if (!isGeminiConfigured()) {
    return getDeterministicCopilotFallback(cleanInput, intent, context, targetLang);
  }

  try {
    const langDesc = targetLang === 'hi' ? 'Hindi (हिन्दी)' : targetLang === 'ne' ? 'Nepali (नेपाली)' : 'English';
    const systemPrompt = `You are "Sikkim Trip Copilot", an expert, friendly, and safety-conscious Himalayan travel assistant for Sikkim, India.
The user is planning a trip with the following active context:
${JSON.stringify(context, null, 2)}

Target language for response: ${langDesc}.
Accurately preserve Sikkim destination names (Gangtok, Lachung, Pelling, Yumthang Valley, Gurudongmar Lake, Nathula Pass) and numeric travel constraints (e.g. ₹15,000, 4 days).

STRICT SAFETY CONSTRAINTS:
1. NEVER claim that a hotel is booked or a room is confirmed.
2. NEVER claim that a government travel permit (ILP/PAP) is already issued or approved.
3. Travel times in Sikkim are long: Gangtok to Lachung takes 6 hours, Gangtok to Pelling takes 4 hours.
4. If the user asks to modify their trip (e.g., lower budget, more relaxed, fewer drives), propose an actionCard with type "MUTATION_PROPOSAL".
5. Return ONLY a valid JSON object matching this schema:
{
  "text": "Your helpful response string in ${langDesc}",
  "actionCard": null or { "type": "MUTATION_PROPOSAL", "title": "...", "description": "...", "estimatedSavings": "...", "refinementInstruction": "...", "actionLabel": "..." },
  "dataCard": null or { "title": "...", "details": ["..."] },
  "sourceBadge": "AI (Gemini)"
}`;

    const rawResponse = await callGemini({
      systemInstruction: systemPrompt,
      prompt: `User message: "${cleanInput}"\nDetected intent: ${JSON.stringify(intent)}`,
      timeoutMs: 12000
    });

    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Validate anti-hallucination
    const textLower = (parsed.text || '').toLowerCase();
    if (textLower.includes('permit is approved') || textLower.includes('room is booked')) {
      parsed.text = 'I analyzed your request. Please note that high-pass permits and stays are subject to operational verification after booking.';
    }

    parsed.sourceBadge = 'AI (Gemini)';
    parsed.language = targetLang;
    return parsed;
  } catch (err) {
    console.warn('[CopilotAIService] Gemini call failed, using deterministic fallback:', err.message);
    return getDeterministicCopilotFallback(cleanInput, intent, context, targetLang);
  }
}

/**
 * Progressive streaming Copilot response generator (SSE-compatible).
 */
export async function streamCopilotAI({ message, intent, context, language, onChunk, onActionCard, onDone, onError, signal }) {
  const cleanInput = sanitizeCopilotInput(message);
  const targetLang = language || context?.language || detectLanguage(cleanInput) || 'en';

  if (!isGeminiConfigured()) {
    const fallback = getDeterministicCopilotFallback(cleanInput, intent, context, targetLang);
    const words = fallback.text.split(/(\s+)/);
    for (const w of words) {
      if (signal?.aborted) return;
      if (onChunk) onChunk(w);
      await new Promise((r) => setTimeout(r, 15));
    }
    if (fallback.actionCard && onActionCard) {
      onActionCard(fallback.actionCard);
    }
    if (onDone) {
      onDone({ sourceBadge: fallback.sourceBadge, actionCard: fallback.actionCard, language: targetLang });
    }
    return;
  }

  try {
    const langDesc = targetLang === 'hi' ? 'Hindi (हिन्दी)' : targetLang === 'ne' ? 'Nepali (नेपाली)' : 'English';
    const systemPrompt = `You are "Sikkim Trip Copilot", an expert, friendly, and safety-conscious Himalayan travel assistant for Sikkim, India.
Target language for response: ${langDesc}.
Accurately preserve Sikkim destination names (Gangtok, Lachung, Pelling, Yumthang, Gurudongmar, Nathula) and numerical travel values.
STRICT SAFETY RULES:
1. NEVER claim a room/hotel is booked.
2. NEVER claim a permit is approved.
3. Travel times in Sikkim are long (Gangtok to Lachung takes 6 hours).
Respond in natural, engaging prose in ${langDesc}. Do not output JSON wrappers.`;

    let actionCard = null;
    const fullText = await streamGemini({
      systemInstruction: systemPrompt,
      prompt: `User message: "${cleanInput}"\nDetected intent: ${JSON.stringify(intent)}`,
      onChunk: (chunk) => {
        if (!signal?.aborted && onChunk) {
          onChunk(chunk);
        }
      },
      timeoutMs: 15000
    });

    // Check if user request warrants an actionCard proposal
    const fallback = getDeterministicCopilotFallback(cleanInput, intent, context, targetLang);
    if (fallback.actionCard && onActionCard) {
      actionCard = fallback.actionCard;
      onActionCard(actionCard);
    }

    if (onDone) {
      onDone({ sourceBadge: 'AI (Gemini)', actionCard, language: targetLang, text: fullText });
    }
  } catch (err) {
    if (signal?.aborted) return;
    console.warn('[CopilotAIService] Streaming Gemini failed, falling back to deterministic stream:', err.message);
    const fallback = getDeterministicCopilotFallback(cleanInput, intent, context, targetLang);
    const words = fallback.text.split(/(\s+)/);
    for (const w of words) {
      if (signal?.aborted) return;
      if (onChunk) onChunk(w);
      await new Promise((r) => setTimeout(r, 15));
    }
    if (fallback.actionCard && onActionCard) {
      onActionCard(fallback.actionCard);
    }
    if (onDone) {
      onDone({ sourceBadge: fallback.sourceBadge, actionCard: fallback.actionCard, language: targetLang });
    }
  }
}


