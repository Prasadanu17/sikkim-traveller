/**
 * backend/src/server.js
 * Start the Express web server with graceful shutdown and lifecycle handling.
 */

import app from './app.js';
import env from './config/env.js';
import prisma from './config/database.js';

const PORT = env.PORT || 3001;

let server = null;
let isShuttingDown = false;

export async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);

  // Force close after 10 seconds if connections are hanging
  const forceKillTimer = setTimeout(() => {
    console.error('[Server] Graceful shutdown timed out (10s). Forcing termination.');
    process.exit(1);
  }, 10000);
  forceKillTimer.unref();

  // Close HTTP server (stop accepting new connections, finish in-flight requests)
  if (server) {
    await new Promise((resolve) => {
      server.close((err) => {
        if (err) {
          console.error('[Server] Error while closing HTTP server:', err.message);
        } else {
          console.log('[Server] HTTP server closed successfully.');
        }
        resolve();
      });
    });
  }

  // Disconnect database client cleanly
  try {
    if (typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
      console.log('[Server] Prisma database client disconnected cleanly.');
    }
  } catch (err) {
    console.error('[Server] Error disconnecting Prisma client:', err.message);
  }

  console.log('[Server] Graceful shutdown completed. Exiting.');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Promise Rejection at:', promise, 'reason:', reason);
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging') {
    gracefulShutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception thrown:', err);
  gracefulShutdown('uncaughtException');
});

async function bootstrap() {
  try {
    // Verify database connection at startup
    console.log('[Bootstrap] Testing Supabase PostgreSQL database connection...');
    if (typeof prisma.$connect === 'function') {
      await prisma.$connect();
      console.log('[Bootstrap] Database connection successful.');
    }

    server = app.listen(PORT, () => {
      console.log(`[Server] Sikkim Traveller Backend listening on port ${PORT}`);
      console.log(`[Server] Environment: ${env.NODE_ENV}`);
      console.log(`[Server] API Base: ${env.API_BASE_URL}`);
    });
  } catch (err) {
    console.error('[Bootstrap] ❌ Failed to start the server:');
    console.error(err);
    process.exit(1);
  }
}

// Start only if executed directly (e.g. `node src/server.js`)
if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export default { bootstrap, gracefulShutdown };
