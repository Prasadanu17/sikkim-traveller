/**
 * backend/tests/streaming.test.js
 * Automated test suite for Module E.1: Streaming AI Responses
 * Covers:
 * 1. Progressive SSE chunk delivery
 * 2. Complete stream lifecycle with done event
 * 3. Client cancellation / abort handling
 * 4. Deterministic fallback streaming when Gemini is unconfigured
 * 5. Input validation error handling (empty message)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { streamCopilotAI } from '../src/services/ai/copilotAIService.js';
import {
  setMockGeminiStreamGenerator,
  clearMockGeminiStreamGenerator
} from '../src/services/ai/geminiClient.js';

describe('Module E.1: Streaming AI Responses', () => {
  beforeEach(() => {
    clearMockGeminiStreamGenerator();
  });

  afterEach(() => {
    clearMockGeminiStreamGenerator();
  });

  it('1. Delivers progressive response chunks in real-time', async () => {
    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Visiting ');
      onChunk('Lachung and ');
      onChunk('Yumthang Valley is scenic.');
    });

    const receivedChunks = [];
    let completedSummary = null;

    await streamCopilotAI({
      message: 'Tell me about North Sikkim',
      intent: { intent: 'GENERAL_INQUIRY' },
      context: { duration: 5 },
      onChunk: (chunk) => receivedChunks.push(chunk),
      onDone: (summary) => {
        completedSummary = summary;
      }
    });

    expect(receivedChunks.length).toBe(3);
    expect(receivedChunks.join('')).toBe('Visiting Lachung and Yumthang Valley is scenic.');
    expect(completedSummary).toBeDefined();
    expect(completedSummary.sourceBadge).toBe('AI (Gemini)');
  });

  it('2. Completes stream lifecycle and emits action card for mutating requests', async () => {
    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('I have adjusted your Day 2 schedule to be more relaxed.');
    });

    const receivedChunks = [];
    let receivedCard = null;
    let isDone = false;

    await streamCopilotAI({
      message: 'Make Day 2 more relaxed',
      intent: { intent: 'MODIFY_DAY', isMutating: true, entities: { dayNumber: 2 } },
      context: { duration: 5 },
      onChunk: (chunk) => receivedChunks.push(chunk),
      onActionCard: (card) => {
        receivedCard = card;
      },
      onDone: () => {
        isDone = true;
      }
    });

    expect(isDone).toBe(true);
    expect(receivedChunks.length).toBeGreaterThan(0);
    expect(receivedCard).toBeDefined();
    expect(receivedCard.category).toBe('DAY_PACE');
    expect(receivedCard.actionLabel).toContain('Relax Day 2');
  });

  it('3. Safely halts generation when client signals abort', async () => {
    const abortCtrl = new AbortController();
    const receivedChunks = [];

    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Chunk 1 ');
      abortCtrl.abort(); // Client aborts mid-stream
      onChunk('Chunk 2 ');
      onChunk('Chunk 3 ');
    });

    await streamCopilotAI({
      message: 'Generate a long response',
      intent: { intent: 'GENERAL_INQUIRY' },
      context: { duration: 5 },
      signal: abortCtrl.signal,
      onChunk: (chunk) => receivedChunks.push(chunk)
    });

    // Chunk 2 and Chunk 3 should not be processed
    expect(receivedChunks.length).toBe(1);
    expect(receivedChunks[0]).toBe('Chunk 1 ');
  });

  it('4. Provides progressive simulated streaming for deterministic fallbacks when Gemini is unconfigured', async () => {
    // Clear mock generator -> simulates unconfigured or offline Gemini
    clearMockGeminiStreamGenerator();

    const receivedChunks = [];
    let completedSummary = null;

    await streamCopilotAI({
      message: 'What is the current weather?',
      intent: { intent: 'CURRENT_WEATHER' },
      context: { duration: 5 },
      onChunk: (chunk) => receivedChunks.push(chunk),
      onDone: (summary) => {
        completedSummary = summary;
      }
    });

    expect(receivedChunks.length).toBeGreaterThan(1);
    const fullText = receivedChunks.join('');
    expect(fullText).toContain('Gangtok');
    const badgeStream = typeof completedSummary.sourceBadge === 'object' ? completedSummary.sourceBadge.name : completedSummary.sourceBadge;
    expect(badgeStream).toContain('Open-Meteo');
  });

  it('5. Falls back deterministically if Gemini throws an error mid-stream', async () => {
    setMockGeminiStreamGenerator(async () => {
      throw new Error('Gemini API quota exceeded');
    });

    const receivedChunks = [];
    let completedSummary = null;

    await streamCopilotAI({
      message: 'Reduce my budget to ₹15,000',
      intent: { intent: 'REDUCE_BUDGET', isMutating: true, entities: { budgetAmount: 15000 } },
      context: { duration: 5, budget: { estimatedMax: 45000 } },
      onChunk: (chunk) => receivedChunks.push(chunk),
      onDone: (summary) => {
        completedSummary = summary;
      }
    });

    expect(receivedChunks.length).toBeGreaterThan(0);
    const fullText = receivedChunks.join('');
    expect(fullText).toContain('Switching to shared transportation');
    expect(completedSummary.actionCard).toBeDefined();
    expect(completedSummary.actionCard.category).toBe('BUDGET');
  });
});
