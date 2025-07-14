// cypress/e2e/tab-state-persistence.cy.ts
// Cypress E2E tests for tab state persistence

describe.skip('Tab State Persistence', () => {
  it.skip('preserves search tab state when switching tabs', () => {
    cy.visit('/');

    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields
    cy.get('input[placeholder="Artist"]').type('The Beatles');
    cy.get('input[placeholder="Song"]').type('Yesterday');
    cy.contains(/search/i).click();

    // Wait for results to appear
    cy.contains('Yesterday').should('be.visible');

    // Switch to another tab and back
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.get('[data-cy="tab-search"]').click();

    // The search fields and results should still be present
    cy.get('input[placeholder="Artist"]').should('have.value', 'The Beatles');
    cy.get('input[placeholder="Song"]').should('have.value', 'Yesterday');
    cy.contains('Yesterday').should('be.visible');
  });

  it.skip('preserves My Chord Sheets tab scroll position', () => {
    cy.visit('/');
    cy.get('[data-cy="tab-my-chord-sheets"]').click();

    // Scroll the song list (adjust selector as needed)
    cy.get('[data-cy="song-list"]').scrollTo(0, 200);

    // Switch to another tab and back
    cy.get('[data-cy="tab-search"]').click();
    cy.get('[data-cy="tab-my-chord-sheets"]').click();

    // The scroll position should be preserved (allow for small delta)
    cy.get('[data-cy="song-list"]').then($el => {
      expect($el[0].scrollTop).to.be.greaterThan(150);
    });
  });
});
