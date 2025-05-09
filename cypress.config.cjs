// CommonJS format for Cypress configuration
const { defineConfig } = require('cypress');

module.exports = defineConfig({
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
    baseUrl: 'http://localhost:8080' // App server port
  }
});
