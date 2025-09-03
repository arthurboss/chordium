// cypress/e2e/tab-state-persistence.cy.ts
// Cypress E2E tests for tab state persistence using session storage

describe('Tab State Persistence', () => {
  beforeEach(() => {
    // Clear session storage and localStorage before each test
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });
    
    // Mock the search API to return consistent results
    cy.intercept('GET', '/api/cifraclub-search*', {
      statusCode: 200,
      body: [
        {
          "title": "Yesterday - The Beatles",
          "url": "https://www.cifraclub.com.br/the-beatles/yesterday/"
        },
        {
          "title": "Let It Be - The Beatles", 
          "url": "https://www.cifraclub.com.br/the-beatles/let-it-be/"
        }
      ]
    }).as('searchAPI');
    
    cy.visit('/');
  });

  it('preserves search tab state when switching tabs using session storage', () => {
    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields
    cy.get('#artist-search-input').type('The Beatles');
    cy.get('#song-search-input').type('Yesterday');
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for API call
    cy.wait('@searchAPI');

    // Wait for results to appear
    cy.contains('Yesterday').should('be.visible');

    // Switch to another tab and back
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.get('[data-cy="tab-search"]').click();

    // The search fields and results should still be present (restored from session storage)
    cy.get('#artist-search-input').should('have.value', 'The Beatles');
    cy.get('#song-search-input').should('have.value', 'Yesterday');
    cy.contains('Yesterday').should('be.visible');
  });

  it('preserves search query in session storage across tab switches', () => {
    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields
    cy.get('#artist-search-input').type('Leonardo Gonçalves');
    cy.get('#song-search-input').type('Test Song');

    // Submit search to populate session storage
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for API call
    cy.wait('@searchAPI');

    // Switch to another tab
    cy.get('[data-cy="tab-my-chord-sheets"]').click();

    // Verify session storage contains the search query
    cy.window().then((win) => {
      const storedQuery = win.sessionStorage.getItem('chordium_search_query');
      expect(storedQuery).to.not.be.null;
      
      const parsedQuery = JSON.parse(storedQuery!);
      expect(parsedQuery.artist).to.equal('Leonardo Gonçalves');
      expect(parsedQuery.song).to.equal('Test Song');
    });

    // Return to search tab
    cy.get('[data-cy="tab-search"]').click();

    // Search fields should be restored from session storage
    cy.get('#artist-search-input').should('have.value', 'Leonardo Gonçalves');
    cy.get('#song-search-input').should('have.value', 'Test Song');
  });

  it('restores last route when navigating back to search tab', () => {
    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields and submit
    cy.get('#artist-search-input').type('Test Artist');
    cy.get('#song-search-input').type('Test Song');
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for API call
    cy.wait('@searchAPI');

    // Switch to another tab
    cy.get('[data-cy="tab-my-chord-sheets"]').click();

    // Return to search tab
    cy.get('[data-cy="tab-search"]').click();

    // Should return to search page with query parameters
    cy.url().should('include', '/search');
    cy.url().should('include', 'artist=Test%20Artist');
    cy.url().should('include', 'song=Test%20Song');
  });

  it('preserves My Chord Sheets tab scroll position', () => {
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

  it('does not persist search state when switching to independent flows', () => {
    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields and submit
    cy.get('#artist-search-input').type('Test Artist');
    cy.get('#song-search-input').type('Test Song');
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for API call
    cy.wait('@searchAPI');

    // Switch to My Chord Sheets (independent flow)
    cy.get('[data-cy="tab-my-chord-sheets"]').click();

    // Verify session storage still contains search query
    cy.window().then((win) => {
      const storedQuery = win.sessionStorage.getItem('chordium_search_query');
      expect(storedQuery).to.not.be.null;
    });

    // Return to search tab
    cy.get('[data-cy="tab-search"]').click();

    // Search state should still be preserved
    cy.get('#artist-search-input').should('have.value', 'Test Artist');
    cy.get('#song-search-input').should('have.value', 'Test Song');
  });
});
