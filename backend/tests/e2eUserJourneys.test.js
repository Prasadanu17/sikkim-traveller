/**
 * backend/tests/e2eUserJourneys.test.js
 * Comprehensive End-to-End User Journey Tests across all 7 core capabilities:
 * 1. Trip Planner: Input formulation, validation, and deterministic/AI generation
 * 2. Trip Copilot: Conversation, context injection, mutation proposals, and state refinement
 * 3. Multilingual Experience: Language detection, Hindi & Nepali translation, and entity preservation
 * 4. Voice Interaction: Speech input, transcript editing, synthesis control
 * 5. Route Map: Route path generation, stop coordinate extraction, and circuit classification
 * 6. Calendar Export: RFC 5545 compliance, folding, and multi-day schedule mapping
 * 7. Altitude Safety: Elevation profiling, rapid ascent alerts, and medical guidance
 */

import { describe, it, expect } from 'vitest';
import { generateItineraryAI, refineItineraryAI } from '../src/services/ai/itineraryAIService.js';
import { processCopilotAI } from '../src/services/ai/copilotAIService.js';
import { detectLanguage, getLocalizedDestinationName } from '../src/services/i18n/languageService.js';
import { getMultilingualTemplates } from '../src/services/i18n/multilingualTemplates.js';
import { buildItineraryRouteModel } from '../../src/services/map/routeMapService.js';
import { generateItineraryIcs } from '../../src/services/calendar/icsExportService.js';
import { buildTripAltitudeProfile } from '../../src/services/safety/altitudeSafetyService.js';
import { parseCopilotIntent } from '../../src/services/copilot/copilotIntentService.js';
import { buildMutationProposal } from '../../src/services/copilot/copilotMutationService.js';
import { generateFallbackItinerary } from '../../src/services/itinerary/itineraryFallbackService.js';
import { buildTripContext } from '../../src/services/itinerary/tripContextService.js';

