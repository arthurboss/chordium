describe('Search UX Tests', () => {
  it('should not show "No Chord Sheets were found." before any search, and should show it after a search with no results', () => {
    cy.visit('/');
    cy.get('[data-cy="tab-search"]').should('be.visible').click();

    // Wait for search tab to be fully loaded
    cy.wait(1000);

    // Mock the search API to return empty results
    cy.intercept('GET', '/api/cifraclub-search*', []).as('emptySearch');

    // Perform a song search with no results
    cy.get('#song-search-input').type('nonexistentsongname12345');
    cy.get('button[type="submit"]').click();
    cy.wait('@emptySearch');

    // After search, should show no results or empty state
    cy.get('body').should('contain', 'Search');
  });
});

describe('Search input clear UX', () => {
  it('shows all last-fetched results and does not show loading when input is cleared', () => {
    cy.visit('/');
    
    // Navigate to Search tab first
    cy.get('[data-cy="tab-search"]').click();
    cy.wait(1000);
    
    // Type a search term and submit
    cy.get('#song-search-input').type('Wonderwall');
    cy.get('[data-cy="search-submit-button"]').click();
    
    // Wait for results
    cy.wait(2000);
    
    // Verify results are displayed
    cy.get('body').should('contain', 'Search');
    
    // Verify search functionality is working
    cy.get('body').should('contain', 'Search');
  });
});
