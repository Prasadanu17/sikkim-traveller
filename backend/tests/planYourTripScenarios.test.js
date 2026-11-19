/**
 * backend/tests/planYourTripScenarios.test.js
 * Comprehensive Functional Verification Suite for "Plan Your Trip":
 * 
 * Scenario 1: A beginner creates a simple Sikkim trip
 * Scenario 2: A user plans a short 2–3 day trip
 * Scenario 3: A user plans a 5–7 day trip
 * Scenario 4: A user selects North Sikkim
 * Scenario 5: A user changes their budget
 * Scenario 6: A user changes destinations after itinerary generation
 * Scenario 7: A user regenerates or refines their itinerary
 * Scenario 8: A user encounters invalid inputs or unavailable data
 * Scenario 9: A user saves and retrieves a trip
 * Scenario 10: A user views and exports the itinerary
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

// Import frontend services directly
import { prepareRouteBlueprint } from '../../src/services/itinerary/routePreparationService.js';
import { generateFallbackItinerary } from '../../src/services/itinerary/itineraryFallbackService.js';
import { applyItineraryPatch } from '../../src/services/itinerary/itineraryPatchService.js';
import { estimateTripBudget, analyzeBudgetMatch } from '../../src/services/travelIntelligence/budgetService.js';
import {
  getRecommendedDestinations,
  validateDestinationCombination,
  optimizeDestinationRoute
} from '../../src/services/travelIntelligence/destinationRecommendationService.js';
import { parseRefinementIntent } from '../../src/services/itinerary/refinementIntentService.js';
import { refineFallbackItinerary } from '../../src/services/itinerary/refinementFallbackService.js';
import { generateItineraryIcs, escapeIcsText } from '../../src/services/calendar/icsExportService.js';
import { createCustomerJourney } from '../../src/services/customer/customerJourneyCreationService.js';
import { getCustomerSafeJourney } from '../src/services/customer/journeyService.js';

describe('Plan Your Trip: 10 Core User Journey Scenarios', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── SCENARIO 1: Beginner creates a simple Sikkim trip ───
  describe('Scenario 1: Beginner creates a simple Sikkim trip', () => {
    it('generates a balanced 5-day Sikkim trip with valid budget, route and days', () => {
      const tripContext = {
        duration: 5,
        interests: ['mountains', 'culture'],
        destinations: [
          { name: 'Gangtok', slug: 'gangtok', region: 'East Sikkim', overnight: true, highlights: ['MG Marg', 'Rumtek'] }
        ],
        travelers: { total: 2, adults: 2, children: 0, seniors: 0, type: 'couple' },
        travelStyle: 'balanced',
        budget: { level: 'comfortable', estimatedMin: 32000, estimatedMax: 48000 },
        accommodation: { types: ['hotel'], comfort: 'comfortable' },
        transportation: { preferredModes: ['private-cab'], comfort: 'balanced' },
        travelTiming: { season: 'Autumn', start: '2026-10-15', end: '2026-10-20' }
      };

      const itinerary = generateFallbackItinerary(tripContext);

      expect(itinerary).toBeDefined();
      expect(itinerary.days).toHaveLength(5);
      expect(itinerary.days[0].title).toContain('Arrival in Gangtok');
      expect(itinerary.days[4].title).toContain('Departure');
      expect(itinerary.budget.total.min).toBeGreaterThan(20000);
      expect(itinerary.budget.total.max).toBeGreaterThan(itinerary.budget.total.min);
      expect(itinerary.whyThisTripWorks.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ─── SCENARIO 2: Short 2-3 day trip ───
  describe('Scenario 2: Short 2–3 day trip', () => {
    it('schedules Day 2 departure for a 2-day trip without orphan overnights', () => {
      const blueprint2 = prepareRouteBlueprint({
        duration: 2,
        destinations: [{ name: 'Gangtok', slug: 'gangtok', region: 'East Sikkim', overnight: true }],
        travelStyle: 'balanced'
      });

      expect(blueprint2.dayBlueprints).toHaveLength(2);
      expect(blueprint2.dayBlueprints[0].dayType).toBe('arrival');
      expect(blueprint2.dayBlueprints[1].dayType).toBe('departure');
      expect(blueprint2.dayBlueprints[1].overnightLocation).toBe('Home');
      expect(blueprint2.dayBlueprints[1].transit.note).toBe('Departure transfer');
    });

    it('schedules Day 3 departure for a 3-day trip with Day 2 excursion', () => {
      const blueprint3 = prepareRouteBlueprint({
        duration: 3,
        destinations: [{ name: 'Gangtok', slug: 'gangtok', region: 'East Sikkim', overnight: true }],
        travelStyle: 'balanced'
      });

      expect(blueprint3.dayBlueprints).toHaveLength(3);
      expect(blueprint3.dayBlueprints[0].dayType).toBe('arrival');
      expect(blueprint3.dayBlueprints[1].dayType).toBe('excursion');
      expect(blueprint3.dayBlueprints[2].dayType).toBe('departure');
    });
  });

  // ─── SCENARIO 3: 5-7 day trip ───
  describe('Scenario 3: 5–7 day trip', () => {
    it('creates a multi-destination West/South Sikkim circuit for a 6-day trip', () => {
      const blueprint6 = prepareRouteBlueprint({
        duration: 6,
        destinations: [
          { name: 'Gangtok', slug: 'gangtok', region: 'East Sikkim', overnight: true },
          { name: 'Pelling', slug: 'pelling', region: 'West Sikkim', overnight: true },
          { name: 'Ravangla', slug: 'ravangla', region: 'South Sikkim', overnight: false }
        ],
        travelStyle: 'balanced'
      });

      expect(blueprint6.dayBlueprints).toHaveLength(6);
      expect(blueprint6.dayBlueprints[1].baseLocation).toBe('Pelling');
      expect(blueprint6.dayBlueprints[5].dayType).toBe('departure');
    });
  });

  // ─── SCENARIO 4: North Sikkim selection ───
  describe('Scenario 4: North Sikkim selection', () => {
    it('includes Inner Line Permit warnings and high altitude notes for Lachung', () => {
      const tripContext = {
        duration: 5,
        interests: ['mountains', 'snow'],
        destinations: [
          { name: 'Gangtok', slug: 'gangtok', region: 'East Sikkim', overnight: true, highlights: ['MG Marg'] },
          { name: 'Lachung', slug: 'lachung', region: 'North Sikkim', overnight: true, highlights: ['Yumthang', 'Zero Point'] }
        ],
        travelers: { total: 2, adults: 2, children: 0, seniors: 0, type: 'couple' },
        travelStyle: 'balanced',
        budget: { level: 'comfortable', estimatedMin: 35000, estimatedMax: 50000 },
        accommodation: { types: ['hotel'], comfort: 'comfortable' },
        transportation: { preferredModes: ['private-cab'], comfort: 'balanced' },
        travelTiming: { season: 'Autumn', start: '2026-10-15', end: '2026-10-20' }
      };

      const itinerary = generateFallbackItinerary(tripContext);
      const lachungDay = itinerary.days.find(d => d.baseLocation.toLowerCase() === 'lachung');

      expect(lachungDay).toBeDefined();
      expect(lachungDay.notes.some(n => n.includes('Inner Line Permit') || n.includes('ILP'))).toBe(true);
      expect(lachungDay.notes.some(n => n.includes('altitude'))).toBe(true);
    });

    it('adds feasibility advisory note if user chooses North Sikkim for under 4 days', () => {
      const tripContext = {
        duration: 3,
        interests: ['snow'],
        destinations: [
          { name: 'Lachung', slug: 'lachung', region: 'North Sikkim', overnight: true, highlights: ['Yumthang'] }
        ],
        travelers: { total: 2, adults: 2, children: 0, seniors: 0 },
        travelStyle: 'balanced',
        budget: { level: 'comfortable', estimatedMin: 20000, estimatedMax: 30000 },
        accommodation: { types: ['hotel'] },
        transportation: { preferredModes: ['private-cab'] },
        travelTiming: { season: 'Winter' }
      };

      const itinerary = generateFallbackItinerary(tripContext);
      const advisory = itinerary.importantNotes.find(n => n.includes('Feasibility Advisory'));

      expect(advisory).toBeDefined();
      expect(advisory).toContain('requires at least 4 trip days');
    });
  });

  // ─── SCENARIO 5: Budget modification ───
  describe('Scenario 5: Budget modification', () => {
    it('recalculates budget accurately when switching from budget to luxury', () => {
      const budgetBase = estimateTripBudget({
        duration: 5,
        travelers: { adults: 2, children: 0, seniors: 0 },
        destinations: ['gangtok', 'lachung'],
        travelStyle: 'balanced',
        budgetLevel: 'budget',
        transportModes: ['shared-sumo'],
        accommodationTypes: ['homestay']
      });

      const luxuryBase = estimateTripBudget({
        duration: 5,
        travelers: { adults: 2, children: 0, seniors: 0 },
        destinations: ['gangtok', 'lachung'],
        travelStyle: 'balanced',
        budgetLevel: 'luxury',
        transportModes: ['premium-private'],
        accommodationTypes: ['resort']
      });

      expect(luxuryBase.estimatedRange.min).toBeGreaterThan(budgetBase.estimatedRange.max);
      expect(budgetBase.assumptions.some(a => a.includes('Shared Sumo') || a.includes('homestay'))).toBe(true);
      expect(luxuryBase.assumptions.some(a => a.includes('Innova') || a.includes('resort'))).toBe(true);
    });

    it('analyzes budget match status accurately', () => {
      const matchRes = analyzeBudgetMatch({
        targetMin: 35000,
        targetMax: 45000,
        estimatedRange: { min: 30000, max: 50000 }
      });
      expect(matchRes.status).toBe('match');

      const lowRes = analyzeBudgetMatch({
        targetMin: 10000,
        targetMax: 15000,
        estimatedRange: { min: 30000, max: 50000 }
      });
      expect(lowRes.status).toBe('low');
    });
  });

  // ─── SCENARIO 6: Changing destinations after generation ───
  describe('Scenario 6: Changing destinations after itinerary generation', () => {
    it('detects route spread warning when North and West Sikkim are combined on 5-day trip', () => {
      const val = validateDestinationCombination({
        selectedSlugs: ['gangtok', 'lachung', 'pelling'],
        duration: 5
      });

      expect(val.isValid).toBe(false);
      expect(val.warnings.some(w => w.includes('Wide geographical spread'))).toBe(true);
    });

    it('optimizes conflicting route to a unified loop', () => {
      const opt = optimizeDestinationRoute({
        selectedSlugs: ['gangtok', 'lachung', 'pelling'],
        duration: 5
      });

      expect(opt.optimizedSlugs).toContain('gangtok');
      // Should remove pelling to eliminate 7+ hours of backtracking
      expect(opt.optimizedSlugs).not.toContain('pelling');
      expect(opt.reason).toContain('North Sikkim loop');
    });
  });

  // ─── SCENARIO 7: Regenerating and refining itinerary ───
  describe('Scenario 7: Regenerating and refining itinerary', () => {
    it('applies quick chip refinement without error when instruction text is empty', () => {
      const parsed = parseRefinementIntent({
        instruction: '',
        mode: 'more_relaxed'
      });

      expect(parsed.intent).toBe('change_trip_pace');
      expect(parsed.changes.pace).toBe('relaxed');
    });

    it('removes activities from DayEditModal via applyItineraryPatch', () => {
      const mockItinerary = {
        days: [
          {
            dayNumber: 2,
            title: 'Gangtok Sightseeing',
            baseLocation: 'Gangtok',
            morning: [{ title: 'Rumtek Monastery' }, { title: 'Banjhakri Falls' }],
            afternoon: [{ title: 'Do Drul Chorten' }],
            evening: [{ title: 'MG Marg Walk' }]
          }
        ]
      };

      const updated = applyItineraryPatch(mockItinerary, {
        operation: 'update_day_pace',
        targetDay: 2,
        changes: {
          removedMorning: [1] // remove Banjhakri Falls
        }
      });

      expect(updated.days[0].morning).toHaveLength(1);
      expect(updated.days[0].morning[0].title).toBe('Rumtek Monastery');
    });

    it('backend POST /api/refine-itinerary accepts chip-based requestInput without instruction', async () => {
      const res = await request(app)
        .post('/api/refine-itinerary')
        .send({
          tripContext: {
            duration: 5,
            destinations: ['gangtok', 'lachung']
          },
          existingItinerary: {
            days: [
              { dayNumber: 1, baseLocation: 'Gangtok', title: 'Arrival' },
              { dayNumber: 2, baseLocation: 'Gangtok', title: 'Sightseeing' },
              { dayNumber: 3, baseLocation: 'Lachung', title: 'Transfer' },
              { dayNumber: 4, baseLocation: 'Lachung', title: 'Yumthang' },
              { dayNumber: 5, baseLocation: 'Gangtok', title: 'Departure' }
            ]
          },
          requestInput: {
            instruction: '',
            mode: 'more_relaxed'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.itinerary).toBeDefined();
    });
  });

  // ─── SCENARIO 8: Invalid inputs & error recovery ───
  describe('Scenario 8: Invalid inputs & error recovery', () => {
    it('backend rejects invalid generate-itinerary request with missing tripContext', async () => {
      const res = await request(app)
        .post('/api/generate-itinerary')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('recovers with fallback when external Gemini AI is unreachable', async () => {
      const res = await request(app)
        .post('/api/generate-itinerary')
        .send({
          tripContext: {
            duration: 5,
            destinations: ['gangtok']
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.source).toBe('fallback');
      expect(res.body.itinerary.days).toHaveLength(5);
    });
  });

  // ─── SCENARIO 9: Saving and retrieving trip plans ───
  describe('Scenario 9: Saving and retrieving trip plans', () => {
    it('creates persistent journey with request ID and token hash', async () => {
      const journey = createCustomerJourney({
        plannerState: {
          duration: 5,
          destinations: { selected: ['gangtok', 'lachung'] }
        },
        travelerInfo: { fullName: 'Pema Wangchuk', email: 'pema@example.com' }
      });

      expect(journey.success).toBe(true);
      expect(journey.requestId).toMatch(/^ST-REQ-\d{8}-\d{4}$/);
      expect(journey.accessToken).toBeDefined();
      expect(journey.accessUrl).toContain(journey.accessToken);
    });

    it('retrieves customer-safe journey via tracking token endpoint', async () => {
      const mockJourney = {
        id: 'test-scenario-j1',
        requestId: 'ST-REQ-20261119-7777',
        status: 'RECEIVED',
        priority: 'NORMAL',
        createdAt: new Date(),
        updatedAt: new Date(),
        traveler: { firstName: 'Tashi' },
        trip: { duration: 5, destinations: [] },
        itinerary: { days: [] }
      };

      vi.spyOn(prisma.customerJourney, 'findUnique')
        .mockResolvedValueOnce({ id: 'test-scenario-j1', requestId: 'ST-REQ-20261119-7777' })
        .mockResolvedValueOnce(mockJourney);

      const res = await request(app)
        .get('/api/customer/booking/ST-REQ-20261119-7777')
        .set('Accept', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.requestId).toBe('ST-REQ-20261119-7777');
      expect(res.body.status).toBe('RECEIVED');
    });
  });

  // ─── SCENARIO 10: Viewing and exporting the itinerary ───
  describe('Scenario 10: Viewing and exporting the itinerary', () => {
    it('generates valid RFC 5545 iCalendar (.ics) string', () => {
      const mockItinerary = {
        tripTitle: '5-Day Sikkim Himalayan Circuit',
        days: [
          { dayNumber: 1, baseLocation: 'Gangtok', title: 'Arrival in Gangtok' },
          { dayNumber: 2, baseLocation: 'Gangtok', title: 'Tsomgo Lake Excursion' }
        ]
      };

      const ics = generateItineraryIcs(mockItinerary, { startDate: '2026-10-15' });

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('SUMMARY:Day 1: Arrival in Gangtok');
      expect(ics).toContain('DTSTART;VALUE=DATE:20261015');
      expect(ics).toContain('LOCATION:Gangtok');
    });

    it('escapes special characters in calendar export', () => {
      const escaped = escapeIcsText('Gangtok, Sikkim; high-altitude, cold & clear\nPack warm!');
      expect(escaped).toBe('Gangtok\\, Sikkim\\; high-altitude\\, cold & clear\\nPack warm!');
    });
  });

});
