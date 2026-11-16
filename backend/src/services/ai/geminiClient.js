/**
 * backend/src/services/ai/geminiClient.js
 * Official Google Gen AI client wrapper.
 * Provides resilient initialization, timeout management, mock injection for testing,
 * and safety checks.
 */

import { GoogleGenAI } from '@google/genai';
import env from '../../config/env.js';

let aiInstance = null;
let mockGenerator = null;
let mockStreamGenerator = null;

/**
 * Check whether Gemini API key is configured and valid
 */
export function isGeminiConfigured() {
  if (mockGenerator || mockStreamGenerator) return true;
  return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 5);
}

/**
 * For testing: allows injection of a mock generator
 */
export function setMockGeminiGenerator(mockFn) {
  mockGenerator = mockFn;
}

export function clearMockGeminiGenerator() {
  mockGenerator = null;
}

/**
 * For testing: allows injection of a mock stream generator
 */
export function setMockGeminiStreamGenerator(mockStreamFn) {
  mockStreamGenerator = mockStreamFn;
}

export function clearMockGeminiStreamGenerator() {
  mockStreamGenerator = null;
}

/**
 * Get or initialize the GoogleGenAI instance
 */
export function getGeminiClient() {
  if (mockGenerator) return { mock: true };
  if (!env.GEMINI_API_KEY) return null;

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return aiInstance;
}

/**
 * Robust execution with timeout protection (defaults to 15s)
 */
export async function executeGeminiWithTimeout(taskFn, timeoutMs = 15000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`AI generation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([taskFn(), timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Generates content using the configured Gemini model
 */
export async function callGemini({ systemInstruction, prompt, schema = null, timeoutMs = 15000 }) {
  if (mockGenerator) {
    return executeGeminiWithTimeout(() => mockGenerator({ systemInstruction, prompt, schema }), timeoutMs);
  }

  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';

  const config = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  if (schema) {
    config.responseMimeType = 'application/json';
    config.responseSchema = schema;
  }

  return executeGeminiWithTimeout(async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined
    });

    const rawText = response.text || '';
    return rawText;
  }, timeoutMs);
}

/**
 * Streams content chunk-by-chunk using Gemini or mock stream generator
 */
export async function streamGemini({ systemInstruction, prompt, onChunk, timeoutMs = 20000 }) {
  if (mockStreamGenerator) {
    return executeGeminiWithTimeout(async () => {
      await mockStreamGenerator({ systemInstruction, prompt, onChunk });
    }, timeoutMs);
  }

  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';

  const config = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  return executeGeminiWithTimeout(async () => {
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      const text = chunk.text || '';
      if (text) {
        fullText += text;
        if (onChunk) {
          onChunk(text);
        }
      }
    }
    return fullText;
  }, timeoutMs);
}

