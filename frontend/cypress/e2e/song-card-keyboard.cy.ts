describe.skip('SongCard Interactive Elements Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
    
    // Ensure we're on the My Chord Sheets tab
    cy.get('button[role="tab"]').contains('My Chord Sheets').click();
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('contain.text', 'My Chord Sheets');
    
    // Wait for songs to load
    cy.contains('Hotel California').should('be.visible');
    
    // Get the song ID for Hotel California from the page
    cy.contains('[data-cy^="song-title-"]', 'Hotel California').then(($element) => {
      const attr = $element.attr('data-cy');
      const songId = attr?.replace('song-title-', '');
      cy.wrap(songId).as('hotelCaliforniaSongId');
    });
  });

  it.skip('should verify View Chords button has proper keyboard attributes', () => {
    cy.get('@hotelCaliforniaSongId').then((songId) => {
      // Verify the View Chords button has proper keyboard attributes
      cy.get(`[data-cy="view-chords-btn-${songId}"]`)
        .should('have.attr', 'tabindex', '0')
        .should('have.attr', 'aria-label', 'View chords for Hotel California');
      
      // Use click for reliability in testing
      cy.get(`[data-cy="view-chords-btn-${songId}"]`).click();
      
      // Verify that we've navigated to the chord sheet page
      cy.url().should('include', 'song=hotel-california');
      cy.contains('h1', 'Hotel California').should('be.visible');
      cy.contains('Eagles').should('be.visible');
    });
  });

  it.skip('should verify Delete button has proper keyboard attributes', () => {
    cy.get('@hotelCaliforniaSongId').then((songId) => {
      // Verify the Delete button has proper keyboard attributes
      cy.get(`[data-cy="delete-song-btn-${songId}"]`)
        .should('have.attr', 'tabindex', '0')
        .should('have.attr', 'aria-label', 'Delete Hotel California');
      
      // Use click for reliability in testing
      cy.get(`[data-cy="delete-song-btn-${songId}"]`).click();
      
      // Verify that the song card has been deleted
      cy.contains('[data-cy^="song-title-"]', 'Hotel California').should('not.exist');
      
      // Check that toast notification appears
      cy.contains('Song deleted').should('be.visible');
    });
  });
});
