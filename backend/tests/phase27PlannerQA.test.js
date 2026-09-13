import { describe, it, expect } from "vitest";
import {
  getRecommendedDestinations,
  validateDestinationCombination,
  calculateDestinationScore
} from "../../src/services/travelIntelligence/destinationRecommendationService.js";
import { estimateTripBudget } from "../../src/services/travelIntelligence/budgetService.js";

describe("Phase 27 AI Trip Planner QA & Travel Intelligence", () => {
  describe("BUG-04: Scatter Warning Threshold for North + West/South", () => {
    it("should trigger scatter warning for a 6-day trip with North + West destinations", () => {
      const result = validateDestinationCombination({
        selectedSlugs: ["gangtok", "lachung", "pelling"],
        duration: 6
      });
      expect(result.warnings.some((w) => w.includes("Wide geographical spread"))).toBe(true);
      expect(result.score).toBeLessThan(100);
    });

    it("should trigger scatter warning for a 7-day trip with North + West destinations", () => {
      const result = validateDestinationCombination({
        selectedSlugs: ["gangtok", "lachung", "pelling"],
        duration: 7
      });
      expect(result.warnings.some((w) => w.includes("Wide geographical spread"))).toBe(true);
    });

    it("should NOT trigger scatter warning for an 8-day trip with North + West destinations", () => {
      const result = validateDestinationCombination({
        selectedSlugs: ["gangtok", "lachung", "pelling"],
        duration: 8
      });
      expect(result.warnings.some((w) => w.includes("Wide geographical spread"))).toBe(false);
    });
  });

  describe("BUG-05: 3-Day Recommendation Interest Matching", () => {
    it("should include Gangtok and top interest-matched East Sikkim day trips for 3 days", () => {
      const recommendations = getRecommendedDestinations({
        duration: 3,
        interests: ["snow", "mountains"],
        travelIntelligence: { recommendedSeason: "Autumn" }
      });
      const slugs = recommendations.map((d) => d.slug);
      expect(slugs).toContain("gangtok");
      expect(recommendations.length).toBeGreaterThanOrEqual(2);
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });
  });

  describe("BUG-07: West+South Circuit East Day-Trips Constraint", () => {
    it("should NOT append East day-trips to a 6-day West+South circuit", () => {
      const recommendations = getRecommendedDestinations({
        duration: 6,
        interests: ["culture", "relaxation"], // favors West/South
        travelIntelligence: { recommendedSeason: "Autumn" }
      });
      const slugs = recommendations.map((d) => d.slug);
      expect(slugs.some((s) => ["pelling", "ravangla", "namchi"].includes(s))).toBe(true);
      expect(slugs).not.toContain("tsomgo-lake");
    });
  });

  describe("Budget Service Transport & Accommodation Overrides", () => {
    it("should calculate correct budget with explicit shared sumo and homestay options", () => {
      const sharedEstimate = estimateTripBudget({
        duration: 5,
        travelers: { adults: 2, children: 0, seniors: 0 },
        destinations: ["gangtok", "pelling"],
        budgetLevel: "budget",
        accommodationTypes: ["homestay"],
        transportModes: ["shared-sumo"]
      });

      const privateEstimate = estimateTripBudget({
        duration: 5,
        travelers: { adults: 2, children: 0, seniors: 0 },
        destinations: ["gangtok", "pelling"],
        budgetLevel: "comfortable",
        accommodationTypes: ["resort"],
        transportModes: ["private-cab"]
      });

      expect(sharedEstimate.estimatedRange.max).toBeLessThan(privateEstimate.estimatedRange.min);
    });
  });
});
