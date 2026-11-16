/**
 * backend/src/services/ai/itineraryAIService.js
 * Generates and refines Sikkim itineraries via Google Gemini SDK.
 * Fallbacks deterministically if Gemini is unavailable, rate-limited, or returns invalid schema.
 */

import { callGemini, isGeminiConfigured } from './geminiClient.js';
import { generateBackendFallbackItinerary } from './itineraryFallbackService.js';

const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /system prompt/i,
  /secret api key/i,
  /print env/i,
  /override safety/i,
  /process\.env/i
];

function sanitizePromptInput(text) {
  if (typeof text !== 'string') return '';
  let clean = text.trim().slice(0, 4000);
  for (const p of INJECTION_PATTERNS) {
    if (p.test(clean)) {
      clean = clean.replace(p, '[neutralized input]');
    }
  }
  return clean;
}

function validateItineraryOutput(itinerary, expectedDuration) {
  if (!itinerary || typeof itinerary !== 'object') return false;
  if (!Array.isArray(itinerary.days) || itinerary.days.length !== expectedDuration) return false;
  if (!itinerary.overview || typeof itinerary.overview !== 'object') return false;

  // Anti-hallucination check: ensure no false claims of pre-approved permits or bookings
  const stringified = JSON.stringify(itinerary).toLowerCase();
  if (stringified.includes('permit is approved') || stringified.includes('hotel room is booked')) {
    return false;
  }

  return true;
}

export async function generateItineraryAI({ tripContext, regenerationPreference, systemInstruction, userPrompt }) {
  const duration = Number(tripContext?.duration) || 5;

  if (!isGeminiConfigured()) {
    const fallback = generateBackendFallbackItinerary(tripContext, regenerationPreference);
    return {
      itinerary: fallback,
      source: 'fallback',
      message: 'Generated using Sikkim deterministic travel intelligence (Gemini unconfigured).'
    };
  }

  try {
    const safeSystem = sanitizePromptInput(systemInstruction || 'You are an expert Sikkim Tourism Architect.');
    const safePrompt = sanitizePromptInput(userPrompt || `Generate a ${duration}-day Sikkim trip itinerary.`);

    const rawResponse = await callGemini({
      systemInstruction: safeSystem,
      prompt: safePrompt,
      timeoutMs: 15000
    });

    // Extract JSON block if wrapped in markdown
    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (validateItineraryOutput(parsed, duration)) {
      return {
        itinerary: parsed,
        source: 'ai',
        message: 'AI-generated itinerary via secure Gemini server integration.'
      };
    } else {
      console.warn('[ItineraryAIService] Output validation failed. Falling back to deterministic engine.');
      const fallback = generateBackendFallbackItinerary(tripContext, regenerationPreference);
      return {
        itinerary: fallback,
        source: 'fallback',
        message: 'AI output did not pass route safety validation; using deterministic fallback.'
      };
    }
  } catch (err) {
    console.warn('[ItineraryAIService] Gemini call failed or timed out:', err.message);
    const fallback = generateBackendFallbackItinerary(tripContext, regenerationPreference);
    return {
      itinerary: fallback,
      source: 'fallback',
      message: `Gemini generation unavailable (${err.message}); served via deterministic fallback.`
    };
  }
}

export async function refineItineraryAI({ tripContext, existingItinerary, intent, requestInput }) {
  const duration = Number(tripContext?.duration) || existingItinerary?.overview?.duration || 5;

  if (!isGeminiConfigured()) {
    // Return modified fallback
    const fallback = generateBackendFallbackItinerary(tripContext, intent);
    return {
      itinerary: fallback,
      source: 'fallback',
      message: 'Refined using Sikkim deterministic travel intelligence.'
    };
  }

  try {
    const safeInput = sanitizePromptInput(requestInput || 'Refine itinerary pace');
    const systemPrompt = `You are an expert Sikkim Tourism Architect.
Modify the following existing Sikkim itinerary according to this refinement request: "${safeInput}".
STRICT CONSTRAINTS:
1. Maintain total duration of exactly ${duration} days.
2. Return ONLY valid JSON matching the exact itinerary schema. No conversational filler or markdown codeblocks.
3. Realistic transit times across Sikkim mountains (e.g. Gangtok to Lachung takes 6 hours).`;

    const userPromptText = `EXISTING ITINERARY:
${JSON.stringify(existingItinerary, null, 2)}

REFINEMENT INTENT:
${JSON.stringify(intent)}

USER REQUEST:
${safeInput}`;

    const rawResponse = await callGemini({
      systemInstruction: systemPrompt,
      prompt: userPromptText,
      timeoutMs: 15000
    });

    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (validateItineraryOutput(parsed, duration)) {
      return {
        itinerary: parsed,
        source: 'ai',
        message: 'Itinerary refined successfully via Gemini.'
      };
    } else {
      console.warn('[ItineraryAIService] Refinement validation failed. Using fallback.');
      const fallback = generateBackendFallbackItinerary(tripContext, intent);
      return {
        itinerary: fallback,
        source: 'fallback',
        message: 'Refinement validated with fallback engine.'
      };
    }
  } catch (err) {
    console.warn('[ItineraryAIService] Refinement error:', err.message);
    const fallback = generateBackendFallbackItinerary(tripContext, intent);
    return {
      itinerary: fallback,
      source: 'fallback',
      message: 'Refinement completed via deterministic fallback.'
    };
  }
}

