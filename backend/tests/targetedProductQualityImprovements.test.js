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
      expect(res.sourceBadge.confidence).toBe('VERIFIED');
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
      expect(res.sourceBadge.confidence).toBe('VERIFIED');
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
      expect(t.permits).toContain('Foreign nationals require an initial RAP');
      expect(t.permits).toContain('foreign nationals ARE permitted to visit Lachung, Yumthang Valley, and Lachen');
      expect(t.permits).toContain('Nathula Pass and Gurudongmar Lake are strictly prohibited for foreign nationals');
    });

    it('articulates foreign-national restrictions in Hindi', async () => {
      const t = getMultilingualTemplates('hi');
      expect(t.permits).toContain('भारतीय नागरिकों को');
      expect(t.permits).toContain('विदेशी पर्यटकों को पंजीकृत टूर ऑपरेटर के माध्यम से कम से कम 2 व्यक्तियों के समूह में लाचुंग, युमथांग घाटी और लाचेन जाने की अनुमति है');
      expect(t.permits).toContain('नाथुला दर्रा और गुरुडोंगमार झील में प्रवेश पूर्णतः प्रतिबंधित है');
    });

    it('articulates foreign-national restrictions in Nepali', async () => {
      const t = getMultilingualTemplates('ne');
      expect(t.permits).toContain('भारतीय नागरिकहरूलाई');
      expect(t.permits).toContain('उत्तर सिक्किममा विदेशी पर्यटकहरूलाई दर्तावाला ट्राभल एजेन्सीमार्फत कम्तीमा २ जनाको समूहमा लाचुङ, युमथाङ र लाचेन भ्रमण गर्न अनुमति दिइएको छ');
      expect(t.permits).toContain('नाथुला भञ्ज्याङ र गुरुडोङमार ताल जान पूर्ण रूपमा प्रतिबन्ध लगाइएको छ');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Conversational Intelligence & Realistic Visitor Journeys
  // ─────────────────────────────────────────────────────────────
  describe('4. Conversational Intelligence & Realistic Visitor Journeys', () => {
    // A. Emotional & Friendly Messages (Never triggers booking wizard)
    describe('4.1 Emotional and Friendly Messages', () => {
      it('handles "I love you." with warm appreciation and NO action card', async () => {
        const intent = parseCopilotIntent('I love you.');
        expect(intent.intent).toBe('LOVE_COMPLIMENT');
        expect(intent.isMutating).toBe(false);

        const res = await processCopilotAI({
          message: 'I love you.',
          intent,
          context: { duration: 5, itinerary: sampleItinerary }
        });

        expect(res.text).toContain('Ravangla');
        expect(res.text).toContain('Temi tea');
        // Crucial requirement: LOVE_COMPLIMENT must NEVER trigger booking wizard
        expect(res.actionCard).toBeUndefined();
      });

      it('handles "You are amazing!" and "You are so sweet." naturally without booking cards', async () => {
        const intent1 = parseCopilotIntent('You are amazing!');
        expect(intent1.intent).toBe('LOVE_COMPLIMENT');
        const res1 = await processCopilotAI({ message: 'You are amazing!', intent: intent1, context: { duration: 5 } });
        expect(res1.actionCard).toBeUndefined();

        const intent2 = parseCopilotIntent('You are so sweet.');
        expect(intent2.intent).toBe('LOVE_COMPLIMENT');
        const res2 = await processCopilotAI({ message: 'You are so sweet.', intent: intent2, context: { duration: 5 } });
        expect(res2.actionCard).toBeUndefined();
      });

      it('handles "I wish I could visit Sikkim." with inspiring storytelling', async () => {
        const intent = parseCopilotIntent('I wish I could visit Sikkim.');
        expect(intent.intent).toBe('TRAVEL_ASPIRATION');

        const res = await processCopilotAI({
          message: 'I wish I could visit Sikkim.',
          intent,
          context: { duration: 5 }
        });

        expect(res.text).toContain('Kanchenjunga');
        expect(res.text).toContain('Pelling');
        expect(res.text).toContain('Lachung');
        expect(res.text).toContain('peaceful escape, an adventure-filled holiday');
        expect(res.actionCard).toBeUndefined();
      });

      it('handles "I am already falling in love with this place." and "I want to experience these mountains."', async () => {
        const intent1 = parseCopilotIntent('I am already falling in love with this place.');
        expect(intent1.intent).toBe('TRAVEL_ASPIRATION');

        const intent2 = parseCopilotIntent('I want to experience these mountains.');
        expect(intent2.intent).toBe('TRAVEL_ASPIRATION');

        const res = await processCopilotAI({ message: 'I want to experience these mountains.', intent: intent2, context: { duration: 5 } });
        expect(res.text).toContain('Himalayan adventure');
        expect(res.actionCard).toBeUndefined();
      });
    });

    // B. Travel Inspiration
    describe('4.2 Travel Inspiration', () => {
      it('handles "Wow, Sikkim looks beautiful!" and mountain admiration', async () => {
        const intent1 = parseCopilotIntent('Wow, Sikkim looks beautiful!');
        expect(intent1.intent).toBe('TRAVEL_INSPIRATION');

        const intent2 = parseCopilotIntent('I have never seen such beautiful mountains.');
        expect(intent2.intent).toBe('TRAVEL_INSPIRATION');

        const res = await processCopilotAI({ message: 'Wow, Sikkim looks beautiful!', intent: intent1, context: { duration: 5 } });
        expect(res.text).toContain('another world');
        expect(res.text).toContain('14,000-foot alpine meadows');
        expect(res.actionCard).toBeUndefined();
      });

      it('handles "I want a peaceful vacation." and "I want to visit somewhere less crowded."', async () => {
        const intent1 = parseCopilotIntent('I want a peaceful vacation.');
        expect(intent1.intent).toBe('PEACEFUL_GETAWAY');

        const intent2 = parseCopilotIntent('I want to visit somewhere less crowded.');
        expect(intent2.intent).toBe('PEACEFUL_GETAWAY');

        const res = await processCopilotAI({ message: 'I want a peaceful vacation.', intent: intent1, context: { duration: 5 } });
        expect(res.text).toContain('Ravangla');
        expect(res.text).toContain('Yuksom');
        expect(res.text).toContain('Dzongu');
        expect(res.actionCard).toBeUndefined();
      });

      it('handles "I want to experience snowfall." with seasonal advice', async () => {
        const intent = parseCopilotIntent('I want to experience snowfall.');
        expect(intent.intent).toBe('SNOWFALL_INQUIRY');

        const res = await processCopilotAI({ message: 'I want to experience snowfall.', intent, context: { duration: 5 } });
        expect(res.text).toContain('Yumthang Valley');
        expect(res.text).toContain('Zero Point');
        expect(res.text).toContain('December and March');
        expect(res.actionCard).toBeUndefined();
      });

      it('handles "I want to surprise my family with a trip."', async () => {
        const intent = parseCopilotIntent('I want to surprise my family with a trip.');
        expect(intent.intent).toBe('FAMILY_TRIP');

        const res = await processCopilotAI({ message: 'I want to surprise my family with a trip.', intent, context: { duration: 5 } });
        expect(res.text).toContain('safest, cleanest');
        expect(res.text).toContain('Gangtok');
        expect(res.text).toContain('Pelling');
        expect(res.actionCard).toBeUndefined();
      });
    });

    // C. Travel Interest
    describe('4.3 Travel Interest & Planning Questions', () => {
      it('differentiates informational budget inquiry from budget reduction mutation', async () => {
        const infoIntent = parseCopilotIntent('How much will a Sikkim trip cost?');
        expect(infoIntent.intent).toBe('BUDGET_INQUIRY');
        expect(infoIntent.isMutating).toBe(false);

        const res = await processCopilotAI({ message: 'How much will a Sikkim trip cost?', intent: infoIntent, context: { duration: 5 } });
        expect(res.text).toContain('Comfortable / Homestay Circuit');
        expect(res.text).toContain('Premium Mountain Resort Circuit');
        expect(res.dataCard).toBeDefined();
        expect(res.actionCard).toBeUndefined(); // Informational cost question should not mutate budget

        // Compare with explicit reduction
        const mutIntent = parseCopilotIntent('Make my trip cheaper.');
        expect(mutIntent.intent).toBe('REDUCE_BUDGET');
        expect(mutIntent.isMutating).toBe(true);
      });

      it('handles "Can you plan a romantic trip?" with boutique mountain retreat advice', async () => {
        const intent = parseCopilotIntent('Can you plan a romantic trip?');
        expect(intent.intent).toBe('ROMANTIC_TRIP');

        const res = await processCopilotAI({ message: 'Can you plan a romantic trip?', intent, context: { duration: 5 } });
        expect(res.text).toContain('Mt. Kanchenjunga');
        expect(res.text).toContain('Pelling');
        expect(res.text).toContain('Ravangla');
        expect(res.actionCard).toBeUndefined();
      });

      it('handles "Which places should I visit?" with structured regional circuit guidance', async () => {
        const intent = parseCopilotIntent('Which places should I visit?');
        expect(intent.intent).toBe('DESTINATION_ADVICE');
        expect(intent.isMutating).toBe(false);

        const res = await processCopilotAI({ message: 'Which places should I visit?', intent, context: { duration: 5 } });
        expect(res.text).toContain('East Sikkim');
        expect(res.text).toContain('West Sikkim');
        expect(res.text).toContain('North Sikkim');
        expect(res.text).toContain('South Sikkim');
      });

      it('handles "Is Sikkim suitable for a family vacation?"', async () => {
        const intent = parseCopilotIntent('Is Sikkim suitable for a family vacation?');
        expect(intent.intent).toBe('FAMILY_TRIP');

        const res = await processCopilotAI({ message: 'Is Sikkim suitable for a family vacation?', intent, context: { duration: 5 } });
        expect(res.text).toContain('safest, cleanest');
        expect(res.text).toContain('children');
      });

      it('handles "I want a 5-day trip." without breaking duration flow', async () => {
        const intent = parseCopilotIntent('I want a 5-day trip.');
        expect(intent.intent).toBe('ITINERARY_RECOMMENDATION');

        const res = await processCopilotAI({ message: 'I want a 5-day trip.', intent, context: { duration: 5 } });
        expect(res.text).toContain('5-day Sikkim circuit');
      });
    });

    // D. Booking Intent & Transparent Reservation Requests
    describe('4.4 Explicit Booking Intent & Reservation Request Integrity', () => {
      it('triggers reservation request action card when explicit booking intent is stated WITH itinerary', async () => {
        const intent1 = parseCopilotIntent('I want to book a trip.');
        expect(intent1.intent).toBe('BOOK_TRIP');

        const intent2 = parseCopilotIntent('Can I reserve this itinerary?');
        expect(intent2.intent).toBe('BOOK_TRIP');

        const intent3 = parseCopilotIntent('How do I confirm my booking?');
        expect(intent3.intent).toBe('BOOK_TRIP');

        const res = await processCopilotAI({
          message: 'I want to book a trip.',
          intent: intent1,
          context: { duration: 5, itinerary: sampleItinerary }
        });

        // Clearly communicates that it is a verified reservation request, not a finalized charge
        expect(res.text).toContain('verified reservation request');
        expect(res.text).toContain('no immediate payment is charged');
        expect(res.actionCard).toBeDefined();
        expect(res.actionCard.title).toBe('Submit Reservation Request');
        expect(res.actionCard.refinementInstruction).toBe('LAUNCH_BOOKING_WIZARD');
        expect(res.actionCard.actionLabel).toBe('Review & Request Booking');
      });

      it('gracefully prompts for itinerary creation when booking is requested WITHOUT an existing itinerary', async () => {
        const intent = parseCopilotIntent('I want to book a trip.');
        const res = await processCopilotAI({
          message: 'I want to book a trip.',
          intent,
          context: { duration: 5, itinerary: null }
        });

        expect(res.text).toContain('first need to shape your personalized itinerary');
        expect(res.actionCard).toBeUndefined(); // Never returns broken booking wizard when no itinerary exists
      });

      it('handles "I am ready to plan my vacation." cleanly', async () => {
        const intent = parseCopilotIntent('I am ready to plan my vacation.');
        expect(intent.intent).toBe('START_PLANNING');

        const res = await processCopilotAI({ message: 'I am ready to plan my vacation.', intent, context: { duration: 5 } });
        expect(res.text).toContain('vacation to life');
      });
    });

    // E. Multilingual Engagement & Zero False Approvals
    describe('4.5 Multilingual Natural Responses & Safety', () => {
      it('replies warmly in Hindi without false confirmations or booking push', async () => {
        const intent = parseCopilotIntent('मुझे आपसे प्यार है');
        expect(intent.intent).toBe('LOVE_COMPLIMENT');

        const res = await processCopilotAI({
          message: 'मुझे आपसे प्यार है',
          intent,
          context: { duration: 5, language: 'hi', itinerary: sampleItinerary }
        });

        expect(res.text).toContain('बहुत-बहुत शुक्रिया');
        expect(res.text).toContain('पेलिंग की ठंडी सुबह');
        expect(res.actionCard).toBeUndefined();
      });

      it('replies with genuine mountain hospitality in Nepali without booking push', async () => {
        const intent = parseCopilotIntent('तपाईंलाई माया गर्छु');
        expect(intent.intent).toBe('LOVE_COMPLIMENT');

        const res = await processCopilotAI({
          message: 'तपाईंलाई माया गर्छु',
          intent,
          context: { duration: 5, language: 'ne', itinerary: sampleItinerary }
        });

        expect(res.text).toContain('धेरै धेरै धन्यवाद');
        expect(res.text).toContain('चिसो बिहानमा तातो चिया');
        expect(res.actionCard).toBeUndefined();
      });

      it('never hallucinates pre-approved permits or confirmed hotel rooms in responses', async () => {
        const queries = [
          'Can I reserve this itinerary?',
          'What permits do I need?',
          'Where are we staying on Day 1?'
        ];

        for (const q of queries) {
          const intent = parseCopilotIntent(q);
          const res = await processCopilotAI({ message: q, intent, context: { duration: 5, itinerary: sampleItinerary } });
          const text = (res.text || '').toLowerCase();
          expect(text).not.toContain('hotel room is booked');
          expect(text).not.toContain('permit is approved');
        }
      });
    });
  });
});
