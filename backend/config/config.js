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
