/**
 * backend/src/controllers/aiController.js
 * Controller handling AI itinerary generation, refinement, and Copilot conversations.
 * Includes strict Zod validation, error handling, and safe logging.
 */

import { z } from 'zod';
import { generateItineraryAI, refineItineraryAI } from '../services/ai/itineraryAIService.js';
import { processCopilotAI } from '../services/ai/copilotAIService.js';

const generateSchema = z.object({
  tripContext: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
    message: 'tripContext must be a non-empty object'
  }),
  regenerationPreference: z.any().optional(),
  systemInstruction: z.string().max(5000).optional(),
  userPrompt: z.string().max(5000).optional()
});

const refineSchema = z.object({
  tripContext: z.record(z.any()).optional(),
  existingItinerary: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
    message: 'existingItinerary must be a non-empty object'
  }),
  intent: z.record(z.any()).optional(),
  requestInput: z.string().max(2000).optional()
});

const copilotSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1500, 'Message too long'),
  intent: z.record(z.any()).optional(),
  context: z.record(z.any()).optional()
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

