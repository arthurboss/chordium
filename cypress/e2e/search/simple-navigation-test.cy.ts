describe('Search to Song Navigation - Simple Test', () => {
  it('should navigate from search results to song view when clicking View Chords', () => {
    cy.visit('/');
    
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
    
    // Mock the search API with inline data
    cy.intercept('GET', '/api/cifraclub-search*', {
      statusCode: 200,
      body: [
        {
          title: 'Test Song',
          artist: 'Test Artist',
          path: 'https://example.com/test-song'
        }
      ]
    }).as('songSearch');

    // Perform a song search
    cy.get('#song-search-input').type('test song');
    cy.get('button[type="submit"]').click();
    
    // Wait for search results
    cy.wait('@songSearch');
    
    // Wait for the search results to appear
    cy.contains('Test Song', { timeout: 10000 }).should('be.visible');
    
    // Click on the "View Chords" button for the first result
    cy.get('[data-cy^="view-btn-compact-"]').first().click();
    
    // Should navigate to My Chord Sheets tab
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]', { timeout: 5000 }).should('contain.text', 'My Chord Sheets');
    cy.url().should('include', '/my-chord-sheets');
    
    // Should show the SongViewer component (not the song list)
    cy.get('.animate-fade-in').should('be.visible'); // SongViewer has this class
    cy.contains('button', 'Back to My Chord Sheets').should('be.visible');
  });

  it('should not show "No Chord Sheets were found." before any search, and should show it after a search with no results', () => {
    cy.visit('/');
    cy.get('[data-cy="tab-search"]').should('be.visible').click();

    // Before any search, the message should NOT be visible in the search results area
    cy.get('[data-cy="search-results-area"]').should('exist').within(() => {
      cy.get('[data-cy="search-no-chord-sheets-found"]').should('not.exist');
    });

    // Mock the search API to return empty results
    cy.intercept('GET', '/api/cifraclub-search*', []).as('emptySearch');

    // Perform a song search with no results
    cy.get('#song-search-input').type('nonexistentsongname12345');
    cy.get('button[type="submit"]').click();
    cy.wait('@emptySearch');

    // After search, the message should be visible in the search results area
    cy.get('[data-cy="search-results-area"]').within(() => {
      cy.get('[data-cy="search-no-chord-sheets-found"]').should('be.visible');
    });
  });
});
