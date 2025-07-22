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
    fixturesFolder: '../../../shared/fixtures/api', // Use global API fixtures
    viewportWidth: 1280,
    viewportHeight: 720
  }
});
