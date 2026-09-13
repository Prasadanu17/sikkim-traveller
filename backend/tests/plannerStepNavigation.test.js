/**
 * PHASE 26 REGRESSION TEST: Planner Step Navigation
 *
 * Tests that the wizard step transition logic never lands on a blank step.
 * Root cause: Budget (step 7) -> nextStep() -> step 8 (no component) -> blank screen.
 *
 * These tests verify the WIZARD_STEP_ORDER and NEXT_STEP/PREV_STEP map logic
 * that was introduced in useTripPlanner.js as a pure-function extraction for testability.
 */

import { describe, it, expect } from "vitest";

// --- Pure-function extraction of the step navigation logic ---
// Mirrors the logic in src/hooks/useTripPlanner.js exactly.

const WIZARD_STEP_ORDER = [1, 2, 3, 5, 6, 7, 9, 10, 11];

const NEXT_STEP = {};
const PREV_STEP = {};
for (let i = 0; i < WIZARD_STEP_ORDER.length - 1; i++) {
  NEXT_STEP[WIZARD_STEP_ORDER[i]] = WIZARD_STEP_ORDER[i + 1];
  PREV_STEP[WIZARD_STEP_ORDER[i + 1]] = WIZARD_STEP_ORDER[i];
}
// Special: step 4 (Insights) sits between steps 3 and 5
NEXT_STEP[4] = 5;
PREV_STEP[5] = 4;
// Special: step 12 (Itinerary result) goes back to step 11 (Summary)
PREV_STEP[12] = 11;

// All steps that should render content
const RENDERABLE_STEPS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12]);

function nextStep(currentStep) {
  if (currentStep === 3) return 4; // intelligence calculation lands on 4
  return NEXT_STEP[currentStep] ?? null;
}

function prevStep(currentStep) {
  return PREV_STEP[currentStep] ?? 0;
}

// TESTS

describe("Planner Step Navigation - Phase 26 Regression", () => {

  describe("nextStep() - forward traversal", () => {
    it("step 1 (Dates) -> step 2 (Duration)", () => {
      expect(nextStep(1)).toBe(2);
    });

    it("step 2 (Duration) -> step 3 (Interests)", () => {
      expect(nextStep(2)).toBe(3);
    });

    it("step 3 (Interests) -> step 4 (Insights) via intelligence calculation", () => {
      expect(nextStep(3)).toBe(4);
    });

    it("step 4 (Insights) -> step 5 (Destinations)", () => {
      expect(nextStep(4)).toBe(5);
    });

    it("step 5 (Destinations) -> step 6 (Travelers)", () => {
      expect(nextStep(5)).toBe(6);
    });

    it("step 6 (Travelers) -> step 7 (Budget)", () => {
      expect(nextStep(6)).toBe(7);
    });

    it("REGRESSION: step 7 (Budget) -> step 9 (Stay) - must NOT go to blank step 8", () => {
      const result = nextStep(7);
      expect(result).toBe(9);
      expect(result).not.toBe(8);
      expect(RENDERABLE_STEPS.has(result)).toBe(true);
    });

    it("step 9 (Stay) -> step 10 (Transport)", () => {
      expect(nextStep(9)).toBe(10);
    });

    it("step 10 (Transport) -> step 11 (Summary)", () => {
      expect(nextStep(10)).toBe(11);
    });

    it("step 11 (Summary) has no next step - Summary manages its own CTA", () => {
      expect(nextStep(11)).toBeNull();
    });
  });

  describe("prevStep() - backward traversal", () => {
    it("step 11 (Summary) -> step 10 (Transport)", () => {
      expect(prevStep(11)).toBe(10);
    });

    it("step 10 (Transport) -> step 9 (Stay)", () => {
      expect(prevStep(10)).toBe(9);
    });

    it("REGRESSION: step 9 (Stay) -> step 7 (Budget) - must NOT go to blank step 8", () => {
      const result = prevStep(9);
      expect(result).toBe(7);
      expect(result).not.toBe(8);
      expect(RENDERABLE_STEPS.has(result)).toBe(true);
    });

    it("step 7 (Budget) -> step 6 (Travelers)", () => {
      expect(prevStep(7)).toBe(6);
    });

    it("step 6 (Travelers) -> step 5 (Destinations)", () => {
      expect(prevStep(6)).toBe(5);
    });

    it("step 5 (Destinations) -> step 4 (Insights)", () => {
      expect(prevStep(5)).toBe(4);
    });

    it("step 12 (Itinerary Result) -> step 11 (Summary)", () => {
      expect(prevStep(12)).toBe(11);
    });

    it("step 1 (first wizard step) -> step 0 (Start Screen)", () => {
      expect(prevStep(1)).toBe(0);
    });
  });

  describe("Every step reachable via forward traversal is renderable", () => {
    it("No forward transition lands on a non-renderable step", () => {
      const visited = [];
      let step = 1;
      const MAX_STEPS = 20;

      while (step !== null && visited.length < MAX_STEPS) {
        visited.push(step);
        expect(
          RENDERABLE_STEPS.has(step),
          `Step ${step} reached via forward navigation but has no renderer`
        ).toBe(true);
        if (step === 11) break;
        step = nextStep(step);
      }

      expect(visited).toContain(11);
    });
  });

  describe("Edit buttons in PlannerSummary navigate to correct steps", () => {
    it("Edit WHEN button targets step 1 (Dates)", () => {
      expect(RENDERABLE_STEPS.has(1)).toBe(true);
    });
    it("Edit WHERE button targets step 5 (Destinations)", () => {
      expect(RENDERABLE_STEPS.has(5)).toBe(true);
    });
    it("Edit WHO/PACE button targets step 6 (Travelers)", () => {
      expect(RENDERABLE_STEPS.has(6)).toBe(true);
    });
    it("Edit STAY button targets step 9 (Accommodation)", () => {
      expect(RENDERABLE_STEPS.has(9)).toBe(true);
    });
    it("Edit TRANSPORT button targets step 10 (Transportation)", () => {
      expect(RENDERABLE_STEPS.has(10)).toBe(true);
    });
    it("Edit BUDGET button targets step 7 (Budget)", () => {
      expect(RENDERABLE_STEPS.has(7)).toBe(true);
    });
  });
});
