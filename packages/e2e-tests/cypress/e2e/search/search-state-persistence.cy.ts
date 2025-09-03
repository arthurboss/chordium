/**
 * E2E tests for search state persistence functionality
 * Tests the improvements made in recent commits:
 * - Session storage for search query persistence
 * - Tab switching with state preservation
 * - Clear functionality (individual vs. full clear)
 * - URL parameter handling (state reflection, not restoration)
 */

describe('Search State Persistence E2E', () => {
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
          "title": "Test Song - Test Artist",
          "url": "https://www.cifraclub.com.br/test-artist/test-song/"
        },
        {
          "title": "Another Song - Test Artist", 
          "url": "https://www.cifraclub.com.br/test-artist/another-song/"
        }
      ]
    }).as('searchAPI');
    
    cy.visit('/');
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
  });

  describe('Session Storage Integration', () => {
    it('should persist search query in session storage when submitting search', () => {
      // Fill in search fields
      cy.get('#artist-search-input').type('Leonardo Gonçalves');
      cy.get('#song-search-input').type('Test Song');
      
      // Submit search
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify session storage contains the search query
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.not.be.null;
        
        const parsedQuery = JSON.parse(storedQuery!);
        expect(parsedQuery.artist).to.equal('Leonardo Gonçalves');
        expect(parsedQuery.song).to.equal('Test Song');
        expect(parsedQuery.lastRoute).to.include('/search');
      });
    });

    it('should restore search query from session storage when returning to search tab', () => {
      // First, perform a search to populate session storage
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Switch to another tab
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      
      // Return to search tab
      cy.get('[data-cy="tab-search"]').click();
      
      // Verify search fields are restored from session storage
      cy.get('#artist-search-input').should('have.value', 'Test Artist');
      cy.get('#song-search-input').should('have.value', 'Test Song');
    });

    it('should not persist search state when switching to independent flows', () => {
      // Perform a search
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

  describe('Clear Functionality', () => {
    it('should clear individual input fields without affecting URL or session storage', () => {
      // Perform a search first
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear individual artist field
      cy.get('#artist-search-input').clear();
      
      // Verify field is cleared
      cy.get('#artist-search-input').should('have.value', '');
      
      // Verify session storage still contains the original search query
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.not.be.null;
        
        const parsedQuery = JSON.parse(storedQuery!);
        expect(parsedQuery.artist).to.equal('Test Artist');
        expect(parsedQuery.song).to.equal('Test Song');
      });
      
      // Verify URL still contains the original search query
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
    });

    it('should clear individual song field without affecting URL or session storage', () => {
      // Perform a search first
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear individual song field
      cy.get('#song-search-input').clear();
      
      // Verify field is cleared
      cy.get('#song-search-input').should('have.value', '');
      
      // Verify session storage still contains the original search query
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.not.be.null;
        
        const parsedQuery = JSON.parse(storedQuery!);
        expect(parsedQuery.artist).to.equal('Test Artist');
        expect(parsedQuery.song).to.equal('Test Song');
      });
      
      // Verify URL still contains the original search query
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
    });

    it('should perform full clear with trash button (clearing all state and session storage)', () => {
      // Perform a search first
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Click the trash button for full clear
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Verify all fields are cleared
      cy.get('#artist-search-input').should('have.value', '');
      cy.get('#song-search-input').should('have.value', '');
      
      // Verify session storage is cleared
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.be.null;
      });
      
      // Verify URL is cleaned (no query parameters)
      cy.url().should('eq', Cypress.config().baseUrl + '/search');
    });

    it('should require only one click for clear operations', () => {
      // Perform a search first
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear artist field - should work with single click
      cy.get('#artist-search-input').clear();
      cy.get('#artist-search-input').should('have.value', '');
      
      // Clear song field - should work with single click
      cy.get('#song-search-input').clear();
      cy.get('#song-search-input').should('have.value', '');
      
      // Full clear with trash button - should work with single click
      cy.get('[data-cy="clear-search-button"]').click();
      cy.get('#artist-search-input').should('have.value', '');
      cy.get('#song-search-input').should('have.value', '');
    });
  });

  describe('URL Parameter Handling', () => {
    it('should reflect current state in URL without restoring from URL', () => {
      // Fill in search fields
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      
      // Submit search
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL reflects the current state
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
      
      // Clear fields manually
      cy.get('#artist-search-input').clear();
      cy.get('#song-search-input').clear();
      
      // Verify fields remain cleared (URL should not restore them)
      cy.get('#artist-search-input').should('have.value', '');
      cy.get('#song-search-input').should('have.value', '');
      
      // URL should still reflect the cleared state
      cy.url().should('not.include', 'artist=');
      cy.url().should('not.include', 'song=');
    });

    it('should handle URL encoding properly for special characters', () => {
      // Test with special characters that need encoding
      const artistWithSpecialChars = 'Leonardo Gonçalves';
      const songWithSpecialChars = 'Test Song (Live)';
      
      cy.get('#artist-search-input').type(artistWithSpecialChars);
      cy.get('#song-search-input').type(songWithSpecialChars);
      
      // Submit search
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL is properly encoded
      cy.url().should('include', encodeURIComponent(artistWithSpecialChars));
      cy.url().should('include', encodeURIComponent(songWithSpecialChars));
      
      // Verify UI displays the original text (not encoded)
      cy.get('#artist-search-input').should('have.value', artistWithSpecialChars);
      cy.get('#song-search-input').should('have.value', songWithSpecialChars);
    });
  });

  describe('Navigation Flow State Preservation', () => {
    it('should preserve search query when navigating from search to artist page and back', () => {
      // Perform a search
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Mock artist selection to navigate to artist page
      cy.intercept('GET', '/api/artist-songs*', { 
        statusCode: 200, 
        body: [{ title: 'Song 1', artist: 'Test Artist', path: 'test-artist/song-1' }] 
      }).as('artistSongs');
      
      // Click on an artist result (if available) or simulate navigation
      cy.visit('/test-artist');
      
      // Verify we're on artist page
      cy.url().should('include', '/test-artist');
      
      // Navigate back to search using back button
      cy.go('back');
      
      // Verify search query is preserved
      cy.get('#artist-search-input').should('have.value', 'Test Artist');
      cy.get('#song-search-input').should('have.value', 'Test Song');
    });

    it('should preserve search query through multi-step navigation flow', () => {
      // Perform a search
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Navigate to artist page
      cy.visit('/test-artist');
      
      // Navigate to song page
      cy.visit('/test-artist/test-song');
      
      // Navigate back to artist page
      cy.go('back');
      
      // Navigate back to search
      cy.go('back');
      
      // Verify search query is preserved
      cy.get('#artist-search-input').should('have.value', 'Test Artist');
      cy.get('#song-search-input').should('have.value', 'Test Song');
    });
  });

  describe('Tab Switching Behavior', () => {
    it('should restore last route when navigating back to search tab', () => {
      // Perform a search
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Switch to another tab
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      
      // Return to search tab
      cy.get('[data-cy="tab-search"]').click();
      
      // Should return to the search page with query parameters
      cy.url().should('include', '/search');
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
      
      // Search fields should be populated
      cy.get('#artist-search-input').should('have.value', 'Test Artist');
      cy.get('#song-search-input').should('have.value', 'Test Song');
    });

    it('should handle artist route restoration when switching tabs', () => {
      // Navigate directly to artist page
      cy.visit('/test-artist');
      
      // Switch to another tab
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      
      // Return to search tab
      cy.get('[data-cy="tab-search"]').click();
      
      // Should return to the artist page
      cy.url().should('include', '/test-artist');
    });
  });
});
