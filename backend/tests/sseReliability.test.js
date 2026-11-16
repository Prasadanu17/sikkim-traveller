/**
 * backend/tests/sseReliability.test.js
 * Verification of Server-Sent Events (SSE) Streaming Reliability:
 * 1. SSE Wire Protocol Header Conformance
 * 2. Event Envelope Structure & Parsing (chunk, actionCard, done)
 * 3. Client Abort / Connection Drop Cancellation
 * 4. Mid-stream Recovery to Deterministic Fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { handleCopilotStream } from '../src/controllers/aiController.js';
import { setMockGeminiStreamGenerator, clearMockGeminiStreamGenerator } from '../src/services/ai/geminiClient.js';

describe('SSE Streaming Reliability Suite', () => {
  let mockReq;
  let mockRes;
  let responseData;
  let headers;

  beforeEach(() => {
    responseData = [];
    headers = {};

    mockReq = new EventEmitter();
    mockReq.body = {
      message: 'Plan a 5 day Sikkim trip for Gangtok and Pelling',
      context: { duration: 5, destinations: ['gangtok', 'pelling'] }
    };

    const finishCallbacks = [];
    mockRes = {
      setHeader: (key, val) => {
        headers[key] = val;
      },
      write: (data) => {
        responseData.push(data);
      },
      end: vi.fn(() => {
        mockRes.writableEnded = true;
        finishCallbacks.forEach(cb => cb());
      }),
      on: (event, cb) => {
        if (event === 'finish') finishCallbacks.push(cb);
      },
      flushHeaders: vi.fn(),
      writableEnded: false
    };
  });

  afterEach(() => {
    clearMockGeminiStreamGenerator();
  });

  it('sets standard SSE headers preventing proxies and caching from buffering chunks', async () => {
    await handleCopilotStream(mockReq, mockRes, vi.fn());

    expect(headers['Content-Type']).toBe('text/event-stream');
    expect(headers['Cache-Control']).toBe('no-cache, no-transform');
    expect(headers['Connection']).toBe('keep-alive');
    expect(headers['X-Accel-Buffering']).toBe('no');
  });

  it('streams formatted SSE chunks compliant with data envelope specs', async () => {
    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Welcome ');
      onChunk('to ');
      onChunk('Sikkim!');
    });

    await handleCopilotStream(mockReq, mockRes, vi.fn());

    expect(responseData.length).toBeGreaterThanOrEqual(3);
    const parsedChunks = responseData.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          return JSON.parse(trimmed.replace('data: ', ''));
        } catch {
          return null;
        }
      }
      return null;
    }).filter(Boolean);

    const textPieces = parsedChunks.filter(c => c.type === 'chunk').map(c => c.text);
    expect(textPieces.join('')).toContain('Welcome to Sikkim!');

    const doneEvent = parsedChunks.find(c => c.type === 'done');
    expect(doneEvent).toBeDefined();
    expect(doneEvent.sourceBadge).toBe('AI (Gemini)');
    expect(mockRes.end).toHaveBeenCalled();
  });

  it('aborts generation and halts writes immediately when client disconnects', async () => {
    let mockAborted = false;

    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Starting stream...');
      // Simulate client disconnecting during transmission
      mockReq.emit('close');
      await new Promise(r => setTimeout(r, 50));
      onChunk('This chunk should be discarded');
    });

    await handleCopilotStream(mockReq, mockRes, vi.fn());

    const allData = responseData.join('');
    expect(allData).not.toContain('This chunk should be discarded');
  });

  it('recovers with deterministic fallback stream if Gemini throws an error mid-stream', async () => {
    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Beginning analysis...');
      throw new Error('Gemini upstream network partition');
    });

    await handleCopilotStream(mockReq, mockRes, vi.fn());

    const parsedChunks = responseData.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          return JSON.parse(trimmed.replace('data: ', ''));
        } catch {
          return null;
        }
      }
      return null;
    }).filter(Boolean);

    const doneEvent = parsedChunks.find(c => c.type === 'done');
    expect(doneEvent).toBeDefined();
    expect(mockRes.end).toHaveBeenCalled();
  });

  it('does not treat naturally completed responses as aborted and cleans up listeners', async () => {
    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Natural completion');
    });

    expect(mockReq.listenerCount('close')).toBe(0);

    await handleCopilotStream(mockReq, mockRes, vi.fn());

    expect(mockRes.writableEnded).toBe(true);
    // Listener should be cleaned up on finish
    expect(mockReq.listenerCount('close')).toBe(0);

    // Any subsequent close event on finished request must not throw or write
    expect(() => mockReq.emit('close')).not.toThrow();
  });

  it('safely drops chunks if response is marked destroyed or writableEnded', async () => {
    mockRes.writableEnded = true;

    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Data that should be dropped');
    });

    await handleCopilotStream(mockReq, mockRes, vi.fn());

    expect(responseData.length).toBe(0);
  });
});
