
/// <reference types="cypress" />

// Add custom commands here
Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args);
});

export {};
