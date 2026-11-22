import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { parseCopilotIntent } from '../../src/services/copilot/copilotIntentService.js';
import { processCopilotAI } from '../src/services/ai/copilotAIService.js';

describe('Five Visitors Realistic Experience Audit', () => {
  const sampleItinerary = {
    days: [
      { day: 1, baseLocation: 'Gangtok', overnightLocation: 'Gangtok', stay: { name: 'Mayfair Spa Resort', location: 'Gangtok', type: 'Luxury Resort' } },
      { day: 2, baseLocation: 'Tsomgo Lake', overnightLocation: 'Gangtok', stay: { name: 'Mayfair Spa Resort', location: 'Gangtok', type: 'Luxury Resort' } },
      { day: 3, baseLocation: 'Ravangla', overnightLocation: 'Pelling', stay: { name: 'The Elgin Mount Pandim', location: 'Pelling', type: 'Heritage Hotel' } },
      { day: 4, baseLocation: 'Pelling', overnightLocation: 'Pelling', stay: { name: 'The Elgin Mount Pandim', location: 'Pelling', type: 'Heritage Hotel' } },
      { day: 5, baseLocation: 'Pelling', overnightLocation: 'Bagdogra', stay: null }
    ]
  };

  // ─────────────────────────────────────────────────────────────
  // Visitor 1 — Curious visitor
  // ─────────────────────────────────────────────────────────────
  describe('Visitor 1 — Curious visitor (zero forced booking, warm & natural)', () => {
    it('handles "Hi!" with warm hospitality', async () => {
      const intent = parseCopilotIntent('Hi!');
      expect(intent.intent).toBe('GREETING');
      const res = await processCopilotAI({ message: 'Hi!', intent, context: { duration: 5 } });
      expect(res.text).toContain('Tashi Delek');
      expect(res.actionCard).toBeUndefined();
    });

    it('handles "I love you." with charming wit and NO forced action card', async () => {
      const intent = parseCopilotIntent('I love you.');
      expect(intent.intent).toBe('LOVE_COMPLIMENT');
      expect(intent.isMutating).toBe(false);

      const res = await processCopilotAI({
        message: 'I love you.',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });

      // Flattered & charming, mentions Ravangla & Temi tea
      expect(res.text).toContain('Ravangla');
      expect(res.text).toContain('Temi tea');
      expect(res.text).toContain('Mt. Kanchenjunga');
      expect(res.actionCard).toBeUndefined(); // Zero forced modal/card
      expect(res.sourceBadge.confidence).toBe('VERIFIED');
    });

    it('handles "Sikkim looks beautiful." with evocative mountain storytelling', async () => {
      const intent = parseCopilotIntent('Sikkim looks beautiful.');
      expect(intent.intent).toBe('TRAVEL_INSPIRATION');
      const res = await processCopilotAI({ message: 'Sikkim looks beautiful.', intent, context: { duration: 5 } });
      expect(res.text).toContain('another world');
      expect(res.text).toContain('alpine meadows');
      expect(res.actionCard).toBeUndefined();
    });

    it('handles "I wish I could visit someday." with encouraging aspiration', async () => {
      const intent = parseCopilotIntent('I wish I could visit someday.');
      expect(intent.intent).toBe('TRAVEL_ASPIRATION');
      const res = await processCopilotAI({ message: 'I wish I could visit someday.', intent, context: { duration: 5 } });
      expect(res.text).toContain('Himalayan adventure');
      expect(res.actionCard).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Visitor 2 — Family traveller
  // ─────────────────────────────────────────────────────────────
  describe('Visitor 2 — Family traveller (context retention & consistent recommendations)', () => {
    it('handles "I want to take my family to Sikkim." with family-friendly advice', async () => {
      const intent = parseCopilotIntent('I want to take my family to Sikkim.');
      expect(intent.intent).toBe('FAMILY_TRIP');
      const res = await processCopilotAI({ message: 'I want to take my family to Sikkim.', intent, context: { duration: 5 } });
      expect(res.text).toContain('hospitable destinations for families');
      expect(res.text).toContain('Gangtok');
      expect(res.text).toContain('Pelling');
    });

    it('handles "We have 5 days." with an actionable 5-day route', async () => {
      const intent = parseCopilotIntent('We have 5 days.');
      expect(intent.intent).toBe('ITINERARY_RECOMMENDATION');
      const res = await processCopilotAI({ message: 'We have 5 days.', intent, context: { duration: 5 } });
      expect(res.text).toContain('Day 1');
      expect(res.text).toContain('Day 5');
    });

    it('handles "What places would be suitable?" with comprehensive regional circuit advice', async () => {
      const intent = parseCopilotIntent('What places would be suitable?');
      expect(intent.intent).toBe('DESTINATION_ADVICE');
      const res = await processCopilotAI({ message: 'What places would be suitable?', intent, context: { duration: 5 } });
      expect(res.text).toContain('East Sikkim');
      expect(res.text).toContain('West Sikkim');
    });

    it('handles "How much might it cost?" with realistic price breakdown and ESTIMATED confidence', async () => {
      const intent = parseCopilotIntent('How much might it cost?');
      expect(intent.intent).toBe('BUDGET_INQUIRY');
      const res = await processCopilotAI({ message: 'How much might it cost?', intent, context: { duration: 5 } });
      expect(res.text).toContain('₹3,500 – ₹5,500');
      expect(res.sourceBadge.confidence).toBe('ESTIMATED');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Visitor 3 — Adventure traveller
  // ─────────────────────────────────────────────────────────────
  describe('Visitor 3 — Adventure traveller (destination, seasonal, altitude & permit accuracy)', () => {
    it('handles "I want to experience snowfall." with accurate snow points and season', async () => {
      const intent = parseCopilotIntent('I want to experience snowfall.');
      expect(intent.intent).toBe('SNOWFALL_INQUIRY');
      const res = await processCopilotAI({ message: 'I want to experience snowfall.', intent, context: { duration: 5 } });
      expect(res.text).toContain('Yumthang Valley');
      expect(res.text).toContain('Zero Point');
      expect(res.text).toContain('December and March');
    });

    it('handles "Can I visit North Sikkim?" with road durations and foreign national rules', async () => {
      const intent = parseCopilotIntent('Can I visit North Sikkim?');
      expect(intent.intent).toBe('NORTH_SIKKIM_INQUIRY');
      const res = await processCopilotAI({ message: 'Can I visit North Sikkim?', intent, context: { duration: 5 } });
      expect(res.text).toContain('Lachung');
      expect(res.text).toContain('Protected Area Permit');
      expect(res.text).toContain('Ministry of Home Affairs');
      expect(res.text).toContain('Nathula Pass and Gurudongmar Lake remain restricted');
    });

    it('handles "What about altitude?" with safety and acclimatization guidance', async () => {
      const intent = parseCopilotIntent('What about altitude?');
      expect(intent.intent).toBe('ALTITUDE_ADVISORY');
      const res = await processCopilotAI({ message: 'What about altitude?', intent, context: { duration: 5 } });
      expect(res.text).toContain('Acclimatization');
      expect(res.text).toContain('Stay hydrated');
    });

    it('handles "Which month would be best?" with comprehensive seasonal breakdown', async () => {
      const intent = parseCopilotIntent('Which month would be best?');
      expect(intent.intent).toBe('BEST_TIME_TO_VISIT');
      const res = await processCopilotAI({ message: 'Which month would be best?', intent, context: { duration: 5 } });
      expect(res.text).toContain('Spring (March to May)');
      expect(res.text).toContain('Autumn (October to November)');
      expect(res.text).toContain('Winter (December to February)');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Visitor 4 — Budget-conscious traveller
  // ─────────────────────────────────────────────────────────────
  describe('Visitor 4 — Budget-conscious traveller (distinguishes estimates from confirmed prices)', () => {
    it('handles "I have a limited budget." by offering a realistic savings proposal', async () => {
      const intent = parseCopilotIntent('I have a limited budget.');
      expect(intent.intent).toBe('REDUCE_BUDGET');
      const res = await processCopilotAI({ message: 'I have a limited budget.', intent, context: { duration: 5, budget: { estimatedMax: 45000 } } });
      expect(res.sourceBadge.confidence).toBe('ESTIMATED');
      expect(res.actionCard).toBeDefined();
    });

    it('handles "Can we reduce unnecessary travel costs?" with shared transport & homestays', async () => {
      const intent = parseCopilotIntent('Can we reduce unnecessary travel costs?');
      expect(intent.intent).toBe('REDUCE_BUDGET');
      const res = await processCopilotAI({ message: 'Can we reduce unnecessary travel costs?', intent, context: { duration: 5, budget: { estimatedMax: 45000 } } });
      expect(res.actionCard.refinementInstruction).toContain('shared transport and homestays');
    });

    it('handles "What is included in the estimated budget?" with transparent inclusions and disclaimer', async () => {
      const intent = parseCopilotIntent('What is included in the estimated budget?');
      expect(intent.intent).toBe('BUDGET_INCLUSIONS');
      const res = await processCopilotAI({ message: 'What is included in the estimated budget?', intent, context: { duration: 5 } });
      expect(res.text).toContain('Dedicated private mountain vehicle');
      expect(res.text).toContain('Exclusions');
      expect(res.text).toContain('deterministic estimates');
      expect(res.sourceBadge.confidence).toBe('ESTIMATED');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Visitor 5 — Ready-to-book traveller
  // ─────────────────────────────────────────────────────────────
  describe('Visitor 5 — Ready-to-book traveller (reservation request flow & zero false claims)', () => {
    it('handles "I want to book this trip." with booking wizard card and zero false claims', async () => {
      const intent = parseCopilotIntent('I want to book this trip.');
      expect(intent.intent).toBe('BOOK_TRIP');
      const res = await processCopilotAI({
        message: 'I want to book this trip.',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });

      expect(res.text).toContain('verified reservation request');
      expect(res.text).toContain('no immediate payment is charged until availability is confirmed');
      expect(res.actionCard).toBeDefined();
      expect(res.actionCard.refinementInstruction).toBe('LAUNCH_BOOKING_WIZARD');
      expect(res.actionCard.actionLabel).toBe('Review & Request Booking');
    });

    it('handles "How do I confirm it?" by launching the booking wizard', async () => {
      const intent = parseCopilotIntent('How do I confirm it?');
      expect(intent.intent).toBe('BOOK_TRIP');
      const res = await processCopilotAI({
        message: 'How do I confirm it?',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });
      expect(res.actionCard.refinementInstruction).toBe('LAUNCH_BOOKING_WIZARD');
    });

    it('handles "Can I submit my reservation request?" properly without claiming prior approval', async () => {
      const intent = parseCopilotIntent('Can I submit my reservation request?');
      expect(intent.intent).toBe('BOOK_TRIP');
      const res = await processCopilotAI({
        message: 'Can I submit my reservation request?',
        intent,
        context: { duration: 5, itinerary: sampleItinerary }
      });
      expect(res.text).not.toContain('already approved');
      expect(res.text).not.toContain('permit is approved');
    });

    it('successfully processes reservation request submission via POST /api/booking-request', async () => {
      const bookingPayload = {
        trip: {
          duration: 5,
          startDate: '2026-12-10',
          endDate: '2026-12-15',
          adults: 2,
          children: 1,
          seniors: 0,
          destinations: ['gangtok', 'pelling']
        },
        traveler: {
          fullName: 'Tashi Namgyal',
          email: 'tashi@example.com',
          phone: '+919876543210'
        },
        contact: {
          fullName: 'Tashi Namgyal',
          email: 'tashi@example.com',
          phone: '+919876543210'
        },
        destinations: ['gangtok', 'pelling'],
        itinerary: [
          { dayNumber: 1, title: 'Gangtok Arrival', location: 'Gangtok' },
          { dayNumber: 2, title: 'Tsomgo Lake Excursion', location: 'Tsomgo' },
          { dayNumber: 3, title: 'Scenic Drive to Pelling', location: 'Pelling' },
          { dayNumber: 4, title: 'Pelling Skywalk & Monasteries', location: 'Pelling' },
          { dayNumber: 5, title: 'Departure Bagdogra', location: 'Bagdogra' }
        ],
        budget: { tier: 'MODERATE', totalEstimate: 45000 },
        specialRequests: 'Elderly friendly pace and ground floor rooms'
      };

      const res = await request(app)
        .post('/api/booking-request')
        .send(bookingPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.requestId).toBeDefined();
      expect(res.body.status).toBe('RECEIVED');
    });
  });
});
