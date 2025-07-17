describe('My Chord Sheets Navigation Verification', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Ensure we're on the My Chord Sheets tab
    cy.get('button[role="tab"]').contains('My Chord Sheets').click();
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('contain.text', 'My Chord Sheets');
    
    // Wait for songs to load
    cy.contains('Hotel California').should('be.visible');
  });

  it('should navigate to ChordViewer when clicking on songs (expected behavior)', () => {
    // Click on the View Chords button for the first song
    cy.contains('View Chords').first().click();
    
    // Should navigate to the ChordViewer page (not the tabbed interface)
    cy.url().should('include', '/my-chord-sheets');
    cy.url().should('match', /\/my-chord-sheets\/[\w-]+\/[\w-]+/); // Should be /my-chord-sheets/artist/song
    
    // Should show the chord viewer interface with back button
    cy.get('body').should('contain', 'Back to My Chord Sheets');
    
    // Should NOT show the tab interface (we're in ChordViewer now)
    cy.get('[data-cy="tab-my-chord-sheets"]').should('not.exist');
  });

  it('should return to My Chord Sheets tab when clicking Back from ChordViewer', () => {
    // Navigate to a song
    cy.contains('View Chords').first().click();
    cy.url().should('match', /\/my-chord-sheets\/[\w-]+\/[\w-]+/);
    cy.get('body').should('contain', 'Back to My Chord Sheets');
    
    // Click the back button
    cy.contains('Back to My Chord Sheets').click();
    
    // Should return to the My Chord Sheets tab (this is where our fix applies)
    cy.url().should('include', '/my-chord-sheets');
    cy.url().should('not.match', /\/my-chord-sheets\/[\w-]+\/[\w-]+/); // Should not be artist/song route
    
    // Should show the My Chord Sheets tab as active (this was the bug)
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('contain.text', 'My Chord Sheets');
    
    // Should show the song list again
    cy.contains('Hotel California').should('be.visible');
  });

  it('should handle songs without proper artist/title structure (main bug fix)', () => {
    // This test simulates the fallback case that was causing the bug
    // We'll check that even with query parameters, it stays on My Chord Sheets tab
    
    // Manually navigate to the problematic URL pattern that was causing the bug
    cy.visit('/my-chord-sheets?song=some-song-path');
    
    // Should still show My Chord Sheets tab as active (this was the bug)
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('contain.text', 'My Chord Sheets');
    
    // URL should still include /my-chord-sheets
    cy.url().should('include', '/my-chord-sheets');
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
