/**
 * E2E coverage for the Artists section drill-down flow: search -> Artists
 * section -> one artist's own songs -> a chord sheet -> back through each
 * step in turn.
 *
 * Regression coverage for a bug where returning from an artist's own page
 * lost the search query from the URL, broke filtering on the artist's song
 * list, and - after visiting a chord sheet and using its own back button -
 * landed back on the generic results overview instead of the Artists
 * section it had been opened from. Fully mocked (no real network calls), so
 * it's deterministic and safe to run in CI.
 */

const SEARCH_HITS = [
  { type: 'artist', path: 'hillsong-worship', displayName: 'Hillsong Worship', songCount: 140 },
  { type: 'artist', path: 'hillsong-united', displayName: 'Hillsong United', songCount: 90 },
  {
    type: 'song',
    path: 'hillsong-worship/what-a-beautiful-name',
    title: 'What A Beautiful Name',
    artist: 'Hillsong Worship',
    match: 'title',
  },
];

const HILLSONG_WORSHIP_SONGS = [
  { path: 'hillsong-worship/what-a-beautiful-name', title: 'What A Beautiful Name', artist: 'Hillsong Worship' },
  { path: 'hillsong-worship/oceans', title: 'Oceans', artist: 'Hillsong Worship' },
  { path: 'hillsong-worship/cornerstone', title: 'Cornerstone', artist: 'Hillsong Worship' },
];

const CHORD_SHEET = {
  songChords: '[D]What a beautiful [G]name it is',
  title: 'What A Beautiful Name',
  artist: 'Hillsong Worship',
  songKey: 'D',
  guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  guitarCapo: 0,
};

function search(query: string) {
  cy.get('#search-input').clear().type(query);
  cy.get('[data-cy="search-submit-button"]').click();
  cy.wait('@searchApi');
}

describe('Artist section drill-down navigation', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/search*', SEARCH_HITS).as('searchApi');
    cy.intercept('GET', '**/api/artist-songs*', HILLSONG_WORSHIP_SONGS).as('artistSongsApi');
    cy.intercept('GET', '**/api/cifraclub-song*', CHORD_SHEET).as('chordSheetApi');

    cy.visit('/');
    cy.get('[data-cy="tab-search"]').click();

    search('hillsong');
    // Drill into the Artists section - every test below starts from there,
    // since that's the only place a single artist's card is ever reachable.
    cy.contains('button[aria-expanded]', 'Artists').click();
  });

  it('keeps the search query in the URL and opens the artist directly, without bypassing through the overview', () => {
    cy.url().should('include', 'q=hillsong').and('include', 'section=artists');

    cy.get('[data-cy="artist-card-compact-hillsong-worship"]').click();
    cy.wait('@artistSongsApi');

    cy.url().should('eq', `${Cypress.config().baseUrl}/hillsong-worship`);
    cy.contains('h2', 'Hillsong Worship').should('be.visible');
    cy.contains('h2', 'Results').should('not.exist');
  });

  it("narrows an artist's own song list as the filter is typed in, and restores it when cleared", () => {
    cy.get('[data-cy="artist-card-compact-hillsong-worship"]').click();
    cy.wait('@artistSongsApi');

    cy.get('[data-cy="results-filter-input"]').type('ocean');
    cy.get('[data-cy^="song-title-"]').should('have.length', 1);
    cy.contains('h3', 'Oceans').should('be.visible');

    cy.get('[data-cy="results-filter-input"]').clear();
    cy.get('[data-cy^="song-title-"]').should('have.length', 3);
  });

  it("clears a section's filter text when moving from the Artists list into one artist's own songs", () => {
    cy.get('[data-cy="results-filter-input"]').type('worship');
    cy.get('[data-cy^="artist-title-"]').should('have.length', 1);

    cy.get('[data-cy="artist-card-compact-hillsong-worship"]').click();
    cy.wait('@artistSongsApi');

    cy.get('[data-cy="results-filter-input"]').should('have.value', '');
    cy.get('[data-cy^="song-title-"]').should('have.length', 3);
  });

  it('returns to the Artists section, not the results overview, after a chord sheet round trip', () => {
    cy.get('[data-cy="artist-card-compact-hillsong-worship"]').click();
    cy.wait('@artistSongsApi');

    cy.get('[data-cy="song-card-compact-hillsong-worship/what-a-beautiful-name"]').click();
    cy.wait('@chordSheetApi');
    cy.url().should('include', '/hillsong-worship/what-a-beautiful-name');

    // The chord sheet's own back button - distinct from the search results'.
    cy.get('[data-cy="chord-sheet-back-button"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/hillsong-worship`);
    cy.get('[data-cy="results-filter-input"]').should('have.value', '');

    cy.get('[data-cy="back-button"]').click();

    cy.url().should('include', 'q=hillsong');
    cy.contains('h2', 'Artists').should('be.visible');
    cy.get('[data-cy^="artist-title-"]').should('have.length', 2);
  });

  it('resets a selected section back to the overview when a genuinely new search runs', () => {
    cy.contains('h2', 'Artists').should('be.visible');

    search('worship');

    cy.contains('h2', 'Results').should('be.visible');
    cy.contains('h2', 'Artists').should('not.exist');
  });
});
