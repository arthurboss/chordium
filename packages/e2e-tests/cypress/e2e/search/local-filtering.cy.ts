/**
 * E2E tests for narrowing an artist's song list.
 *
 * Typing no longer filters a search's results. A search is answered by the source
 * and shown as it came back, so the only thing typing still narrows is the song
 * list of an artist whose page is open. These cover that, and that a search's own
 * results are left alone.
 *
 * ⚠️  IMPORTANT: These tests use real API calls to test the actual filtering
 * functionality. They should only be run locally to avoid unnecessary
 * scraping load and potential rate limiting issues.
 *
 * To run these tests locally: npm run test:dev -- --spec "cypress/e2e/search/local-filtering.cy.ts"
 */

describe('Local Filtering E2E', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });

    cy.visit('/');
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
  });

  describe("Narrowing an artist's songs", () => {
    it('narrows the list as the field is typed in, and restores it when cleared', () => {
      cy.get('#search-input').type('eagles');
      cy.get('[data-cy="search-submit-button"]').click();

      cy.get('[data-cy="search-results-area"]', { timeout: 20000 }).should('be.visible');
      cy.openResultSections();

      // Open an artist, which is how their songs are reached.
      cy.get('[data-cy^="artist-card-compact-"]', { timeout: 20000 }).first().click();

      cy.openResultSections();
      cy.get('[data-cy^="song-card-compact-"]', { timeout: 20000 })
        .should('have.length.greaterThan', 1)
        .then(($all) => {
          const whole = $all.length;

          cy.get('#search-input').clear().type('desperado');
          cy.openResultSections();
          cy.get('[data-cy^="song-card-compact-"]').should('have.length.lessThan', whole);

          cy.get('#search-input').clear();
          cy.openResultSections();
          cy.get('[data-cy^="song-card-compact-"]').should('have.length', whole);
        });
    });
  });

  describe("A search's own results", () => {
    it('are left as the source returned them while the field is typed in', () => {
      cy.get('#search-input').type('hotel california');
      cy.get('[data-cy="search-submit-button"]').click();

      cy.get('[data-cy="search-results-area"]', { timeout: 20000 }).should('be.visible');
      cy.openResultSections();

      cy.get('[data-cy^="song-card-compact-"]', { timeout: 20000 }).then(($cards) => {
        const shown = $cards.length;

        // Only submitting searches again; typing alone changes nothing on screen.
        cy.get('#search-input').type(' live');
        cy.wait(500);

        cy.openResultSections();
        cy.get('[data-cy^="song-card-compact-"]').should('have.length', shown);
      });
    });
  });
});
