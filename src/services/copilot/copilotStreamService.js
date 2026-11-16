/**
 * src/services/copilot/copilotStreamService.js
 * Client-side Server-Sent Events (SSE) streaming consumer for Trip Copilot.
 * Progressive token rendering, cancellation handling, and deterministic fallback streaming.
 */

import { buildCopilotContext } from "./copilotContextService";
import { parseCopilotIntent } from "./copilotIntentService";
import {
  getSessionConstraints,
  updateSessionConstraints,
  addMessageToHistory,
  addPreferredDestination,
  addExcludedDestination,
  getPreferredLanguage
} from "./copilotMemoryService";
import { sanitizeUserInput, validateCopilotResponse } from "./copilotSafetyService";
import { executeFallbackCopilotRequest } from "./copilotFallbackService";
import { detectLanguage } from "../i18n/languageService";
import { getMultilingualTemplates } from "../i18n/multilingualTemplates";

export async function streamCopilotMessage(
  userMessageText,
  plannerState,
  { onChunk, onActionCard, onDone, onError, signal, language }
) {
  // 1. Sanitize user input
  const safetyCheck = sanitizeUserInput(userMessageText);
  const cleanInput = safetyCheck.sanitizedText;

  // Add user message to history
  addMessageToHistory("user", cleanInput);

  // 2. Resolve active language & travel context
  const targetLanguage = language || getPreferredLanguage() || detectLanguage(cleanInput) || "en";
  const activeConstraints = getSessionConstraints();
  const normalizedContext = {
    ...buildCopilotContext(plannerState, activeConstraints),
    language: targetLanguage
  };

  // 3. Intent Detection & update constraints
  const intent = parseCopilotIntent(cleanInput);
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

  const apiEndpoint = import.meta.env?.VITE_COPILOT_STREAM_ENDPOINT || "/api/copilot/stream";

  let fullResponseText = "";
  let receivedActionCard = null;
  let receivedDataCard = null;
  let sourceBadge = "AI (Gemini)";

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: cleanInput,
        intent,
        context: normalizedContext,
        language: targetLanguage
      }),
      signal
    });

    if (!response.ok || !response.body) {
      throw new Error(`SSE endpoint returned HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const block of lines) {
        const trimmed = block.trim();
        if (!trimmed.startsWith("data:")) continue;

        const jsonStr = trimmed.replace(/^data:\s*/, "");
        try {
          const parsed = JSON.parse(jsonStr);

          if (parsed.type === "chunk" && parsed.text) {
            fullResponseText += parsed.text;
            if (onChunk) onChunk(parsed.text);
          } else if (parsed.type === "actionCard" && parsed.actionCard) {
            receivedActionCard = parsed.actionCard;
            if (onActionCard) onActionCard(parsed.actionCard);
          } else if (parsed.type === "dataCard" && parsed.dataCard) {
            receivedDataCard = parsed.dataCard;
          } else if (parsed.type === "done") {
            sourceBadge = parsed.sourceBadge || sourceBadge;
          } else if (parsed.type === "error") {
            throw new Error(parsed.message || "Streaming error from AI service");
          }
        } catch (_) {
          // Ignore incomplete JSON chunks in SSE stream buffer
        }
      }
    }
  } catch (err) {
    if (signal?.aborted) {
      return { aborted: true };
    }

    // Degrade gracefully to client-side progressive stream
    console.warn("[CopilotStreamService] Live SSE stream failed, streaming deterministic fallback:", err.message);

    // Multilingual native template or fallback
    const t = getMultilingualTemplates(targetLanguage);
    let fallbackResult = await executeFallbackCopilotRequest(plannerState, intent, normalizedContext);

    // Apply native language text if available
    if (targetLanguage !== "en" && t) {
      const dur = plannerState?.duration || 5;
      if (intent.intent === "REDUCE_BUDGET") {
        const estSavings = Math.round((plannerState?.budget?.estimatedMax || 45000) * 0.2);
        fallbackResult.text = t.budgetReduced(dur, estSavings);
        if (fallbackResult.actionCard) {
          fallbackResult.actionCard.title = t.budgetCardTitle;
          fallbackResult.actionCard.actionLabel = t.budgetActionLabel;
        }
      } else if (intent.intent === "CURRENT_WEATHER") {
        fallbackResult.text = t.weather;
      } else if (cleanInput.includes("permit") || cleanInput.includes("परमिट")) {
        fallbackResult.text = t.permits;
      }
    }

    const words = fallbackResult.text.split(/(\s+)/);
    for (const w of words) {
      if (signal?.aborted) return { aborted: true };
      fullResponseText += w;
      if (onChunk) onChunk(w);
      await new Promise((r) => setTimeout(r, 16));
    }

    receivedActionCard = fallbackResult.actionCard || null;
    sourceBadge = fallbackResult.sourceBadge || "Deterministic Intelligence";
    if (receivedActionCard && onActionCard) {
      onActionCard(receivedActionCard);
    }
  }

  // Safety check on assembled text
  const valResult = validateCopilotResponse({ text: fullResponseText });
  if (!valResult.isValid) {
    fullResponseText = "I analyzed your trip context and preferences to help you refine your Sikkim journey safely.";
  }

  // Persist completed assistant message into history
  const assistantMsg = addMessageToHistory("assistant", fullResponseText, {
    actionCard: receivedActionCard,
    dataCard: receivedDataCard,
    sourceBadge,
    language: targetLanguage
  });

  if (onDone) {
    onDone({
      message: assistantMsg,
      actionCard: receivedActionCard,
      dataCard: receivedDataCard,
      sourceBadge,
      language: targetLanguage
    });
  }

  return {
    message: assistantMsg,
    actionCard: receivedActionCard,
    dataCard: receivedDataCard,
    sourceBadge,
    language: targetLanguage
  };
}
