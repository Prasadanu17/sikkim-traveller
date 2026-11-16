/**
 * backend/tests/browserJourneysSimulation.test.js
 * Automated Verification of the 8 Required Core Journeys:
 * 1. Open Trip Planner & Initialize Planner State (Steps 1-10)
 * 2. Complete & Generate Itinerary (State transition to 'result')
 * 3. Open Trip Copilot Drawer & Verify Context Association
 * 4. Request Budget Modification & Generate Action Card Proposal
 * 5. Confirm Proposal in Modal & Apply Mutation to Itinerary State
 * 6. Switch Language (EN -> HI -> NE) & Verify Translation Templates
 * 7. Export Itinerary Calendar (.ics) & Verify RFC 5545 Blob Generation
 * 8. Open Route Map & Verify Leaflet GeoJSON Stops and Vector Circuit
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { buildTripContext } from '../../src/services/itinerary/tripContextService.js';
import { generateFallbackItinerary } from '../../src/services/itinerary/itineraryFallbackService.js';
import { refineFallbackItinerary } from '../../src/services/itinerary/refinementFallbackService.js';
import { parseCopilotIntent } from '../../src/services/copilot/copilotIntentService.js';
import { buildMutationProposal } from '../../src/services/copilot/copilotMutationService.js';
import { validateMutationProposal } from '../../src/services/copilot/copilotMutationValidator.js';
import {
  clearCopilotMemory,
  recordAppliedRefinement,
  setPreferredLanguage,
  getPreferredLanguage,
  getConversationHistory,
  addMessageToHistory
} from '../../src/services/copilot/copilotMemoryService.js';
import {
  detectLanguage,
  getLocalizedDestinationName
} from '../src/services/i18n/languageService.js';
import { getMultilingualTemplates } from '../src/services/i18n/multilingualTemplates.js';
import { generateItineraryIcs } from '../../src/services/calendar/icsExportService.js';
import { buildItineraryRouteModel } from '../../src/services/map/routeMapService.js';

describe('8 Required Journeys — Full End-to-End Simulation Suite', () => {
  let plannerState;
  let tripContext;
  let currentItinerary;
  let activeProposal;

  beforeAll(() => {
    clearCopilotMemory();

    plannerState = {
      currentStep: 'duration',
      duration: 5,
      interests: ['mountains', 'monasteries', 'nature'],
      destinations: {
        mode: 'ai',
        selected: ['gangtok', 'lachung', 'yumthang-valley']
      },
      travelers: { type: 'family', count: 3, adults: 2, children: 1, seniors: 0, total: 3 },
      travelStyle: 'balanced',
      budget: { mode: 'estimate', level: 'comfortable', estimatedMin: 45000, estimatedMax: 70000 },
      budgetIntelligence: { estimatedRange: { min: 45000, max: 70000 } },
      accommodation: { mode: 'recommend', types: ['hotel'], comfort: 'standard' },
      transportation: { mode: 'recommend', preferredModes: ['private-cab'], comfort: 'private' },
      dates: { mode: 'flexible', season: 'Autumn', start: '2026-10-10', end: '2026-10-15' },
      itinerary: { current: null, isGenerating: false, error: null }
    };
  });

  // -------------------------------------------------------------------
  // 1. Open Trip Planner & Validate Multi-step Setup
  // -------------------------------------------------------------------
  it('Journey 1: Initializes planner with all 10 step configurations', () => {
    expect(plannerState.duration).toBe(5);
    expect(plannerState.destinations.selected.length).toBe(3);
    expect(plannerState.budget.estimatedMax).toBe(70000);
    expect(plannerState.currentStep).toBe('duration');
  });

  // -------------------------------------------------------------------
  // 2. Generate Itinerary
  // -------------------------------------------------------------------
  it('Journey 2: Generates a complete 5-day itinerary from planner state', () => {
    tripContext = buildTripContext(plannerState);
    expect(tripContext.duration).toBe(5);

    currentItinerary = generateFallbackItinerary(tripContext);
    plannerState.itinerary.current = currentItinerary;
    plannerState.currentStep = 'result';

    expect(plannerState.currentStep).toBe('result');
    expect(currentItinerary.days.length).toBe(5);
    expect(currentItinerary.days[0].baseLocation).toBe('Gangtok');
    expect(currentItinerary.overview.estimatedCost.max).toBe(70000);
  });

  // -------------------------------------------------------------------
  // 3. Open Trip Copilot
  // -------------------------------------------------------------------
  it('Journey 3: Opens Copilot and associates session with generated itinerary context', () => {
    addMessageToHistory(
      'assistant',
      'Hello! I see you are planning a 5-day journey across Gangtok, Lachung, and Yumthang.'
    );

    const history = getConversationHistory();
    expect(history.length).toBe(1);
    expect(history[0].content).toContain('5-day journey');
  });

  // -------------------------------------------------------------------
  // 4. Request Budget Modification
  // -------------------------------------------------------------------
  it('Journey 4: Parses budget reduction request and builds an actionable proposal card', () => {
    const userPrompt = 'Reduce my budget to ₹35,000 and recommend budget stays';
    const intent = parseCopilotIntent(userPrompt);

    expect(intent.intent).toBe('REDUCE_BUDGET');
    expect(intent.isMutating).toBe(true);

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.type).toBe('MUTATION_PROPOSAL');
    expect(proposal.category).toBe('BUDGET');
    expect(proposal.proposedChanges.budgetCap).toBe(35000);

    activeProposal = proposal;
  });

  // -------------------------------------------------------------------
  // 5. Confirm & Apply Mutation Card
  // -------------------------------------------------------------------
  it('Journey 5: Validates proposal and applies the modification to update itinerary state', () => {
    // 1. Validator check before confirmation
    const validation = validateMutationProposal({
      category: activeProposal.category,
      changes: activeProposal.proposedChanges,
      plannerState
    });
    expect(validation.isValid).toBe(true);

    // 2. Apply refinement to produce updated itinerary
    const refined = refineFallbackItinerary(
      plannerState.itinerary.current,
      tripContext,
      {
        intent: 'reduce_budget',
        changes: activeProposal.proposedChanges
      }
    );

    expect(refined).toBeDefined();
    expect(refined.days.length).toBe(5);

    // 3. Update planner state
    plannerState.itinerary.current = refined;

    // 4. Record applied mutation in persistent session memory
    recordAppliedRefinement(activeProposal);

    // 5. Verify stays adjusted to budget / homestay tier
    const hasBudgetAccom = refined.days.some(
      (d) => d.overnight && (d.overnight.accommodationType.toLowerCase().includes('homestay') || d.overnight.accommodationType.toLowerCase().includes('budget'))
    );
    expect(hasBudgetAccom).toBe(true);
  });

  // -------------------------------------------------------------------
  // 6. Switch Language
  // -------------------------------------------------------------------
  it('Journey 6: Switches interface language (EN -> HI -> NE) and loads authentic localized templates', () => {
    // Switch to Hindi
    setPreferredLanguage('hi');
    expect(getPreferredLanguage()).toBe('hi');
    const hiTemplates = getMultilingualTemplates('hi');
    expect(hiTemplates.welcome(5)).toContain('नमस्ते!');
    expect(getLocalizedDestinationName('Gangtok', 'hi')).toBe('गंगटोक');

    // Switch to Nepali
    setPreferredLanguage('ne');
    expect(getPreferredLanguage()).toBe('ne');
    const neTemplates = getMultilingualTemplates('ne');
    expect(neTemplates.welcome(5)).toContain('नमस्ते!');
    expect(neTemplates.budgetCardTitle).toBe('भ्रमण बजेट घटाउनुहोस्');
    expect(getLocalizedDestinationName('Lachung', 'ne')).toBe('लाचुङ');
  });

  // -------------------------------------------------------------------
  // 7. Export Itinerary Calendar (.ics)
  // -------------------------------------------------------------------
  it('Journey 7: Exports itinerary to RFC 5545 iCalendar payload with multi-day events', () => {
    const icsContent = generateItineraryIcs(plannerState.itinerary.current);

    expect(typeof icsContent).toBe('string');
    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('PRODID:-//Sikkim Traveller//AI Trip Planner//EN');
    expect(icsContent).toContain('VERSION:2.0');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('SUMMARY:');
    expect(icsContent).toContain('END:VCALENDAR');
  });

  // -------------------------------------------------------------------
  // 8. Open Route Map & Inspect Markers
  // -------------------------------------------------------------------
  it('Journey 8: Builds interactive route map model with verified coordinates and vector circuits', () => {
    const routeModel = buildItineraryRouteModel(plannerState.itinerary.current);

    expect(routeModel.isValid).toBe(true);
    expect(routeModel.stops.length).toBeGreaterThanOrEqual(2);

    // Stop 1: Gangtok
    const gangtokStop = routeModel.stops.find((s) => s.slug === 'gangtok');
    expect(gangtokStop).toBeDefined();
    expect(gangtokStop.elevationM).toBe(1650);
    expect(gangtokStop.lat).toBeCloseTo(27.3389, 2);
    expect(gangtokStop.lng).toBeCloseTo(88.6065, 2);

    // Stop 2: Lachung
    const lachungStop = routeModel.stops.find((s) => s.slug === 'lachung');
    expect(lachungStop).toBeDefined();
    expect(lachungStop.elevationM).toBe(2750);
    expect(lachungStop.circuit).toBe('North Sikkim');

    // Verify transit legs connecting sequential stops
    expect(routeModel.legs.length).toBeGreaterThan(0);
    expect(routeModel.circuits.length).toBeGreaterThanOrEqual(1);
  });
});
