import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  env: {
    CI: true
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:8080', // App server port
    fixturesFolder: '../../frontend/fixtures/api', // Use API fixtures from frontend
    viewportWidth: 1280,
    viewportHeight: 720
  }
});
