import type { Config } from '../types/config.types.js';

const productionConfig: Partial<Config> = {
  server: {
    port: Number(process.env.PORT) || 10000
  },
  
  cors: {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://chordium.vercel.app',
        'http://localhost:8080', // Local development
        'http://localhost:4173'  // Local preview
      ].filter((url): url is string => Boolean(url)); // Type-safe filter
      
      // Vercel preview deployment patterns
      const vercelPreviewPatterns = [
        /^https:\/\/chordium-git-.+\.vercel\.app$/, // Git branch deployments
        /^https:\/\/app-.+-chordium\.vercel\.app$/, // PR/commit deployments
        /^https:\/\/chordium-.+\.vercel\.app$/      // Other preview patterns
      ];
      
      // Check if the origin is in the allowed list or matches Vercel preview pattern
      const isAllowed = allowedOrigins.includes(origin) || 
        vercelPreviewPatterns.some(pattern => pattern.test(origin));
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
      '--no-zygote'
    ],
    keepAlive: 10 * 60 * 1000, // 10 minutes
    maxRetries: 3,
    retryDelay: 2000
  }
};

export default productionConfig; 