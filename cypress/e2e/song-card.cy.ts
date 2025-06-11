describe('SongCard E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
    
    // Ensure we're on the My Songs tab
    cy.get('button[role="tab"]').contains('My Songs').click();
    cy.get('[data-cy="tab-my-songs"][data-state="active"]').should('contain.text', 'My Songs');
    
    // Wait for songs to load
    cy.contains('Hotel California').should('be.visible');
    
    // Get the song ID for Hotel California from the page
    cy.contains('[data-cy^="song-title-"]', 'Hotel California').then(($element) => {
      const attr = $element.attr('data-cy');
      const songId = attr?.replace('song-title-', '');
      cy.wrap(songId).as('hotelCaliforniaSongId');
    });
  });

  it('should navigate to chord sheet page when clicking View Chords button', () => {
    cy.get('@hotelCaliforniaSongId').then((songId) => {
      // Find Hotel California card and click its View Chords button
      cy.get(`[data-cy="view-chords-btn-${songId}"]`).click();
      
      // Verify that we've navigated to the chord sheet page
      cy.url().should('include', 'song=hotel-california');
      cy.contains('h1', 'Hotel California').should('be.visible');
      cy.contains('Eagles').should('be.visible');
      
      // Verify some chord content is visible - using a more general selector
      cy.contains('Em').should('be.visible');
    });
  });

  it('should navigate to chord sheet page when clicking the card content area', () => {
    cy.get('@hotelCaliforniaSongId').then((songId) => {
      // Find Hotel California card and click its content area
      cy.get(`[data-cy="song-card-content-${songId}"]`).click();
      
      // Verify that we've navigated to the chord sheet page
      cy.url().should('include', 'song=hotel-california');
      cy.contains('h1', 'Hotel California').should('be.visible');
      cy.contains('Eagles').should('be.visible');
    });
  });

  it('should delete the song when clicking the Trash button', () => {
    // First, verify we can see the Hotel California card
    cy.contains('[data-cy^="song-title-"]', 'Hotel California').should('be.visible');
    
    // Now get the reference to the Hotel California card
    cy.get('@hotelCaliforniaSongId').then((songId) => {
      // Click the trash button
      cy.get(`[data-cy="delete-song-btn-${songId}"]`).click();
      
      // Verify that the song card has been deleted
      cy.contains('[data-cy^="song-title-"]', 'Hotel California').should('not.exist');
      
      // Check that toast notification appears
      cy.contains('Song deleted').should('be.visible');
    });
  });
});
