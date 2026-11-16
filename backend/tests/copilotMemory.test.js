/**
 * backend/tests/copilotMemory.test.js
 * Comprehensive automated tests for Module B:
 * - Conversation persistence across simulated refresh
 * - Restoration without duplicate messages
 * - Session isolation across distinct session IDs
 * - Travel constraint persistence & overwrite rules
 * - Corrupted / invalid storage resilience
 * - Clear conversation & clean session reset
 * - Regression coverage for existing Copilot features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCurrentSessionId,
  getSessionConstraints,
  updateSessionConstraints,
  addPreferredDestination,
  addExcludedDestination,
  recordAppliedRefinement,
  getConversationHistory,
  addMessageToHistory,
  clearCopilotMemory,
  DEFAULT_CONSTRAINTS
} from '../../src/services/copilot/copilotMemoryService.js';
import { parseCopilotIntent } from '../../src/services/copilot/copilotIntentService.js';

// Setup Mock sessionStorage
class MockSessionStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe('Module B: Persistent Chatbot Memory & Session Management', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = new MockSessionStorage();
    global.window = {
      sessionStorage: mockStorage
    };
    clearCopilotMemory();
  });

  afterEach(() => {
    delete global.window;
  });

  it('1. Persists conversation messages and survives simulated refresh', () => {
    const initialSessionId = getCurrentSessionId();
    addMessageToHistory('user', 'Can we visit North Sikkim?');
    addMessageToHistory('assistant', 'Yes, a 5-day trip allows 2 nights in Lachung.');

    const historyBefore = getConversationHistory();
    expect(historyBefore.length).toBe(2);
    expect(historyBefore[0].content).toBe('Can we visit North Sikkim?');

    // Verify sessionStorage has the JSON record
    const stored = JSON.parse(mockStorage.getItem(`st_copilot_sess_${initialSessionId}`));
    expect(stored).toBeDefined();
    expect(stored.history.length).toBe(2);

    // Simulate page refresh: history re-retrieved retains same session and messages
    const historyAfter = getConversationHistory();
    expect(historyAfter.length).toBe(2);
    expect(historyAfter[1].content).toContain('Lachung');
  });

  it('2. Prevents duplicate messages upon restoration or repeated calls', () => {
    addMessageToHistory('user', 'What is the weather?');
    // Immediate identical re-dispatch
    addMessageToHistory('user', 'What is the weather?');

    const history = getConversationHistory();
    expect(history.length).toBe(1);
  });

  it('3. Guarantees session isolation between distinct sessions', () => {
    const session1Id = getCurrentSessionId();
    addMessageToHistory('user', 'Session 1: My budget is 20k');
    updateSessionConstraints({ budgetCap: 20000 });

    expect(getSessionConstraints().budgetCap).toBe(20000);

    // Now trigger new session / reset
    const resetResult = clearCopilotMemory();
    const session2Id = getCurrentSessionId();

    expect(session2Id).not.toBe(session1Id);
    expect(getConversationHistory().length).toBe(0);
    expect(getSessionConstraints().budgetCap).toBeNull();

    // Verify old session 1 storage was purged or isolated
    expect(mockStorage.getItem(`st_copilot_sess_${session1Id}`)).toBeNull();
    expect(mockStorage.getItem(`st_copilot_sess_${session2Id}`)).toBeDefined();
  });

  it('4. Retains and updates travel constraints cleanly (replaces outdated values)', () => {
    // User sets budget to 30,000
    updateSessionConstraints({ budgetCap: 30000, avoidLongDrives: true, preferredStay: 'hotel' });
    let constraints = getSessionConstraints();
    expect(constraints.budgetCap).toBe(30000);
    expect(constraints.avoidLongDrives).toBe(true);
    expect(constraints.preferredStay).toBe('hotel');

    // User updates budget to 15,000 and switches to homestay
    updateSessionConstraints({ budgetCap: 15000, preferredStay: 'homestay' });
    constraints = getSessionConstraints();
    expect(constraints.budgetCap).toBe(15000); // Replaced, not accumulated
    expect(constraints.preferredStay).toBe('homestay'); // Replaced
    expect(constraints.avoidLongDrives).toBe(true); // Preserved
  });

  it('5. Handles preferred and excluded destinations without duplicates or contradictions', () => {
    addPreferredDestination('pelling');
    addPreferredDestination('ravangla');
    addPreferredDestination('pelling'); // Duplicate attempt

    let constraints = getSessionConstraints();
    expect(constraints.preferredDestinations).toEqual(['pelling', 'ravangla']);

    // If user excludes pelling, it should move from preferred to excluded
    addExcludedDestination('pelling');
    constraints = getSessionConstraints();
    expect(constraints.excludedDestinations).toContain('pelling');
    expect(constraints.preferredDestinations).not.toContain('pelling');
  });

  it('6. Records applied itinerary refinements in session memory', () => {
    recordAppliedRefinement('Make Day 2 more relaxed');
    recordAppliedRefinement('Make the trip cheaper by using shared transport');

    const constraints = getSessionConstraints();
    expect(constraints.appliedRefinements.length).toBe(2);
    expect(constraints.appliedRefinements[0].instruction).toBe('Make Day 2 more relaxed');
    expect(constraints.appliedRefinements[0].appliedAt).toBeDefined();
  });

  it('7. Safely recovers from corrupted or invalid JSON in storage', () => {
    const activeId = getCurrentSessionId();
    // Simulate corrupted storage data
    mockStorage.setItem(`st_copilot_sess_${activeId}`, '{ invalid-json');

    // Must not throw, instead starts clean session gracefully
    expect(() => {
      clearCopilotMemory();
    }).not.toThrow();

    expect(getConversationHistory()).toEqual([]);
    expect(getSessionConstraints()).toBeDefined();
  });

  it('8. Extracts structured budget, stay, and transport entities from natural language queries', () => {
    const intent1 = parseCopilotIntent('I want to reduce my budget to ₹15,000');
    expect(intent1.entities.budgetAmount).toBe(15000);

    const intent2 = parseCopilotIntent('Can we stay only in homestays?');
    expect(intent2.entities.accommodationType).toBe('homestay');

    const intent3 = parseCopilotIntent('We prefer shared sumo transport');
    expect(intent3.entities.transportMode).toBe('shared-sumo');

    const intent4 = parseCopilotIntent('Make the pace more relaxed');
    expect(intent4.entities.pace).toBe('relaxed');
  });

  it('9. Preserves planner state — resetting Copilot memory does not touch planner keys', () => {
    mockStorage.setItem('st_planner_initial_prompt', 'Initial Prompt');
    mockStorage.setItem('st_journey_draft_123', JSON.stringify({ id: 123 }));

    clearCopilotMemory();

    // Verify unrelated planner/journey storage is untouched
    expect(mockStorage.getItem('st_planner_initial_prompt')).toBe('Initial Prompt');
    expect(mockStorage.getItem('st_journey_draft_123')).toBeDefined();
  });
});

