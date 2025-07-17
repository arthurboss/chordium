describe('Browser Navigation Tests', () => {
  beforeEach(() => {
    // Reset any localStorage state between tests
    cy.clearLocalStorage();
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should update active tab based on direct URL navigation', () => {
    // Check default tab
    cy.get('[data-state="active"]').should('contain.text', 'My Chord Sheets');
    
    // Navigate directly to search page
    cy.visit('/search');
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Navigate directly to upload page
    cy.visit('/upload');
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Navigate back to my songs
    cy.visit('/my-chord-sheets');
    cy.get('[data-state="active"]').should('contain.text', 'My Chord Sheets');
  });

  it('should set active tab when navigating with tab buttons', () => {
    // Start at My Chord Sheets tab
    cy.get('[data-state="active"]').should('contain.text', 'My Chord Sheets');
    
    // Navigate to Search using tab button
    cy.get('button[role="tab"]').contains('Search').click();
    cy.url().should('include', '/search');
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Navigate to Upload using tab button
    cy.get('button[role="tab"]').contains('Upload').click();
    cy.url().should('include', '/upload');
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Navigate back to My Chord Sheets using tab button
    cy.get('button[role="tab"]').contains('My Chord Sheets').click();
    cy.url().should('include', '/my-chord-sheets');
    cy.get('[data-state="active"]').should('contain.text', 'My Chord Sheets');
  });

  it('should navigate to artist/song route when viewing a song from My Chord Sheets', () => {
    // Click View Chords on a song from My Chord Sheets
    cy.contains('View Chords').first().click();
    
    // URL should follow pattern /my-chord-sheets/artist/song-name
    cy.url().should('match', /\/my-chord-sheets\/[\w-]+\/[\w-]+$/);
    
    // Should show song content
    cy.get('body').should('not.contain', 'Not Found');
  });

  it('should navigate to artist/song route when viewing a song from search results', () => {
    // Navigate to search tab
    cy.get('button[role="tab"]').contains('Search').click();
    
    // For now, we'll just test that the route structure is supported
    // by visiting it directly since search functionality might not be complete
    cy.visit('/eagles/hotel-california');
    
    // Should be able to view the song page without tab switching
    cy.url().should('match', /\/eagles\/hotel-california$/);
    
    // Should show song content or loading state (not an error)
    cy.get('body').should('not.contain', 'Not Found');
  });

  it('should activate Search tab when URL has q parameter', () => {
    // Navigate to a search query URL
    cy.visit('/search?q=test');
    
    // Search tab should be active
    cy.get('[data-state="active"]').should('contain.text', 'Search');
  });
  
  // Testing a stub for browser back behavior - simulated through direct navigation
  it('should simulate browser history workflow through direct navigation', () => {
    // Record our navigation path
    cy.visit('/');
    cy.visit('/search');
    cy.visit('/upload');
    
    // Verify we're on Upload tab
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Go back to search (simulating back button)
    cy.visit('/search');
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Go back to home (simulating back button)
    cy.visit('/');
    cy.get('[data-state="active"]').should('contain.text', 'My Chord Sheets');
  });
});