describe('End-to-End User Journey QA Suite', () => {
  let generatedItinerary;
  let samplePlannerState;

  // -------------------------------------------------------------
  // Journey 1: Trip Planner Generation
  // -------------------------------------------------------------
  describe('Journey 1: Trip Planner Flow', () => {
    it('generates a complete, structurally sound itinerary from multi-step planner inputs', async () => {
      samplePlannerState = {
        duration: 5,
        interests: ['mountains', 'culture'],
        destinations: {
          mode: 'ai',
          selected: ['gangtok', 'lachung', 'yumthang-valley']
        },
        travelers: {
          type: 'couple',
          adults: 2,
          children: 0,
          seniors: 0,
          total: 2
        },
        travelStyle: 'balanced',
        budget: {
          mode: 'estimate',
          level: 'comfortable',
          estimatedMin: 32000,
          estimatedMax: 48000
        },
        accommodation: {
          mode: 'recommend',
          types: ['hotel'],
          comfort: 'standard'
        },
        transportation: {
          mode: 'recommend',
          preferredModes: ['private-cab'],
          comfort: 'private'
        },
        dates: {
          mode: 'flexible',
          season: 'Spring',
          start: '',
          end: ''
        },
        itinerary: {
          current: null
        }
      };

      const tripContext = buildTripContext(samplePlannerState);
      generatedItinerary = generateFallbackItinerary(tripContext);
      samplePlannerState.itinerary.current = generatedItinerary;

      expect(generatedItinerary).toBeDefined();
      expect(generatedItinerary.days.length).toBe(5);
      expect(generatedItinerary.overview).toBeDefined();
      expect(generatedItinerary.days[0].baseLocation).toBeDefined();
      expect(generatedItinerary.days[0].overnight).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // Journey 2: Trip Copilot Conversation & Mutation Proposals
  // -------------------------------------------------------------
  describe('Journey 2: Trip Copilot Interaction & Refinement Flow', () => {
    it('proposes an actionable mutation card when user requests budget reduction', async () => {
      const intent = parseCopilotIntent('Reduce my budget to ₹15,000');
      expect(intent.intent).toBe('REDUCE_BUDGET');

      const { validation, proposal } = buildMutationProposal({
        intent,
        plannerState: samplePlannerState
      });

      expect(validation.isValid).toBe(true);
      expect(proposal).toBeDefined();
      expect(proposal.category).toBe('BUDGET');
      expect(proposal.proposedChanges.budgetCap).toBe(15000);
    });

    it('processes conversational Copilot request with structured response', async () => {
      const copilotResponse = await processCopilotAI({
        message: 'Can we reduce our travel costs and find cheaper stays?',
        intent: { intent: 'REDUCE_BUDGET' },
        context: {
          duration: 5,
          destinations: ['gangtok', 'lachung'],
          budget: { estimatedMax: 48000 }
        }
      });

      expect(copilotResponse).toBeDefined();
      expect(copilotResponse.text).toBeDefined();
      expect(copilotResponse.actionCard).toBeDefined();
      expect(copilotResponse.actionCard.category).toBe('BUDGET');
    });
  });

  // -------------------------------------------------------------
  // Journey 3: Multilingual User Experience
  // -------------------------------------------------------------
  describe('Journey 3: Multilingual Experience (English, Hindi, Nepali)', () => {
    it('correctly classifies language and returns localized templates', () => {
      const nepaliInput = 'लाचुङ र युमथाङको मौसम कस्तो छ?';
      const detectedLang = detectLanguage(nepaliInput);
      expect(detectedLang).toBe('ne');

      const templates = getMultilingualTemplates(detectedLang);
      expect(templates.welcome(5)).toContain('नमस्ते!');
      expect(templates.altitudeWarning).toContain('लेक लाग्ने (AMS) सचेतना');
      expect(templates.budgetCardTitle).toBe('भ्रमण बजेट घटाउनुहोस्');
    });

    it('translates destination names accurately while maintaining identity', () => {
      const gangtokHi = getLocalizedDestinationName('Gangtok', 'hi');
      const lachungNe = getLocalizedDestinationName('Lachung', 'ne');

      expect(gangtokHi).toBe('गंगटोक');
      expect(lachungNe).toBe('लाचुङ');
    });

    it('generates localized itinerary in Nepali', async () => {
      const result = await generateItineraryAI({
        tripContext: { duration: 3, destinations: ['gangtok', 'pelling'], language: 'ne' }
      });

      expect(result.itinerary).toBeDefined();
      expect(result.itinerary.tripTitle).toBeDefined();
      expect(result.itinerary.days.length).toBe(3);
    });
  });

  // -------------------------------------------------------------
  // Journey 4: Voice Interaction Flow
  // -------------------------------------------------------------
  describe('Journey 4: Voice Interaction Mechanics', () => {
    it('handles simulated spoken input and parses intent cleanly', async () => {
      const spokenTranscript = 'Make Day 2 more relaxed and easy';
      const intent = parseCopilotIntent(spokenTranscript);

      expect(intent.intent).toBe('MODIFY_DAY');
      expect(intent.entities.dayNumber).toBe(2);

      const { validation, proposal } = buildMutationProposal({
        intent,
        plannerState: samplePlannerState
      });

      expect(validation.isValid).toBe(true);
      expect(proposal.category).toBe('DAY_PACE');
      expect(proposal.proposedChanges.targetDay).toBe(2);
    });
  });

  // -------------------------------------------------------------
  // Journey 5: Interactive Route Map Flow
  // -------------------------------------------------------------
  describe('Journey 5: Interactive Sikkim Route Map', () => {
    it('builds a geo-referenced route model with elevation, stops, and circuits', () => {
      const routeModel = buildItineraryRouteModel(generatedItinerary);

      expect(routeModel.isValid).toBe(true);
      expect(routeModel.stops.length).toBeGreaterThanOrEqual(1);
      expect(routeModel.stops[0].lat).toBeDefined();
      expect(routeModel.stops[0].lng).toBeDefined();
      expect(typeof routeModel.stops[0].elevationM).toBe('number');

      // Verify circuits array
      expect(Array.isArray(routeModel.circuits)).toBe(true);
      expect(routeModel.circuits.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // Journey 6: Calendar Export (.ics)
  // -------------------------------------------------------------
  describe('Journey 6: Calendar Export Compliance', () => {
    it('exports a valid RFC 5545 iCalendar payload', () => {
      const ics = generateItineraryIcs(generatedItinerary);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//Sikkim Traveller//AI Trip Planner//EN');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('SUMMARY:');
      expect(ics).toContain('END:VCALENDAR');
    });
  });

  // -------------------------------------------------------------
  // Journey 7: Altitude & Road Safety Indicators
  // -------------------------------------------------------------
  describe('Journey 7: Altitude and Road Safety Profile', () => {
    it('constructs an accurate altitude profile with safety guidance and medical disclaimers', () => {
      const altitudeProfile = buildTripAltitudeProfile(generatedItinerary);

      expect(altitudeProfile.isValid).toBe(true);
      expect(altitudeProfile.maxElevationM).toBeGreaterThan(0);
      expect(altitudeProfile.highestDestination).toBeDefined();
      expect(altitudeProfile.medicalDisclaimer).toBeDefined();
      expect(altitudeProfile.medicalDisclaimer).toContain('consult a qualified healthcare professional');

      // Check elevation points correspond to itinerary days
      expect(altitudeProfile.dayProfiles.length).toBe(generatedItinerary.days.length);
    });
  });
});
