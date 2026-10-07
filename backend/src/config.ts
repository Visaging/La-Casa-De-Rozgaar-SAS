import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || '',
    intelligenceUrl: process.env.INTELLIGENCE_DATABASE_URL || '',
    path: process.env.DATABASE_PATH || (process.env.VERCEL ? '/tmp/module2.db' : './data/module2.db'),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  intelligenceProvider: (process.env.INTELLIGENCE_PROVIDER || (process.env.MODULE1_API_URL ? 'remote' : 'mock')) as 'mock' | 'remote',

  module1: {
    apiUrl: (process.env.MODULE1_API_URL || 'http://localhost:3000/api/v1').replace(/\/+$/, ''),
    apiKey: process.env.MODULE1_API_KEY || process.env.API_KEY_INGESTION || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  assessment: {
    maxDurationMinutes: parseInt(process.env.ASSESSMENT_MAX_DURATION_MINUTES || '120', 10),
    integrityThreshold: parseInt(process.env.ASSESSMENT_INTEGRITY_THRESHOLD || '3', 10),
  },

  logLevel: process.env.LOG_LEVEL || 'info',
} as const;
