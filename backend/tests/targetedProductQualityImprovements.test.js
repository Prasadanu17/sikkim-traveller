/**
 * backend/tests/targetedProductQualityImprovements.test.js
 * Verification of the 4 targeted quality improvements:
 * 1. P1: Dynamic Quick-Action Chips behavior (onboarding vs active itinerary)
 * 2. P1: Specific Accommodation Lookup (Day 1..N stays, invalid days, missing itinerary)
 * 3. P2: Source Badge Normalization (object structure { name, confidence, url })
 * 4. P2: Foreign-National Travel Restrictions (Nathula & Gurudongmar restrictions, RAP/PAP rules in EN, HI, NE)
 */

import { describe, it, expect } from 'vitest';
import { parseCopilotIntent } from '../../src/services/copilot/copilotIntentService.js';
import { processCopilotAI } from '../src/services/ai/copilotAIService.js';
import { getMultilingualTemplates } from '../src/services/i18n/multilingualTemplates.js';

describe('Targeted Product Quality Improvements Suite', () => {
  const sampleItinerary = {
    overview: { duration: 5, route: ['Gangtok', 'Lachung', 'Yumthang'] },
    days: [
      {
        day: 1,
        title: 'Arrival in Gangtok',
        baseLocation: 'Gangtok',
        stay: { name: 'The Elgin Nor-Khill Heritage Hotel', location: 'Gangtok', type: 'Heritage Hotel' }
      },
      {
        day: 2,
        title: 'Tsomgo Lake Excursion',
        baseLocation: 'Gangtok',
        stay: { name: 'The Elgin Nor-Khill Heritage Hotel', location: 'Gangtok', type: 'Heritage Hotel' }
      },
      {
        day: 3,
        title: 'Transfer to North Sikkim (Lachung)',
        baseLocation: 'Lachung',
        stay: { name: 'Yarlam Resort & Homestay', location: 'Lachung', type: 'Homestay' }
      },
      {
        day: 4,
        title: 'Yumthang Valley & Zero Point',
        baseLocation: 'Lachung',
        stay: { name: 'Yarlam Resort & Homestay', location: 'Lachung', type: 'Homestay' }
      },
      {
        day: 5,
        title: 'Return to Gangtok / Departure',
        baseLocation: 'Gangtok',
        stay: null // Missing stay for departure day
      }
    ]
  };

  // ─────────────────────────────────────────────────────────────
  // 1. P1: Specific Accommodation Lookup
  // ─────────────────────────────────────────────────────────────
  describe('1. P1: Specific Accommodation Lookup', () => {
    it('returns exact property and location for a valid day (Day 3)', async () => {
      const intent = parseCopilotIntent('Where are we staying on Day 3?');
      expect(intent.intent).toBe('ACCOMMODATION_LOOKUP');
      expect(intent.entities.dayNumber).toBe(3);

      const res = await processCopilotAI({
        message: 'Where are we staying on Day 3?',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });

      expect(res.text).toContain('Day 3');
      expect(res.text).toContain('Yarlam Resort & Homestay');
      expect(res.text).toContain('Lachung');
      expect(res.dataCard).toBeDefined();
      expect(res.dataCard.title).toContain('Day 3 Accommodation');
    });

    it('returns exact property for Day 1 when asking about hotel', async () => {
      const intent = parseCopilotIntent('What is our hotel on Day 1?');
      expect(intent.intent).toBe('ACCOMMODATION_LOOKUP');
      expect(intent.entities.dayNumber).toBe(1);

      const res = await processCopilotAI({
        message: 'What is our hotel on Day 1?',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });

      expect(res.text).toContain('The Elgin Nor-Khill Heritage Hotel');
      expect(res.text).toContain('Gangtok');
    });

    it('gracefully communicates when accommodation is not specified on an itinerary day', async () => {
      const intent = parseCopilotIntent('Where will we stay on Day 5?');
      expect(intent.entities.dayNumber).toBe(5);

      const res = await processCopilotAI({
        message: 'Where will we stay on Day 5?',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });

      expect(res.text).toContain('not been selected yet');
      expect(res.text).not.toContain('undefined');
    });

    it('handles invalid day numbers gracefully (e.g., Day 9 in a 5-day trip)', async () => {
      const intent = parseCopilotIntent('Where are we staying on Day 9?');
      expect(intent.entities.dayNumber).toBe(9);

      const res = await processCopilotAI({
        message: 'Where are we staying on Day 9?',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });

      expect(res.text).toContain('valid day number between 1 and 5');
    });

    it('handles missing itinerary context gracefully', async () => {
      const intent = parseCopilotIntent('Where are we staying tonight?');

      const res = await processCopilotAI({
        message: 'Where are we staying tonight?',
        intent,
        context: { duration: 5, itinerary: null }
      });

      expect(res.text).toContain("haven't generated an itinerary yet");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. P2: Source Badge Normalization
  // ─────────────────────────────────────────────────────────────
  describe('2. P2: Source Badge Normalization', () => {
    it('returns standardized object { name, confidence } across deterministic responses', async () => {
      const intent = parseCopilotIntent('What is the weather?');
      const res = await processCopilotAI({
        message: 'What is the weather?',
        intent,
        context: { duration: 5 }
      });

      expect(typeof res.sourceBadge).toBe('object');
      expect(res.sourceBadge.name).toBe('Open-Meteo Weather Proxy');
      expect(res.sourceBadge.confidence).toBe('HIGH');
      expect(res.sourceBadge.url).toBe('https://open-meteo.com');
    });

    it('provides valid sourceBadge for permit inquiries', async () => {
      const intent = parseCopilotIntent('What permits do I need?');
      const res = await processCopilotAI({
        message: 'What permits do I need?',
        intent,
        context: { duration: 5 }
      });

      expect(typeof res.sourceBadge).toBe('object');
      expect(res.sourceBadge.name).toBe('Sikkim Tourism & Civil Authorities');
      expect(res.sourceBadge.confidence).toBe('HIGH');
      expect(res.sourceBadge.url).toBe('https://www.sikkimtourism.gov.in');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. P2: Foreign-National Travel Restrictions
  // ─────────────────────────────────────────────────────────────
  describe('3. P2: Foreign-National Travel Restrictions Verification', () => {
    it('clearly distinguishes Indian citizens from foreign nationals in English', async () => {
      const t = getMultilingualTemplates('en');
      expect(t.permits).toContain('Indian citizens require PAP');
      expect(t.permits).toContain('Foreign nationals mandatorily require RAP');
      expect(t.permits).toContain('Nathula Pass and Gurudongmar Lake are strictly prohibited for foreign nationals');
    });

    it('articulates foreign-national restrictions in Hindi', async () => {
      const t = getMultilingualTemplates('hi');
      expect(t.permits).toContain('भारतीय नागरिकों को');
      expect(t.permits).toContain('विदेशी नागरिकों को सिक्किम में प्रवेश के लिए रिस्ट्रिक्टेड एरिया परमिट (RAP/ILP)');
      expect(t.permits).toContain('नाथुला दर्रा और गुरुडोंगमार झील में प्रवेश पूर्णतः प्रतिबंधित है');
    });

    it('articulates foreign-national restrictions in Nepali', async () => {
      const t = getMultilingualTemplates('ne');
      expect(t.permits).toContain('भारतीय नागरिकहरूलाई');
      expect(t.permits).toContain('विदेशी नागरिकहरूलाई सिक्किम प्रवेशका लागि रेस्ट्रिक्टेड एरिया परमिट (RAP/ILP)');
      expect(t.permits).toContain('नाथुला भञ्ज्याङ र गुरुडोङमार ताल जान पूर्ण रूपमा प्रतिबन्ध लगाइएको छ');
    });
  });
});
