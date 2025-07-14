import type { Config } from '../types/config.types.js';

const productionConfig: Partial<Config> = {
  server: {
    port: Number(process.env.PORT) || 10000
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  
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
      '--no-default-browser-check',
      '--single-process',
      '--no-zygote'
    ]
  }
};

export default productionConfig; 