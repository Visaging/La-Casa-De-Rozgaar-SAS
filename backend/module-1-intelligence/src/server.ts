import { buildApp } from './app.js';
import { config } from './config/index.js';
import { closePool } from './db/index.js';
import type { FastifyInstance } from 'fastify';

let fastifyApp: FastifyInstance | null = null;

export async function getFastifyApp(): Promise<FastifyInstance> {
  if (!fastifyApp) {
    fastifyApp = await buildApp();
    await fastifyApp.ready();
  }
  return fastifyApp;
}

// Handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  const app = await getFastifyApp();
  app.server.emit('request', req, res);
}

const signals = ['SIGINT', 'SIGTERM'];

async function start() {
  let app: FastifyInstance | undefined;

  try {
    // Build and start the Fastify app
    app = await getFastifyApp();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          LA CASA DE ROZGAAR - Intelligence Platform          ║
║              Module 1: Intelligence & Data API                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Server started successfully

API Server:      http://${config.host}:${config.port}
Documentation:   http://localhost:${config.port}/api/docs
Health Check:   http://localhost:${config.port}/api/health

Environment:     ${config.nodeEnv}
Log Level:       ${config.logging.level}
Database:       ${config.database.name}

Press CTRL+C to stop
    `);

    // Graceful shutdown handler
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n[SHUTDOWN] ${signal} received, starting graceful shutdown...`);

        if (!app) {
          console.log('[WARN] Server not initialized');
          process.exit(0);
        }

        try {
          // Close Fastify server
          await app.close();
          console.log('[OK] HTTP server closed');

          // Close database connections
          await closePool();
          console.log('[OK] Database connections closed');

          console.log('[OK] Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('[ERROR] Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('[FATAL] Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    console.error('[FATAL] Failed to start server:', error);
    process.exit(1);
  }
}

// Start standalone server only when not running on Vercel or in tests
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  start();
}
