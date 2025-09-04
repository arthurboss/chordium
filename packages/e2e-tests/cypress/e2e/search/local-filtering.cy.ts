/**
 * E2E tests for local filtering functionality
 * Tests the real-time filtering of search results when typing in input fields
 * after a search has been performed. This covers the fix for artist input
 * filtering in song search mode.
 * 
 * ⚠️  IMPORTANT: These tests use real API calls to test the actual filtering
 * functionality. They should only be run locally to avoid unnecessary
 * scraping load and potential rate limiting issues.
 * 
 * To run these tests locally: npm run test:dev -- --spec "cypress/e2e/search/local-filtering.cy.ts"
 */

describe('Local Filtering E2E', () => {
  beforeEach(() => {
    // Clear session storage and localStorage before each test
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });
    
    cy.visit('/');
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
  });

  describe('Song Search Local Filtering', () => {
    it('should filter results by artist name when typing in artist input field during song search', () => {
      // Perform a song search (song-only search) - use a real search term
      cy.get('#song-search-input').type('test');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for results to load
      cy.get('[data-cy="search-results-area"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy^="song-card-compact-"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
      
      // Get initial count of results
      cy.get('[data-cy^="song-card-compact-"]').then(($cards) => {
        const initialCount = $cards.length;
        
        // Type in artist input field to filter by artist name
        cy.get('#artist-search-input').type('Classic');
        
        // Wait a moment for filtering to take effect
        cy.wait(500);
        
        // Verify results are filtered (should be fewer results)
        cy.get('[data-cy^="song-card-compact-"]').should('have.length.lessThan', initialCount);
        
        // Verify filtered results contain the artist name
        cy.get('[data-cy^="song-card-compact-"]').should('contain', 'Classic');
        
        // Clear artist filter
        cy.get('#artist-search-input').clear();
        
        // Wait for filtering to reset
        cy.wait(500);
        
        // Verify all results are visible again
        cy.get('[data-cy^="song-card-compact-"]').should('have.length', initialCount);
      });
    });

    it('should filter results by song title when typing in song input field during song search', () => {
      // Perform a song search
      cy.get('#song-search-input').type('test');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for results to load
      cy.get('[data-cy="search-results-area"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy^="song-card-compact-"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
      
      // Get initial count of results
      cy.get('[data-cy^="song-card-compact-"]').then(($cards) => {
        const initialCount = $cards.length;
        
        // Type in song input field to filter by song title
        cy.get('#song-search-input').clear().type('Test');
        
        // Wait a moment for filtering to take effect
        cy.wait(500);
        
        // Verify results are filtered (should be fewer results)
        cy.get('[data-cy^="song-card-compact-"]').should('have.length.lessThan', initialCount);
        
        // Verify filtered results contain the song title
        cy.get('[data-cy^="song-card-compact-"]').should('contain', 'Test');
        
        // Clear song filter
        cy.get('#song-search-input').clear().type('test');
        
        // Wait for filtering to reset
        cy.wait(500);
        
        // Verify all results are visible again
        cy.get('[data-cy^="song-card-compact-"]').should('have.length', initialCount);
      });
    });

    it('should filter results by both artist and song when using both input fields', () => {
      // Perform a song search
      cy.get('#song-search-input').type('test');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for results to load
      cy.get('[data-cy="search-results-area"]', { timeout: 15000 }).should('be.visible');
      cy.get('[data-cy^="song-card-compact-"]', { timeout: 15000 }).should('have.length.greaterThan', 0);
      
      // Get initial count of results
      cy.get('[data-cy^="song-card-compact-"]').then(($cards) => {
        const initialCount = $cards.length;
        
        // Filter by artist name
        cy.get('#artist-search-input').type('Classic');
        cy.wait(500);
        
        // Should have fewer results
        cy.get('[data-cy^="song-card-compact-"]').should('have.length.lessThan', initialCount);
        
        // Also filter by song title
        cy.get('#song-search-input').clear().type('Test');
        cy.wait(500);
        
        // Should have even fewer results (both filters applied)
        cy.get('[data-cy^="song-card-compact-"]').should('have.length.lessThan', initialCount);
        
        // Clear both filters
        cy.get('#artist-search-input').clear();
        cy.get('#song-search-input').clear().type('test');
        cy.wait(500);
        
        // Verify all results are visible again
        cy.get('[data-cy^="song-card-compact-"]').should('have.length', initialCount);
      });
    });
  });
});
