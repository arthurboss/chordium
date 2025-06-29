describe('My Songs Navigation Verification', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Ensure we're on the My Songs tab
    cy.get('button[role="tab"]').contains('My Songs').click();
    cy.get('[data-cy="tab-my-songs"][data-state="active"]').should('contain.text', 'My Songs');
    
    // Wait for songs to load
    cy.contains('Hotel California').should('be.visible');
  });

  it('should navigate to ChordViewer when clicking on songs (expected behavior)', () => {
    // Click on the View Chords button for the first song
    cy.contains('View Chords').first().click();
    
    // Should navigate to the ChordViewer page (not the tabbed interface)
    cy.url().should('include', '/my-songs');
    cy.url().should('match', /\/my-songs\/[\w-]+\/[\w-]+/); // Should be /my-songs/artist/song
    
    // Should show the chord viewer interface with back button
    cy.get('body').should('contain', 'Back to My Songs');
    
    // Should NOT show the tab interface (we're in ChordViewer now)
    cy.get('[data-cy="tab-my-songs"]').should('not.exist');
  });

  it('should return to My Songs tab when clicking Back from ChordViewer', () => {
    // Navigate to a song
    cy.contains('View Chords').first().click();
    cy.url().should('match', /\/my-songs\/[\w-]+\/[\w-]+/);
    cy.get('body').should('contain', 'Back to My Songs');
    
    // Click the back button
    cy.contains('Back to My Songs').click();
    
    // Should return to the My Songs tab (this is where our fix applies)
    cy.url().should('include', '/my-songs');
    cy.url().should('not.match', /\/my-songs\/[\w-]+\/[\w-]+/); // Should not be artist/song route
    
    // Should show the My Songs tab as active (this was the bug)
    cy.get('[data-cy="tab-my-songs"][data-state="active"]').should('contain.text', 'My Songs');
    
    // Should show the song list again
    cy.contains('Hotel California').should('be.visible');
  });

  it('should handle songs without proper artist/title structure (main bug fix)', () => {
    // This test simulates the fallback case that was causing the bug
    // We'll check that even with query parameters, it stays on My Songs tab
    
    // Manually navigate to the problematic URL pattern that was causing the bug
    cy.visit('/my-songs?song=some-song-path');
    
    // Should still show My Songs tab as active (this was the bug)
    cy.get('[data-cy="tab-my-songs"][data-state="active"]').should('contain.text', 'My Songs');
    
    // URL should still include /my-songs
    cy.url().should('include', '/my-songs');
    cy.url().should('include', 'song=');
  });

  it('should not affect search functionality', () => {
    // Navigate to search tab
    cy.get('button[role="tab"]').contains('Search').click();
    
    // Should be on search tab
    cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    cy.url().should('include', '/search');
    
    // Search functionality should still work with query parameters
    cy.visit('/search?artist=test');
    cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
  });
});
