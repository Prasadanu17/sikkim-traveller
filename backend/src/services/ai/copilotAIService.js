/**
 * backend/src/services/ai/copilotAIService.js
 * Server-side AI Trip Copilot service utilizing Google Gemini.
 * Coordinates input sanitization, context integration, tool emulation,
 * action card proposals, and robust fallback responses.
 */

import { callGemini, isGeminiConfigured } from './geminiClient.js';

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

function getDeterministicCopilotFallback(cleanInput, intent, context) {
  const lower = cleanInput.toLowerCase();
  const intentType = intent?.intent || 'GENERAL_INQUIRY';
  const duration = context?.duration || 5;
  const currentCost = context?.budget?.estimatedMax || 45000;

  if (intentType === 'REDUCE_BUDGET' || lower.includes('cheaper') || lower.includes('budget') || lower.includes('cost')) {
    const savings = Math.round(currentCost * 0.2);
    return {
      text: `I analyzed your ${duration}-day Sikkim trip. Switching to shared transportation (Sumo) and boutique homestays can save approximately ₹${savings.toLocaleString('en-IN')}.`,
      actionCard: {
        id: `prop_${Date.now()}_budget`,
        type: 'MUTATION_PROPOSAL',
        category: 'BUDGET',
        title: 'Lower Your Trip Cost',
        description: 'Switching from private cab to shared transport and budget homestays will reduce your estimated budget.',
        proposedChanges: { budgetLevel: 'budget', transportMode: 'shared-sumo', accommodationType: 'homestay' },
        expectedImpact: `Reduces trip cost by ~₹${savings.toLocaleString('en-IN')}`,
        estimatedSavings: `Save ~₹${savings.toLocaleString('en-IN')}`,
        refinementInstruction: 'Make the trip cheaper by using shared transport and homestays.',
        actionLabel: 'Apply Savings Option'
      },
      sourceBadge: 'Deterministic Intelligence'
    };
  }

  if (intentType === 'MODIFY_DAY' || lower.includes('relaxed') || lower.includes('rest time') || lower.includes('slow')) {
    const dayNum = intent?.entities?.dayNumber || 2;
    return {
      text: `I can adjust Day ${dayNum} to incorporate more rest time, slower morning pacing, and dedicated relaxation.`,
      actionCard: {
        id: `prop_${Date.now()}_day`,
        type: 'MUTATION_PROPOSAL',
        category: 'DAY_PACE',
        title: `Make Day ${dayNum} More Relaxed`,
        description: `Lightens Day ${dayNum} activity density to allow restful exploration and leisure.`,
        proposedChanges: { targetDay: dayNum, pace: 'relaxed' },
        expectedImpact: 'Adds flexible rest periods and eliminates transit rush',
        estimatedSavings: null,
        refinementInstruction: `Make Day ${dayNum} more relaxed with dedicated rest time.`,
        actionLabel: `Relax Day ${dayNum}`
      },
      sourceBadge: 'Deterministic Intelligence'
    };
  }

  if (intentType === 'CHANGE_TRANSPORT' || intentType === 'REDUCE_DRIVING' || lower.includes('shared transport') || lower.includes('sumo') || lower.includes('drive')) {
    const isShared = lower.includes('shared') || lower.includes('sumo');
    return {
      text: isShared
        ? 'Switching to shared Sumo transport will reduce your mountain transit expenses.'
        : 'I can re-organize your route sequence to reduce consecutive mountain driving hours.',
      actionCard: {
        id: `prop_${Date.now()}_transport`,
        type: 'MUTATION_PROPOSAL',
        category: 'TRANSPORT',
        title: isShared ? 'Switch to Shared Sumo Transport' : 'Reduce Long Driving Hours',
        description: isShared
          ? 'Switches inter-city transfers to shared Sumo vehicles.'
          : 'Re-sequences itinerary stops to eliminate long continuous drives.',
        proposedChanges: { transportMode: isShared ? 'shared-sumo' : 'private-cab', avoidLongDrives: true },
        expectedImpact: isShared ? 'Lowers transportation costs by ~30%' : 'Caps daily driving time to 4 hours max where possible',
        estimatedSavings: isShared ? 'Save ~₹6,000' : null,
        refinementInstruction: isShared ? 'Change transport mode to shared sumo.' : 'Reduce driving time by optimizing route.',
        actionLabel: isShared ? 'Switch to Shared Sumo' : 'Apply Shorter Drives'
      },
      sourceBadge: 'Deterministic Intelligence'
    };
  }

  if (intentType === 'CHANGE_ACCOMMODATION' || lower.includes('homestay') || lower.includes('hotel') || lower.includes('resort')) {
    const stayType = intent?.entities?.accommodationType || (lower.includes('homestay') ? 'homestay' : lower.includes('resort') ? 'resort' : 'hotel');
    return {
      text: `I can update your stay preferences to ${stayType}s across all overnight locations.`,
      actionCard: {
        id: `prop_${Date.now()}_stay`,
        type: 'MUTATION_PROPOSAL',
        category: 'ACCOMMODATION',
        title: `Switch Stay Preference to ${stayType.charAt(0).toUpperCase() + stayType.slice(1)}s`,
        description: `Updates all overnight stays to authentic ${stayType}s.`,
        proposedChanges: { accommodationType: stayType },
        expectedImpact: `Overnight stays updated to ${stayType} properties`,
        estimatedSavings: stayType === 'homestay' ? 'Save ~₹4,500' : null,
        refinementInstruction: `Change accommodation preference to ${stayType}.`,
        actionLabel: `Set Stays to ${stayType.charAt(0).toUpperCase() + stayType.slice(1)}`
      },
      sourceBadge: 'Deterministic Intelligence'
    };
  }

  if (intentType === 'CHANGE_DURATION' || lower.includes('extend') || lower.includes('shorten') || lower.includes('reduce to')) {
    const targetDur = intent?.entities?.targetDuration || (intent?.entities?.durationDiff ? duration + intent.entities.durationDiff : (duration > 4 ? duration - 1 : duration + 1));
    return {
      text: `I can adjust your trip schedule from ${duration} days to ${targetDur} days.`,
      actionCard: {
        id: `prop_${Date.now()}_duration`,
        type: 'MUTATION_PROPOSAL',
        category: 'DURATION',
        title: `Adjust Trip Duration to ${targetDur} Days`,
        description: `Re-balances the daily itinerary across ${targetDur} days.`,
        proposedChanges: { duration: targetDur },
        expectedImpact: `Trip schedule resized to ${targetDur} days`,
        estimatedSavings: null,
        refinementInstruction: `Change trip duration to ${targetDur} days.`,
        actionLabel: `Update to ${targetDur} Days`
      },
      sourceBadge: 'Deterministic Intelligence'
    };
  }

  if (intentType === 'ADD_DESTINATION' || intentType === 'REMOVE_DESTINATION') {
    const isAdd = intentType === 'ADD_DESTINATION';
    const destName = intent?.entities?.destination || (lower.includes('pelling') ? 'Pelling' : 'Lachung');
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
      sourceBadge: 'Deterministic Intelligence'
    };
  }

  if (intentType === 'CURRENT_WEATHER' || lower.includes('weather') || lower.includes('rain')) {
    return {
      text: `Current weather across Sikkim mountain passes: Clear to partly cloudy in Gangtok (14°C - 20°C). North Sikkim high-altitude regions (Lachung, Yumthang) are cold (2°C - 8°C) with morning mist.`,
      sourceBadge: 'Open-Meteo Normalizer'
    };
  }

  if (lower.includes('permit')) {
    return {
      text: `Travel permits (Inner Line Permits for North Sikkim / Protected Area Permits for Tsomgo & Nathula) are required for all tourists. Our registered operations team coordinates these with military and civil authorities once you submit your trip request. Permits are never pre-approved.`,
      sourceBadge: 'Sikkim Permit Authority Guidance'
    };
  }

  if (intentType === 'PACKING_ADVICE' || lower.includes('pack') || lower.includes('clothes')) {
    return {
      text: `For a ${duration}-day Sikkim trip, pack layered woolens, windproof jackets, thermal inners, sturdy walking shoes, sunscreen, sunglasses, and passport-size photos with valid ID proofs for permit checkpoints.`,
      sourceBadge: 'Himalayan Travel Advisory'
    };
  }

  if (intentType === 'BOOK_TRIP' || lower.includes('book')) {
    return {
      text: `Your ${duration}-day itinerary is ready for booking review. Click below to review your traveler names and submit your request to our operations team.`,
      actionCard: {
        type: 'MUTATION_PROPOSAL',
        title: 'Review Booking Request',
        description: 'Open the booking review wizard to verify traveler details and contact options.',
        refinementInstruction: 'LAUNCH_BOOKING_WIZARD',
        actionLabel: 'Review Booking'
      },
      sourceBadge: 'Booking Assistant'
    };
  }

  return {
    text: `I am your Sikkim Trip Copilot. I can help you optimize your ${duration}-day itinerary, answer road/weather questions, or suggest budget savings. How would you like to refine your trip?`,
    sourceBadge: 'Sikkim Traveller Copilot'
  };
}

export async function processCopilotAI({ message, intent, context }) {
  const cleanInput = sanitizeCopilotInput(message);

  if (!isGeminiConfigured()) {
    return getDeterministicCopilotFallback(cleanInput, intent, context);
  }

  try {
    const systemPrompt = `You are "Sikkim Trip Copilot", an expert, friendly, and safety-conscious Himalayan travel assistant for Sikkim, India.
The user is planning a trip with the following active context:
${JSON.stringify(context, null, 2)}

STRICT SAFETY CONSTRAINTS:
1. NEVER claim that a hotel is booked or a room is confirmed.
2. NEVER claim that a government travel permit (ILP/PAP) is already issued or approved.
3. Travel times in Sikkim are long: Gangtok to Lachung takes 6 hours, Gangtok to Pelling takes 4 hours.
4. If the user asks to modify their trip (e.g., lower budget, more relaxed, fewer drives), propose an actionCard with type "MUTATION_PROPOSAL".
5. Return ONLY a valid JSON object matching this schema:
{
  "text": "Your helpful response string",
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
    return parsed;
  } catch (err) {
    console.warn('[CopilotAIService] Gemini call failed, using deterministic fallback:', err.message);
    return getDeterministicCopilotFallback(cleanInput, intent, context);
  }
}

