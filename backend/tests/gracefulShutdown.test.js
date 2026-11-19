/**
 * backend/tests/gracefulShutdown.test.js
 * Verification of graceful shutdown handling and signal interception.
 */

import { describe, it, expect, vi } from 'vitest';
import prisma from '../src/config/database.js';

describe('Server Lifecycle and Graceful Shutdown', () => {
  it('gracefulShutdown cleanly handles database disconnect', async () => {
    const disconnectSpy = vi.spyOn(prisma, '$disconnect').mockResolvedValueOnce(undefined);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    const { gracefulShutdown } = await import('../src/server.js');
    await gracefulShutdown('SIGTERM');

    expect(disconnectSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    disconnectSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
