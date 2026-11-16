import { buildCopilotContext } from "./copilotContextService";
import { parseCopilotIntent } from "./copilotIntentService";
import {
  getSessionConstraints,
  updateSessionConstraints,
  addMessageToHistory,
  addPreferredDestination,
  addExcludedDestination
} from "./copilotMemoryService";
import { sanitizeUserInput, validateCopilotResponse } from "./copilotSafetyService";
import { executeFallbackCopilotRequest } from "./copilotFallbackService";

/**
 * Master AI Trip Copilot Orchestrator Service.
 * Coordinates input safety, context normalization, intent parsing, memory constraints,
 * tool execution, and safe response delivery.
 */
export async function processCopilotMessage(userMessageText, plannerState) {
  // 1. Input Safety & Sanitization
  const safetyCheck = sanitizeUserInput(userMessageText);
  const cleanInput = safetyCheck.sanitizedText;

  // Add user message to history
  addMessageToHistory("user", cleanInput);

  // 2. Build Compact Normalized Context
  const activeConstraints = getSessionConstraints();
  const normalizedContext = buildCopilotContext(plannerState, activeConstraints);

  // 3. Intent Detection & Entity Extraction
  const intent = parseCopilotIntent(cleanInput);

  // 4. Update Memory Constraints based on detected user preferences
  if (intent.intent === "REDUCE_DRIVING") {
    updateSessionConstraints({ avoidLongDrives: true });
  }
  if (intent.entities?.budgetAmount) {
    updateSessionConstraints({ budgetCap: intent.entities.budgetAmount });
  }
  if (intent.entities?.accommodationType) {
    updateSessionConstraints({ preferredStay: intent.entities.accommodationType });
  }
  if (intent.entities?.transportMode) {
    updateSessionConstraints({ preferredTransport: intent.entities.transportMode });
  }
  if (intent.entities?.pace) {
    updateSessionConstraints({ pacePreference: intent.entities.pace });
  }
  if (intent.intent === "ADD_DESTINATION" && intent.entities?.destinationSlug) {
    addPreferredDestination(intent.entities.destinationSlug);
  }
  if (intent.intent === "REMOVE_DESTINATION" && intent.entities?.destinationSlug) {
    addExcludedDestination(intent.entities.destinationSlug);
  }

  // 5. Secure Backend API Proxy check or deterministic fallback execution
  const apiEndpoint = import.meta.env?.VITE_COPILOT_API_ENDPOINT || "/api/copilot";

  let responsePayload = null;

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: cleanInput,
        intent,
        context: normalizedContext
      })
    });

    if (response.ok) {
      responsePayload = await response.json();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    // Backend API unavailable or local dev mode -> execute deterministic Copilot fallback
    responsePayload = await executeFallbackCopilotRequest(plannerState, intent, normalizedContext);
  }

  // Fallback safety check
  if (!responsePayload) {
    responsePayload = await executeFallbackCopilotRequest(plannerState, intent, normalizedContext);
  }

  // 6. Response Validation
  const valResult = validateCopilotResponse(responsePayload);
  if (!valResult.isValid) {
    responsePayload = {
      text: "I analyzed your trip context and preferences to help you refine your Sikkim journey safely."
    };
  }

  // Add assistant message to history
  const assistantMsg = addMessageToHistory("assistant", responsePayload.text, {
    actionCard: responsePayload.actionCard || null,
    dataCard: responsePayload.dataCard || null,
    sourceBadge: responsePayload.sourceBadge || null
  });

  return {
    message: assistantMsg,
    actionCard: responsePayload.actionCard || null,
    dataCard: responsePayload.dataCard || null,
    sourceBadge: responsePayload.sourceBadge || null,
    intent
  };
}
