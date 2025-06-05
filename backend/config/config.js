import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001
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
      '--no-sandbox'
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

export default config;
