/**
 * backend/tests/multilingual.test.js
 * Automated test suite for Module E.2 & E.3: Multilingual Chatbot & Language-Aware Itinerary Generation
 * Covers:
 * 1. Language detection (English, Hindi, Nepali) from Devanagari text
 * 2. Proper noun preservation for Sikkim destinations (never mangling geographical names)
 * 3. English, Hindi, and Nepali Copilot response generation
 * 4. Language preference persistence in session memory
 * 5. Preservation of numerical travel constraints (₹15,000, 5 days) across languages
 * 6. Language-aware itinerary generation with structural JSON schema integrity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectLanguage,
  getLocalizedDestinationName,
  SIKKIM_DESTINATION_NAMES
} from '../src/services/i18n/languageService.js';
import { processCopilotAI } from '../src/services/ai/copilotAIService.js';
import { generateItineraryAI } from '../src/services/ai/itineraryAIService.js';
import {
  setPreferredLanguage,
  getPreferredLanguage,
  clearCopilotMemory
} from '../../src/services/copilot/copilotMemoryService.js';
import {
  setMockGeminiGenerator,
  clearMockGeminiGenerator
} from '../src/services/ai/geminiClient.js';

describe('Module E.2 & E.3: Multilingual Support (EN, HI, NE)', () => {
  beforeEach(() => {
    clearCopilotMemory();
    clearMockGeminiGenerator();
  });

  it('1. Accurately detects language from incoming user text', () => {
    // English
    expect(detectLanguage('Can you make Day 2 more relaxed?')).toBe('en');
    expect(detectLanguage('What is the weather in Gangtok?')).toBe('en');

    // Hindi (with Hindi markers like है, चाहिए, कम, बताइए)
    expect(detectLanguage('मेरा बजट कम कीजिए और सस्ता होटल बताइए')).toBe('hi');
    expect(detectLanguage('लाचुंग में मौसम कैसा है?')).toBe('hi');
    expect(detectLanguage('नमस्ते, क्या आप मुझे यात्रा की योजना बता सकते हैं?')).toBe('hi');

    // Nepali (with distinct Nepali markers like छ, गर्नुहोस्, हाम्रो, भ्रमण)
    expect(detectLanguage('लाचुङ र युमथाङको मौसम कस्तो छ?')).toBe('ne');
    expect(detectLanguage('बजेट घटाउनुहोस् र राम्रो होमस्टे देखाउनुहोस्')).toBe('ne');
    expect(detectLanguage('दिन २ लाई अलि शान्त र आरामदायी बनाउनुहोस्')).toBe('ne');
  });

  it('2. Preserves verified Sikkim destination names across all three languages', () => {
    // Gangtok
    expect(getLocalizedDestinationName('gangtok', 'en')).toBe('Gangtok');
    expect(getLocalizedDestinationName('gangtok', 'hi')).toBe('गंगटोक');
    expect(getLocalizedDestinationName('gangtok', 'ne')).toBe('गान्तोक');

    // Lachung
    expect(getLocalizedDestinationName('lachung', 'en')).toBe('Lachung');
    expect(getLocalizedDestinationName('lachung', 'hi')).toBe('लाचुंग');
    expect(getLocalizedDestinationName('lachung', 'ne')).toBe('लाचुङ');

    // Gurudongmar Lake
    expect(getLocalizedDestinationName('gurudongmar-lake', 'en')).toBe('Gurudongmar Lake');
    expect(getLocalizedDestinationName('gurudongmar-lake', 'hi')).toBe('गुरुडोंगमार झील');
    expect(getLocalizedDestinationName('gurudongmar-lake', 'ne')).toBe('गुरुडोङमार ताल');

    // Nathula Pass
    expect(getLocalizedDestinationName('nathula', 'hi')).toBe('नाथुला दर्रा');
    expect(getLocalizedDestinationName('nathula', 'ne')).toBe('नाथुला भञ्ज्याङ');
  });

  it('3. Generates authentic Hindi Copilot response and preserves numerical constraints', async () => {
    const res = await processCopilotAI({
      message: 'मेरा बजट कम कीजिए और सस्ता विकल्प दीजिए',
      intent: { intent: 'REDUCE_BUDGET', isMutating: true },
      context: { duration: 5, budget: { estimatedMax: 45000 }, language: 'hi' }
    });

    expect(res.language).toBe('hi');
    expect(res.text).toContain('सिक्किम यात्रा');
    expect(res.text).toContain('₹9,000'); // 20% savings of 45,000 accurately calculated and preserved
    expect(res.actionCard).toBeDefined();
    expect(res.actionCard.title).toBe('यात्रा का बजट कम करें');
    expect(res.actionCard.actionLabel).toBe('बचत विकल्प लागू करें');
  });

  it('4. Generates authentic Nepali Copilot response and preserves numerical constraints', async () => {
    const res = await processCopilotAI({
      message: 'दिन ३ लाई आरामदायी बनाउनुहोस्',
      intent: { intent: 'MODIFY_DAY', isMutating: true, entities: { dayNumber: 3 } },
      context: { duration: 5, language: 'ne' }
    });

    expect(res.language).toBe('ne');
    expect(res.text).toContain('दिन 3 लाई थप आरामदायी बनाउन सक्छु');
    expect(res.actionCard).toBeDefined();
    expect(res.actionCard.category).toBe('DAY_PACE');
    expect(res.actionCard.title).toContain('दिन 3');
    expect(res.actionCard.actionLabel).toContain('दिन 3');
  });

  it('5. Persists language preference in Module B session memory across calls', () => {
    expect(getPreferredLanguage()).toBe('en');

    setPreferredLanguage('hi');
    expect(getPreferredLanguage()).toBe('hi');

    setPreferredLanguage('ne');
    expect(getPreferredLanguage()).toBe('ne');

    // Invalid language codes are safely rejected
    setPreferredLanguage('french');
    expect(getPreferredLanguage()).toBe('ne');
  });

  it('6. Supports mixed-language user input without crashing or losing travel constraints', async () => {
    // Mixed English + Hindi text
    const mixedInput = 'Please reduce budget to ₹15,000 और cheaper transport select karo';
    const lang = detectLanguage(mixedInput);
    // Contains Devanagari characters -> detected as Hindi
    expect(lang).toBe('hi');

    const res = await processCopilotAI({
      message: mixedInput,
      intent: { intent: 'REDUCE_BUDGET', isMutating: true, entities: { budgetAmount: 15000 } },
      context: { duration: 5, budget: { estimatedMax: 40000 }, language: lang }
    });

    expect(res.text).toBeDefined();
    expect(res.actionCard).toBeDefined();
    expect(res.actionCard.category).toBe('BUDGET');
  });

  it('7. Generates language-aware itinerary while strictly preserving structural JSON keys', async () => {
    const res = await generateItineraryAI({
      tripContext: {
        duration: 4,
        destinations: ['gangtok', 'lachung'],
        language: 'hi'
      }
    });

    expect(res.itinerary).toBeDefined();
    expect(res.itinerary.days.length).toBe(4);

    // Structural keys must remain in English/canonical format
    expect(res.itinerary.days[0].dayNumber).toBe(1);
    expect(res.itinerary.days[0].baseLocation).toBe('Gangtok');
    expect(res.itinerary.days[1].baseLocation).toBe('Lachung');

    // Narrative titles are localized in Hindi
    expect(res.itinerary.days[0].title).toContain('गंगटोक आगमन');
    expect(res.itinerary.days[1].title).toContain('लाचुंग');
  });
});
