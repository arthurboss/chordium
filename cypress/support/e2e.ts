// Import commands.ts using ES module syntax
import './commands';

// Hide fetch/XHR requests in the Cypress command log
const app = window.top;
if (app && app.document && app.document.body) {
  app.document.body.classList.add('hide-xhr-requests');
}

// Prevent "process is not defined" errors in browser context
// @ts-expect-error: Assigning a mock process object to the window to prevent "process is not defined" errors
window.process = { env: {} };

// Ignore uncaught exceptions coming from the application
Cypress.on('uncaught:exception', (err) => {
  // Returning false prevents Cypress from failing the test
  return false;
});