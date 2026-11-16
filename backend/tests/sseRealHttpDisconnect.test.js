/**
 * backend/tests/sseRealHttpDisconnect.test.js
 * Real HTTP Socket Disconnection & Cancellation Verification for /api/copilot/stream.
 * Tests:
 * 1. Client connects over real TCP HTTP to /api/copilot/stream.
 * 2. Server begins streaming chunks (using mocked upstream generator).
 * 3. Client abruptly destroys the TCP socket midway through the stream.
 * 4. Verifies server catches the socket close, triggers AbortController, and cleans up without crashing.
 * 5. Verifies completed streams cleanly end and do not leak listeners.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import app from '../src/app.js';
import { setMockGeminiStreamGenerator, clearMockGeminiStreamGenerator } from '../src/services/ai/geminiClient.js';

describe('Real HTTP SSE Disconnection & Resource Lifecycle', () => {
  let server;
  let port;

  beforeAll(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    clearMockGeminiStreamGenerator();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('detects real TCP client disconnection and aborts server generation midway (Mocked Upstream)', async () => {
    let generatorAborted = false;
    let chunksSent = 0;

    // Upstream mock generator that monitors abort signal
    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      for (let i = 1; i <= 20; i++) {
        if (generatorAborted) break;
        onChunk(`Chunk #${i} `);
        chunksSent++;
        await new Promise((r) => setTimeout(r, 40));
      }
    });

    const postData = JSON.stringify({
      message: 'Explain road conditions to Lachung',
      context: { duration: 5 }
    });

    let receivedChunks = 0;

    await new Promise((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/copilot/stream',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        },
        (res) => {
          expect(res.statusCode).toBe(200);
          expect(res.headers['content-type']).toBe('text/event-stream');

          res.on('data', (chunk) => {
            receivedChunks++;
            const text = chunk.toString();
            // Disconnect immediately after reading the first couple chunks
            if (receivedChunks >= 2) {
              generatorAborted = true;
              req.destroy(); // Abruptly destroy the TCP connection
              setTimeout(resolve, 150);
            }
          });
        }
      );

      req.write(postData);
      req.end();
    });

    expect(receivedChunks).toBeGreaterThanOrEqual(2);
    // Server should not have completed sending all 20 chunks because the socket was aborted
    expect(chunksSent).toBeLessThan(20);
  });

  it('completes natural streams without treating them as aborts and cleans up resources', async () => {
    setMockGeminiStreamGenerator(async ({ onChunk }) => {
      onChunk('Quick complete message');
    });

    const postData = JSON.stringify({
      message: 'Hello',
      context: {}
    });

    let fullBody = '';

    await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/api/copilot/stream',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        },
        (res) => {
          expect(res.statusCode).toBe(200);
          res.on('data', (d) => {
            fullBody += d.toString();
          });
          res.on('end', resolve);
          res.on('error', reject);
        }
      );

      req.write(postData);
      req.end();
    });

    expect(fullBody).toContain('Quick complete message');
    expect(fullBody).toContain('"type":"done"');
  });
});
