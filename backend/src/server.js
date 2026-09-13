/**
 * backend/src/server.js
 * Start the Express web server.
 */

import app from './app.js';
import env from './config/env.js';
import prisma from './config/database.js';

const PORT = env.PORT || 3001;

async function bootstrap() {
  try {
    // Verify database connection at startup
    console.log('[Bootstrap] Testing Supabase PostgreSQL database connection...');
    await prisma.$connect();
    console.log('[Bootstrap] Database connection successful.');

    app.listen(PORT, () => {
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

bootstrap();
