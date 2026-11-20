/**
 * backend/tests/aiRoutes.test.js
 * Automated test suite for Module A (Backend AI Integration).
 * Uses mocked Gemini responses so tests run deterministically without external API keys.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setMockGeminiGenerator,
  clearMockGeminiGenerator,
  isGeminiConfigured
} from '../src/services/ai/geminiClient.js';
import {
  generateItineraryAI,
  refineItineraryAI
} from '../src/services/ai/itineraryAIService.js';
import {
  processCopilotAI
} from '../src/services/ai/copilotAIService.js';
import {
  handleGenerateItinerary,
  handleRefineItinerary,
  handleCopilot
} from '../src/controllers/aiController.js';

describe('Module A: Backend AI Integration Suite', () => {
  afterEach(() => {
    clearMockGeminiGenerator();
  });

  const sampleTripContext = {
    duration: 5,
    destinations: ['gangtok', 'lachung', 'pelling'],
    travelers: { total: 2, type: 'couple', adults: 2, children: 0, seniors: 0 },
    travelStyle: 'balanced',
    budget: { level: 'comfortable', estimatedMin: 32000, estimatedMax: 48000 }
  };

  const sampleValidAiItinerary = {
    tripTitle: '5-Day Gemini Curated Sikkim Escape',
    summary: 'A breathtaking 5-day route across Gangtok and North Sikkim.',
    overview: {
      duration: 5,
      travelers: 2,
      travelerType: 'couple',
      travelStyle: 'balanced',
      route: ['Gangtok', 'Lachung', 'Pelling'],
      estimatedCost: { min: 32000, max: 48000, currency: 'INR' }
    },
    whyThisTripWorks: ['Realistic acclimatization schedule'],
    days: [
      { dayNumber: 1, baseLocation: 'Gangtok', title: 'Day 1: Arrival', morning: [], afternoon: [], evening: [], travel: [] },
      { dayNumber: 2, baseLocation: 'Gangtok', title: 'Day 2: Gangtok Views', morning: [], afternoon: [], evening: [], travel: [] },
      { dayNumber: 3, baseLocation: 'Lachung', title: 'Day 3: Transfer North', morning: [], afternoon: [], evening: [], travel: [] },
      { dayNumber: 4, baseLocation: 'Lachung', title: 'Day 4: Yumthang Valley', morning: [], afternoon: [], evening: [], travel: [] },
      { dayNumber: 5, baseLocation: 'Gangtok', title: 'Day 5: Departure', morning: [], afternoon: [], evening: [], travel: [] }
    ],
    budget: {
      total: { min: 32000, max: 48000 }
    },
    importantNotes: ['Permits required'],
    warnings: []
  };

  describe('1. Itinerary Generation Endpoint Logic', () => {
    it('generates fallback itinerary when Gemini is not configured', async () => {
      clearMockGeminiGenerator();
      const result = await generateItineraryAI({
        tripContext: sampleTripContext,
        systemInstruction: 'Test',
        userPrompt: 'Generate 5 days'
      });

      expect(result.source).toBe('fallback');
      expect(result.itinerary).toBeDefined();
      expect(result.itinerary.days.length).toBe(5);
      expect(result.itinerary.overview.duration).toBe(5);
    });

    it('returns AI itinerary when Gemini responds with valid structured JSON', async () => {
      setMockGeminiGenerator(async () => {
        return JSON.stringify(sampleValidAiItinerary);
      });

      const result = await generateItineraryAI({
        tripContext: sampleTripContext,
        systemInstruction: 'System instruction',
        userPrompt: 'Generate 5-day itinerary'
      });

      expect(result.source).toBe('ai');
      expect(result.itinerary.tripTitle).toBe('5-Day Gemini Curated Sikkim Escape');
      expect(result.itinerary.days.length).toBe(5);
    });

    it('falls back gracefully if Gemini returns malformed or non-JSON output', async () => {
      setMockGeminiGenerator(async () => {
        return 'I am an AI and here is your trip: Day 1: Go to Sikkim...';
      });

      const result = await generateItineraryAI({
        tripContext: sampleTripContext,
        userPrompt: 'Generate itinerary'
      });

      expect(result.source).toBe('fallback');
      expect(result.itinerary.days.length).toBe(5);
    });

    it('falls back if Gemini hallucinates fake booking approvals', async () => {
      const hallucinatedItinerary = {
        ...sampleValidAiItinerary,
        summary: 'Your permit is approved and your hotel room is booked!'
      };

      setMockGeminiGenerator(async () => {
        return JSON.stringify(hallucinatedItinerary);
      });

      const result = await generateItineraryAI({
        tripContext: sampleTripContext,
        userPrompt: 'Generate'
      });

      expect(result.source).toBe('fallback');
    });
  });

  describe('2. Itinerary Refinement Endpoint Logic', () => {
    it('refines itinerary via Gemini when configured', async () => {
      const refinedMock = {
        ...sampleValidAiItinerary,
        tripTitle: '5-Day Relaxed Sikkim Escape'
      };

      setMockGeminiGenerator(async () => {
        return JSON.stringify(refinedMock);
      });

      const result = await refineItineraryAI({
        tripContext: sampleTripContext,
        existingItinerary: sampleValidAiItinerary,
        intent: { intent: 'change_day_pace' },
        requestInput: 'Make Day 2 more relaxed'
      });

      expect(result.source).toBe('ai');
      expect(result.itinerary.tripTitle).toBe('5-Day Relaxed Sikkim Escape');
    });

    it('falls back deterministically on refinement failure', async () => {
      setMockGeminiGenerator(async () => {
        throw new Error('Quota exceeded');
      });

      const result = await refineItineraryAI({
        tripContext: sampleTripContext,
        existingItinerary: sampleValidAiItinerary,
        intent: { intent: 'change_day_pace' },
        requestInput: 'Make Day 2 more relaxed'
      });

      expect(result.source).toBe('fallback');
      expect(result.itinerary.days.length).toBe(5);
    });

    it('accepts object-format requestInput in refinement controller (Copilot mutation payload)', async () => {
      let statusCode = null;
      let jsonResponse = null;
      const mockReq = {
        body: {
          tripContext: sampleTripContext,
          existingItinerary: sampleValidAiItinerary,
          intent: { intent: 'REDUCE_BUDGET' },
          requestInput: {
            instruction: 'Reduce budget and switch to budget stays',
            changes: { budgetLevel: 'budget', targetMax: 25000 }
          }
        }
      };
      const mockRes = {
        status: (s) => { statusCode = s; return mockRes; },
        json: (data) => { jsonResponse = data; }
      };

      await handleRefineItinerary(mockReq, mockRes, vi.fn());

      expect(statusCode).toBe(200);
      expect(jsonResponse.itinerary).toBeDefined();
      expect(jsonResponse.source).toBeDefined();
      expect(jsonResponse.itinerary.days.length).toBe(5);
    });

    it('accepts string-format requestInput in refinement controller', async () => {
      let statusCode = null;
      let jsonResponse = null;
      const mockReq = {
        body: {
          tripContext: sampleTripContext,
          existingItinerary: sampleValidAiItinerary,
          intent: { intent: 'change_day_pace' },
          requestInput: 'Make Day 3 more relaxed with fewer visits'
        }
      };
      const mockRes = {
        status: (s) => { statusCode = s; return mockRes; },
        json: (data) => { jsonResponse = data; }
      };

      await handleRefineItinerary(mockReq, mockRes, vi.fn());

      expect(statusCode).toBe(200);
      expect(jsonResponse.itinerary).toBeDefined();
      expect(jsonResponse.source).toBeDefined();
    });
  });

  describe('3. Copilot AI Endpoint Logic', () => {
    it('serves deterministic fallback answers for domain queries without Gemini', async () => {
      clearMockGeminiGenerator();

      const weatherRes = await processCopilotAI({
        message: 'What is the weather like in Sikkim?',
        intent: { intent: 'CURRENT_WEATHER' },
        context: sampleTripContext
      });
      expect(weatherRes.text).toContain('weather across Sikkim');
      expect(weatherRes.sourceBadge).toBeDefined();
      const badgeName = typeof weatherRes.sourceBadge === 'object' ? weatherRes.sourceBadge.name : weatherRes.sourceBadge;
      expect(badgeName).toContain('Open-Meteo');

      const budgetRes = await processCopilotAI({
        message: 'How can I make my trip cheaper?',
        intent: { intent: 'REDUCE_BUDGET' },
        context: sampleTripContext
      });
      expect(budgetRes.actionCard).toBeDefined();
      expect(budgetRes.actionCard.type).toBe('MUTATION_PROPOSAL');
      expect(budgetRes.actionCard.estimatedSavings).toContain('Save ~₹');

      const permitRes = await processCopilotAI({
        message: 'Do I need permits for North Sikkim?',
        intent: { intent: 'BOOKING_QUESTION' },
        context: sampleTripContext
      });
      expect(permitRes.text).toContain('Inner Line Permits');
    });

    it('serves Gemini response when available and sanitizes hallucinated approvals', async () => {
      setMockGeminiGenerator(async () => {
        return JSON.stringify({
          text: 'Great news, your permit is approved for Zero Point!',
          actionCard: null,
          dataCard: { title: 'Lachung Info', details: ['High altitude'] }
        });
      });

      const res = await processCopilotAI({
        message: 'Can I visit Zero Point?',
        intent: { intent: 'GENERAL_INQUIRY' },
        context: sampleTripContext
      });

      expect(res.text).not.toContain('permit is approved');
      expect(res.text).toContain('subject to operational verification');
      expect(res.sourceBadge).toBe('AI (Gemini)');
    });
  });

  describe('4. Express Controller & Zod Validation', () => {
    it('rejects invalid generate-itinerary request with 400', async () => {
      let responseStatus = null;
      let responseData = null;

      const mockReq = { body: {} };
      const mockRes = {
        status(code) {
          responseStatus = code;
          return {
            json(data) {
              responseData = data;
            }
          };
        }
      };

      await handleGenerateItinerary(mockReq, mockRes, () => {});
      expect(responseStatus).toBe(400);
      expect(responseData.error.code).toBe('INVALID_INPUT');
    });

    it('rejects empty copilot message with 400', async () => {
      let responseStatus = null;
      let responseData = null;

      const mockReq = { body: { message: '' } };
      const mockRes = {
        status(code) {
          responseStatus = code;
          return {
            json(data) {
              responseData = data;
            }
          };
        }
      };

      await handleCopilot(mockReq, mockRes, () => {});
      expect(responseStatus).toBe(400);
      expect(responseData.error.code).toBe('INVALID_INPUT');
    });

    it('accepts valid copilot request and returns 200', async () => {
      let responseStatus = null;
      let responseData = null;

      const mockReq = {
        body: {
          message: 'What clothes should I pack?',
          intent: { intent: 'PACKING_ADVICE' },
          context: sampleTripContext
        }
      };
      const mockRes = {
        status(code) {
          responseStatus = code;
          return {
            json(data) {
              responseData = data;
            }
          };
        }
      };

      await handleCopilot(mockReq, mockRes, () => {});
      expect(responseStatus).toBe(200);
      expect(responseData.text).toContain('pack');
    });
  });
});

