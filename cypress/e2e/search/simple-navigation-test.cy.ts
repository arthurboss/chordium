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
    
    // Should navigate to My Songs tab
    cy.get('[data-cy="tab-my-songs"][data-state="active"]', { timeout: 5000 }).should('contain.text', 'My Songs');
    cy.url().should('include', '/my-songs');
    
    // Should show the SongViewer component (not the song list)
    cy.get('.animate-fade-in').should('be.visible'); // SongViewer has this class
    cy.contains('button', 'Back to My Songs').should('be.visible');
  });
});
