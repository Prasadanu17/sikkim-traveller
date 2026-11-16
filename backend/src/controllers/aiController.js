/**
 * backend/src/controllers/aiController.js
 * Controller handling AI itinerary generation, refinement, and Copilot conversations.
 * Includes strict Zod validation, error handling, and safe logging.
 */

import { z } from 'zod';
import { generateItineraryAI, refineItineraryAI } from '../services/ai/itineraryAIService.js';
import { processCopilotAI, streamCopilotAI } from '../services/ai/copilotAIService.js';

const generateSchema = z.object({
  tripContext: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
    message: 'tripContext must be a non-empty object'
  }),
  regenerationPreference: z.any().optional(),
  systemInstruction: z.string().max(5000).optional(),
  userPrompt: z.string().max(5000).optional(),
  language: z.enum(['en', 'hi', 'ne']).optional()
});

const refineSchema = z.object({
  tripContext: z.record(z.any()).optional(),
  existingItinerary: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
    message: 'existingItinerary must be a non-empty object'
  }),
  intent: z.record(z.any()).optional(),
  requestInput: z.string().max(2000).optional(),
  language: z.enum(['en', 'hi', 'ne']).optional()
});

const copilotSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1500, 'Message too long'),
  intent: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
  language: z.enum(['en', 'hi', 'ne']).optional()
});

export async function handleGenerateItinerary(req, res, next) {
  try {
    const validated = generateSchema.parse(req.body);
    const result = await generateItineraryAI(validated);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', details: err.errors.map(e => e.message) }
      });
    }
    next(err);
  }
}

export async function handleRefineItinerary(req, res, next) {
  try {
    const validated = refineSchema.parse(req.body);
    const result = await refineItineraryAI(validated);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', details: err.errors.map(e => e.message) }
      });
    }
    next(err);
  }
}

export async function handleCopilot(req, res, next) {
  try {
    const validated = copilotSchema.parse(req.body);
    const result = await processCopilotAI(validated);
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', details: err.errors.map(e => e.message) }
      });
    }
    next(err);
  }
}

/**
 * Server-Sent Events (SSE) streaming endpoint for progressive Copilot responses.
 */
export async function handleCopilotStream(req, res, next) {
  try {
    const validated = copilotSchema.parse(req.body);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    const abortController = new AbortController();
    let isClientClosed = false;

    const onClose = () => {
      // If the response already completed naturally (writableEnded), do not treat as an abrupt abort
      if (!res.writableEnded) {
        isClientClosed = true;
        abortController.abort();
      }
    };

    req.on('close', onClose);
    res.on('finish', () => {
      req.off('close', onClose);
    });

    const sendEvent = (eventData) => {
      if (isClientClosed || res.writableEnded || res.destroyed) return;
      try {
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      } catch (_) {}
    };

    await streamCopilotAI({
      message: validated.message,
      intent: validated.intent,
      context: validated.context,
      language: validated.language,
      signal: abortController.signal,
      onChunk: (chunk) => {
        sendEvent({ type: 'chunk', text: chunk });
      },
      onActionCard: (card) => {
        sendEvent({ type: 'actionCard', actionCard: card });
      },
      onDone: (summary) => {
        if (!isClientClosed && !res.writableEnded && !res.destroyed) {
          sendEvent({ type: 'done', ...summary });
          try {
            res.end();
          } catch (_) {}
        }
      },
      onError: (err) => {
        if (!isClientClosed && !res.writableEnded && !res.destroyed) {
          sendEvent({ type: 'error', message: err.message });
          try {
            res.end();
          } catch (_) {}
        }
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', details: err.errors.map(e => e.message) }
      });
    }
    next(err);
  }
}


