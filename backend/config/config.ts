import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Config } from '../types/config.types.js';
import productionConfig from './production.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// For both source and compiled versions, resolve .env from backend directory
const envPath = __dirname.includes('dist') 
  ? path.resolve(__dirname, '../../../.env')  // From dist/backend/config/ to backend/.env
  : path.resolve(__dirname, '../.env');       // From config/ to backend/.env
dotenv.config({ path: envPath });

const baseConfig: Config = {
  // Server configuration
  server: {
    port: Number(process.env.PORT) || 3001
  },

  // CORS configuration
  cors: {
    origin: '*',
    methods: ['GET']
  },

  // Puppeteer configuration
  puppeteer: {
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--enable-features=NetworkService,NetworkServiceLogging',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--start-maximized',
      '--disable-extensions',
      '--disable-plugins',
      '--aggressive-cache-discard',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  },

  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  // CifraClub specific
  cifraClub: {
    baseUrl: 'https://www.cifraclub.com.br',
    blockedDomains: [
      'googleads.g.doubleclick.net',
      'ads.pubmatic.com',
      'adservice.google.com',
      'www.google-analytics.com',
      'pixel.facebook.com'
    ]
  }
};

// Merge with production config if in production
const config: Config = process.env.NODE_ENV === 'production' 
  ? { ...baseConfig, ...productionConfig }
  : baseConfig;

export default config;
