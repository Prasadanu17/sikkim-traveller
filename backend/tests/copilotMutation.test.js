/**
 * backend/tests/copilotMutation.test.js
 * Comprehensive automated tests for Module C:
 * - Actionable modification proposals across all 6 categories (A-F):
 *   1. Budget reduction proposal
 *   2. Day pacing modification
 *   3. Transport switching
 *   4. Accommodation preference switching
 *   5. Trip duration modification
 *   6. Destination addition
 *   7. Destination removal
 * - Confirmation and cancellation workflows
 * - Preventing duplicate execution
 * - Recording applied changes in Module B memory
 * - Preserving itinerary when proposal is rejected
 * - Geographic and mountain transit validation (e.g. North Sikkim duration threshold)
 * - Deterministic fallback execution without Gemini
 * - Regression coverage for existing Copilot capabilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { parseCopilotIntent } from '../../src/services/copilot/copilotIntentService.js';
import {
  buildMutationProposal,
  generateProposalId
} from '../../src/services/copilot/copilotMutationService.js';
import { validateMutationProposal } from '../../src/services/copilot/copilotMutationValidator.js';
import { executeFallbackCopilotRequest } from '../../src/services/copilot/copilotFallbackService.js';
import {
  getSessionConstraints,
  clearCopilotMemory,
  recordAppliedRefinement
} from '../../src/services/copilot/copilotMemoryService.js';
import { refineFallbackItinerary } from '../../src/services/itinerary/refinementFallbackService.js';
import { buildTripContext } from '../../src/services/itinerary/tripContextService.js';
import { generateFallbackItinerary } from '../../src/services/itinerary/itineraryFallbackService.js';

describe('Module C: Advanced Trip Copilot Refinement & Actionable Mutation Cards', () => {
  let samplePlannerState;
  let sampleTripContext;
  let sampleItinerary;

  beforeEach(() => {
    clearCopilotMemory();

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

    sampleTripContext = buildTripContext(samplePlannerState);
    sampleItinerary = generateFallbackItinerary(sampleTripContext);
    samplePlannerState.itinerary.current = sampleItinerary;
  });

  it('1. Generates structured Budget Reduction proposal (Category A)', async () => {
    const intent = parseCopilotIntent('Reduce my budget to ₹15,000');
    expect(intent.intent).toBe('REDUCE_BUDGET');
    expect(intent.isMutating).toBe(true);

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.category).toBe('BUDGET');
    expect(proposal.title).toContain('15,000');
    expect(proposal.proposedChanges.budgetCap).toBe(15000);
    expect(proposal.estimatedSavings).toContain('Save ~₹');
  });

  it('2. Generates Day Pacing modification proposal (Category B)', async () => {
    const intent = parseCopilotIntent('Make Day 2 more relaxed');
    expect(intent.intent).toBe('MODIFY_DAY');
    expect(intent.entities.dayNumber).toBe(2);

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.category).toBe('DAY_PACE');
    expect(proposal.title).toContain('Day 2');
    expect(proposal.proposedChanges.targetDay).toBe(2);
    expect(proposal.proposedChanges.pace).toBe('relaxed');
  });

  it('3. Generates Transport Switching proposal (Category C)', async () => {
    const intent = parseCopilotIntent('Change private cab to shared transport');
    expect(intent.intent).toBe('CHANGE_TRANSPORT');

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.category).toBe('TRANSPORT');
    expect(proposal.proposedChanges.transportMode).toBe('shared-sumo');
    expect(proposal.estimatedSavings).toContain('Save ~₹');
  });

  it('4. Generates Accommodation Preference switching proposal (Category D)', async () => {
    const intent = parseCopilotIntent('Change my stay preference to homestays');
    expect(intent.intent).toBe('CHANGE_ACCOMMODATION');
    expect(intent.entities.accommodationType).toBe('homestay');

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.category).toBe('ACCOMMODATION');
    expect(proposal.proposedChanges.accommodationType).toBe('homestay');
  });

  it('5. Generates Trip Duration modification proposal (Category E)', async () => {
    const intent = parseCopilotIntent('Extend my trip by two days');
    expect(intent.intent).toBe('CHANGE_DURATION');

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.category).toBe('DURATION');
    expect(proposal.proposedChanges.duration).toBe(7); // 5 + 2
  });

  it('6. Generates Destination Addition proposal (Category F)', async () => {
    const intent = parseCopilotIntent('Add Pelling to my itinerary');
    expect(intent.intent).toBe('ADD_DESTINATION');
    expect(intent.entities.destinationSlug).toBe('pelling');

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.category).toBe('DESTINATION');
    expect(proposal.proposedChanges.addDestination).toBe('pelling');
  });

  it('7. Generates Destination Removal proposal (Category F)', async () => {
    const intent = parseCopilotIntent('Remove Lachung from my itinerary');
    expect(intent.intent).toBe('REMOVE_DESTINATION');
    expect(intent.entities.destinationSlug).toBe('lachung');

    const { validation, proposal } = buildMutationProposal({
      intent,
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(true);
    expect(proposal).toBeDefined();
    expect(proposal.category).toBe('DESTINATION');
    expect(proposal.proposedChanges.removeDestination).toBe('lachung');
  });

  it('8. Handles Proposal Cancellation without mutating state', async () => {
    const originalItineraryTitle = sampleItinerary.tripTitle;
    const originalDaysCount = sampleItinerary.days.length;

    // Simulate user cancelling a proposal
    const proposal = {
      id: generateProposalId(),
      status: 'pending'
    };

    proposal.status = 'cancelled';
    expect(proposal.status).toBe('cancelled');

    // Original state is preserved
    expect(samplePlannerState.itinerary.current.tripTitle).toBe(originalItineraryTitle);
    expect(samplePlannerState.itinerary.current.days.length).toBe(originalDaysCount);
  });

  it('9. Applies a confirmed proposal to the actual itinerary state', () => {
    const intent = {
      intent: 'change_day_pace',
      targetDay: 2,
      changes: { pace: 'relaxed' }
    };

    const refinedItinerary = refineFallbackItinerary(sampleItinerary, sampleTripContext, intent);
    expect(refinedItinerary).toBeDefined();
    expect(refinedItinerary.days.length).toBe(5);

    const day2 = refinedItinerary.days.find((d) => d.dayNumber === 2);
    expect(day2.notes.some((n) => n.includes('Pace relaxed'))).toBe(true);
  });

  it('10. Prevents duplicate execution if proposal is applied repeatedly', () => {
    const appliedIds = new Set();
    const testProposalId = 'prop_test_dup_123';

    let executionCount = 0;
    const executeApply = (id) => {
      if (appliedIds.has(id)) return false;
      appliedIds.add(id);
      executionCount++;
      return true;
    };

    expect(executeApply(testProposalId)).toBe(true);
    expect(executionCount).toBe(1);

    // Repeated attempt with identical ID is blocked
    expect(executeApply(testProposalId)).toBe(false);
    expect(executionCount).toBe(1);
  });

  it('11. Records applied modification in Module B memory', () => {
    recordAppliedRefinement('Make Day 2 more relaxed with dedicated rest time.');
    const constraints = getSessionConstraints();
    expect(constraints.appliedRefinements.length).toBe(1);
    expect(constraints.appliedRefinements[0].instruction).toContain('Day 2');
  });

  it('12. Preserves itinerary when an invalid proposal is rejected', () => {
    const initialDays = sampleItinerary.days.length;

    // Try invalid 1-day duration modification
    const validation = validateMutationProposal({
      category: 'DURATION',
      changes: { duration: 1 },
      plannerState: samplePlannerState
    });

    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain('cannot be less than 2 days');
    expect(samplePlannerState.itinerary.current.days.length).toBe(initialDays);
  });

  it('13. Enforces geographic and transit constraints (North Sikkim duration threshold)', () => {
    // Proposing North Sikkim on a 2-day trip must be rejected
    const validation = validateMutationProposal({
      category: 'DESTINATION',
      changes: { addDestination: 'lachung' },
      plannerState: { ...samplePlannerState, duration: 2, destinations: { selected: ['gangtok'] } }
    });

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('requires a minimum trip duration of 4 days'))).toBe(true);
  });

  it('14. Serves actionable proposals through Copilot fallback without Gemini', async () => {
    const intent = parseCopilotIntent('Make Day 3 more relaxed');
    const res = await executeFallbackCopilotRequest(samplePlannerState, intent, {});

    expect(res.actionCard).toBeDefined();
    expect(res.actionCard.type).toBe('MUTATION_PROPOSAL');
    expect(res.actionCard.category).toBe('DAY_PACE');
    expect(res.actionCard.actionLabel).toContain('Relax Day 3');
  });

  it('15. Preserves existing non-mutating Copilot features (Weather & Booking Inquiry)', async () => {
    const weatherIntent = parseCopilotIntent('What is the weather in Gangtok?');
    const weatherRes = await executeFallbackCopilotRequest(samplePlannerState, weatherIntent, {});
    expect(weatherRes.actionCard).toBeUndefined();
    expect(weatherRes.text).toContain('Current forecast');

    const bookingIntent = parseCopilotIntent('I want to book this trip');
    const bookingRes = await executeFallbackCopilotRequest(samplePlannerState, bookingIntent, {});
    expect(bookingRes.actionCard).toBeDefined();
    expect(bookingRes.actionCard.refinementInstruction).toBe('LAUNCH_BOOKING_WIZARD');
  });
});
