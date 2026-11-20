/**
 * src/services/copilot/copilotMutationService.js
 * Master Service for Actionable Copilot Mutation Proposals.
 * Generates, validates, and manages execution of structured itinerary modifications.
 */

import { validateMutationProposal } from "./copilotMutationValidator";
import { destinations as allDests } from "../../data/destinations";

/**
 * Generates a unique proposal ID
 */
export function generateProposalId() {
  return `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Builds a structured mutation proposal based on intent and planner state
 */
export function buildMutationProposal({ intent, plannerState }) {
  const { intent: intentType, entities } = intent;
  const currentDuration = plannerState.duration || 5;
  const currentCost = plannerState.budget?.estimatedMin || 32000;
  const currentDestinations = plannerState.destinations?.selected || ["gangtok"];

  // 1. BUDGET MODIFICATION
  if (intentType === "REDUCE_BUDGET") {
    const targetBudget = entities.budgetAmount || Math.round(currentCost * 0.8);
    const savings = Math.max(4000, currentCost - targetBudget);

    const changes = {
      budgetCap: targetBudget,
      budgetLevel: "budget",
      transportMode: "shared-sumo",
      accommodationType: "homestay"
    };

    const validation = validateMutationProposal({
      category: "BUDGET",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "BUDGET",
      title: entities.budgetAmount ? `Cap Budget to ₹${targetBudget.toLocaleString("en-IN")}` : "Lower Trip Budget",
      description: `Switching to authorized Sikkimese homestays and shared sumo transport reduces the estimated budget while maintaining all major sightseeing stops.`,
      proposedChanges: changes,
      expectedImpact: `Reduces trip budget by ~₹${savings.toLocaleString("en-IN")}`,
      estimatedSavings: `Save ~₹${savings.toLocaleString("en-IN")}`,
      refinementInstruction: entities.budgetAmount ? `Reduce budget to ₹${targetBudget}` : "Make trip cheaper by using shared transport and homestays.",
      actionLabel: "Apply Budget Savings",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  // 2. DAY PACING
  if (intentType === "MODIFY_DAY") {
    const targetDay = entities.dayNumber || 2;
    const changes = {
      targetDay,
      pace: "relaxed"
    };

    const validation = validateMutationProposal({
      category: "DAY_PACE",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "DAY_PACE",
      title: `Make Day ${targetDay} More Relaxed`,
      description: `Lightens activity scheduling on Day ${targetDay} to include dedicated relaxation, slower monastery exploration, and scenic tea breaks.`,
      proposedChanges: changes,
      expectedImpact: "Adds 2-3 hours of flexible rest and leisure time",
      estimatedSavings: null,
      refinementInstruction: `Make Day ${targetDay} more relaxed with dedicated rest time.`,
      actionLabel: `Relax Day ${targetDay}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  // 3. DRIVING & TRANSPORT
  if (intentType === "REDUCE_DRIVING" || intentType === "CHANGE_TRANSPORT") {
    const isShared = entities.transportMode === "shared-sumo" || intent.rawText.includes("shared");
    const transportMode = isShared ? "shared-sumo" : "private-cab";
    const modeLabel = isShared ? "Shared Sumo Cab" : "Private SUV / Cab";

    const changes = {
      transportMode,
      avoidLongDrives: true
    };

    const validation = validateMutationProposal({
      category: "TRANSPORT",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "TRANSPORT",
      title: isShared ? "Switch to Shared Sumo Transport" : "Optimize Driving & Transport Sequence",
      description: isShared
        ? "Switches point-to-point transit to reliable shared Sumo service, reducing transit costs significantly."
        : "Re-sequences road travel to minimize continuous mountain driving and avoid fatigue.",
      proposedChanges: changes,
      expectedImpact: isShared ? "Lowers transportation expenses by ~30%" : "Reduces daily transit fatigue across high passes",
      estimatedSavings: isShared ? "Save ~₹6,000" : null,
      refinementInstruction: isShared ? "Change transport mode to shared sumo." : "Optimize route sequence to minimize long drives.",
      actionLabel: isShared ? "Switch to Shared Cab" : "Optimize Driving Time",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  // 4. ACCOMMODATION
  if (intentType === "CHANGE_ACCOMMODATION") {
    const stayType = entities.accommodationType || "homestay";
    const stayLabel = stayType.charAt(0).toUpperCase() + stayType.slice(1);

    const changes = {
      accommodationType: stayType
    };

    const validation = validateMutationProposal({
      category: "ACCOMMODATION",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "ACCOMMODATION",
      title: `Switch Stay Preference to ${stayLabel}`,
      description: `Updates all overnight stays to authenticated Sikkimese ${stayLabel} accommodations for a more immersive and cost-efficient experience.`,
      proposedChanges: changes,
      expectedImpact: `Overnight stays updated to verified ${stayLabel} properties`,
      estimatedSavings: stayType === "homestay" ? "Save ~₹4,500" : null,
      refinementInstruction: `Change accommodation preference to ${stayType}.`,
      actionLabel: `Set Stays to ${stayLabel}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  // 5. DURATION CHANGES
  if (intentType === "CHANGE_DURATION") {
    let targetDuration = entities.targetDuration;
    if (!targetDuration && entities.durationDiff) {
      targetDuration = currentDuration + entities.durationDiff;
    }
    targetDuration = targetDuration || currentDuration;

    const changes = {
      duration: targetDuration
    };

    const validation = validateMutationProposal({
      category: "DURATION",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "DURATION",
      title: `Change Trip Duration to ${targetDuration} Days`,
      description: `Re-allocates days and activity pacing across a ${targetDuration}-day schedule to match your available vacation time.`,
      proposedChanges: changes,
      expectedImpact: `Trip schedule resized from ${currentDuration} to ${targetDuration} days`,
      estimatedSavings: null,
      refinementInstruction: `Change trip duration to ${targetDuration} days.`,
      actionLabel: `Update to ${targetDuration} Days`,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  // 6. DESTINATION MANAGEMENT (ADD / REMOVE)
  if (intentType === "ADD_DESTINATION" || intentType === "REMOVE_DESTINATION") {
    const isAdd = intentType === "ADD_DESTINATION";
    const destSlug = entities.destinationSlug || "pelling";
    const destObj = allDests.find((d) => d.slug === destSlug) || { name: destSlug };

    const changes = isAdd
      ? { addDestination: destSlug }
      : { removeDestination: destSlug };

    const validation = validateMutationProposal({
      category: "DESTINATION",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "DESTINATION",
      title: isAdd ? `Add ${destObj.name} to Route` : `Remove ${destObj.name} from Route`,
      description: isAdd
        ? `Integrates ${destObj.name} into your Sikkim itinerary circuit, optimizing drive times to prevent backtracking.`
        : `Removes ${destObj.name} and redistributes the open days to your other destinations.`,
      proposedChanges: changes,
      expectedImpact: isAdd ? `Added ${destObj.name} to circuit` : `Removed ${destObj.name} from circuit`,
      estimatedSavings: null,
      refinementInstruction: isAdd ? `Add ${destObj.name} to the itinerary.` : `Remove ${destObj.name} from the itinerary.`,
      actionLabel: isAdd ? `Add ${destObj.name}` : `Remove ${destObj.name}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  // 7. REMOVE ACTIVITY
  if (intentType === "REMOVE_ACTIVITY") {
    const targetDay = entities.dayNumber || 2;
    const changes = {
      targetDay,
      removeActivity: true
    };

    const validation = validateMutationProposal({
      category: "ACTIVITY_REMOVAL",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "ACTIVITY_REMOVAL",
      title: `Remove Activity from Day ${targetDay}`,
      description: `Removes the non-essential activity from Day ${targetDay} to reduce rush and provide more rest time.`,
      proposedChanges: changes,
      expectedImpact: `Lightens Day ${targetDay} schedule for leisurely exploration`,
      estimatedSavings: null,
      refinementInstruction: `Remove one non-essential activity from Day ${targetDay}.`,
      actionLabel: `Lighten Day ${targetDay}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  // 8. REPLACE DESTINATION
  if (intentType === "REPLACE_DESTINATION") {
    const oldSlug = entities.oldDestination || "pelling";
    const newSlug = entities.newDestination || "ravangla";
    const oldObj = allDests.find((d) => d.slug === oldSlug) || { name: oldSlug };
    const newObj = allDests.find((d) => d.slug === newSlug) || { name: newSlug };

    const changes = {
      replaceDestination: {
        oldDestination: oldSlug,
        newDestination: newSlug
      }
    };

    const validation = validateMutationProposal({
      category: "DESTINATION_REPLACE",
      changes,
      plannerState
    });

    if (!validation.isValid) {
      return { validation, proposal: null };
    }

    const proposal = {
      id: generateProposalId(),
      type: "MUTATION_PROPOSAL",
      category: "DESTINATION_REPLACE",
      title: `Replace ${oldObj.name} with ${newObj.name}`,
      description: `Updates your route circuit from ${oldObj.name} to ${newObj.name} and balances daily mountain driving times.`,
      proposedChanges: changes,
      expectedImpact: `Route modified to include ${newObj.name} instead of ${oldObj.name}`,
      estimatedSavings: null,
      refinementInstruction: `Replace ${oldObj.name} with ${newObj.name} in the itinerary.`,
      actionLabel: `Swap to ${newObj.name}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    return { validation, proposal };
  }

  return { validation: { isValid: true, errors: [], warnings: [] }, proposal: null };
}

