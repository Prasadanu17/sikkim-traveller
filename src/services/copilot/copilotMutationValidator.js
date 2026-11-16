/**
 * src/services/copilot/copilotMutationValidator.js
 * Geographic and Safety Validator for Itinerary Modifications.
 * Enforces Sikkim mountain transit rules, altitude safety, and feasibility bounds.
 */

import { validateDestinationCombination } from "../travelIntelligence/destinationRecommendationService";
import { destinations as allDests } from "../../data/destinations";

export function validateMutationProposal({ category, changes, plannerState }) {
  const warnings = [];
  const errors = [];

  const currentDuration = plannerState.duration || 5;
  const currentDestinations = plannerState.destinations?.selected || ["gangtok"];
  const currentBudget = plannerState.budget?.estimatedMin || 30000;

  // 1. DURATION VALIDATION
  if (category === "DURATION" || changes.duration) {
    const targetDuration = Number(changes.duration);
    if (isNaN(targetDuration) || targetDuration < 2) {
      errors.push("Trip duration cannot be less than 2 days for Sikkim.");
    } else if (targetDuration > 14) {
      errors.push("Maximum supported trip duration is 14 days.");
    }

    // Check if North Sikkim is in route and new duration is < 4 days
    const hasNorth = currentDestinations.some(
      (slug) => slug.includes("lachung") || slug.includes("lachen") || slug.includes("yumthang")
    );
    if (hasNorth && targetDuration < 4) {
      errors.push(
        `North Sikkim circuit requires at least 4 trip days (current proposed: ${targetDuration} days). Please remove North Sikkim or keep duration at 4+ days.`
      );
    }
  }

  // 2. DESTINATION MANAGEMENT VALIDATION
  if (category === "DESTINATION") {
    if (changes.addDestination) {
      const destSlug = changes.addDestination.toLowerCase();
      const found = allDests.find((d) => d.slug === destSlug || d.name.toLowerCase() === destSlug);

      if (!found) {
        errors.push(`Destination "${changes.addDestination}" is not a recognized Sikkim destination.`);
      } else {
        if (currentDestinations.includes(destSlug)) {
          errors.push(`${found.name} is already part of your itinerary route.`);
        }

        // Check North Sikkim threshold
        if ((destSlug.includes("lachung") || destSlug.includes("lachen") || destSlug.includes("yumthang")) && currentDuration < 4) {
          errors.push(
            `Adding ${found.name} requires a minimum trip duration of 4 days due to mountain transit and acclimatization. (Current trip is ${currentDuration} days).`
          );
        }

        // Check geographical scatter
        const testDests = [...currentDestinations.filter(d => d !== destSlug), destSlug];
        const combCheck = validateDestinationCombination({
          selectedSlugs: testDests,
          duration: currentDuration
        });
        if (combCheck.warnings && combCheck.warnings.length > 0) {
          warnings.push(...combCheck.warnings);
        }
      }
    }

    if (changes.removeDestination) {
      const destSlug = changes.removeDestination.toLowerCase();
      if (!currentDestinations.includes(destSlug)) {
        warnings.push(`Destination "${changes.removeDestination}" is not currently in your itinerary.`);
      } else if (currentDestinations.length <= 1) {
        errors.push("An itinerary must retain at least one base destination (such as Gangtok).");
      }
    }
  }

  // 3. BUDGET VALIDATION
  if (category === "BUDGET" || changes.budgetCap) {
    if (changes.budgetCap && changes.budgetCap < 6000) {
      errors.push("Proposed budget (₹" + Number(changes.budgetCap).toLocaleString("en-IN") + ") is below the minimum operational cost for Sikkim stays and mountain transit.");
    }
  }

  // 4. DAY PACING VALIDATION
  if (category === "DAY_PACE" || changes.targetDay) {
    const targetDay = Number(changes.targetDay);
    if (targetDay && (targetDay < 1 || targetDay > currentDuration)) {
      errors.push(`Target Day ${targetDay} is outside your ${currentDuration}-day trip schedule.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
