// cypress/e2e/tab-state-persistence.cy.ts
// Cypress E2E tests for tab state persistence and URL parameter preservation

describe('Tab State Persistence', () => {
  beforeEach(() => {
    // Reset any localStorage state between tests
    cy.clearLocalStorage();
    // Visit the homepage before each test
    cy.visit('/');
  });

  describe('URL Parameter Persistence', () => {
    it('should preserve search URL parameters when switching tabs', () => {
      // Navigate directly to search with parameters
      cy.visit('/search?artist=hillsong&song=oceans');
      
      // Verify we're on the search tab with correct URL
      cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
      cy.url().should('include', '/search?artist=hillsong&song=oceans');
      
      // Switch to Upload tab
      cy.get('[data-cy="tab-upload"]').click();
      cy.get('[data-cy="tab-upload"][data-state="active"]').should('contain.text', 'Upload');
      cy.url().should('include', '/upload');
      
      // Switch back to Search tab
      cy.get('[data-cy="tab-search"]').click();
      
      // CRITICAL TEST: URL parameters should be preserved
      cy.url().should('include', '/search');
      cy.url().should('include', 'artist=hillsong');
      cy.url().should('include', 'song=oceans');
      cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    });

    it('should preserve artist-only search parameters when switching tabs', () => {
      // Navigate to artist-only search
      cy.visit('/search?artist=oasis');
      
      // Verify correct tab and URL
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
      cy.url().should('include', '/search?artist=oasis');
      
      // Switch to My Chord Sheets tab
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.url().should('include', '/my-chord-sheets');
      
      // Switch back to Search tab
      cy.get('[data-cy="tab-search"]').click();
      
      // Artist parameter should be preserved
      cy.url().should('include', '/search?artist=oasis');
    });

    it('should preserve song-only search parameters when switching tabs', () => {
      // Navigate to song-only search
      cy.visit('/search?song=wonderwall');
      
      // Verify correct tab and URL
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
      cy.url().should('include', '/search?song=wonderwall');
      
      // Switch to Upload tab and back
      cy.get('[data-cy="tab-upload"]').click();
      cy.get('[data-cy="tab-search"]').click();
      
      // Song parameter should be preserved
      cy.url().should('include', '/search?song=wonderwall');
    });

    it('should handle complex URL parameters with special characters', () => {
      // Test URL with encoded special characters
      cy.visit('/search?artist=guns-n-roses&song=sweet-child-o-mine');
      
      // Verify correct navigation
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
      cy.url().should('include', 'artist=guns-n-roses');
      cy.url().should('include', 'song=sweet-child-o-mine');
      
      // Switch tabs and return
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.get('[data-cy="tab-search"]').click();
      
      // Complex parameters should be preserved
      cy.url().should('include', 'artist=guns-n-roses');
      cy.url().should('include', 'song=sweet-child-o-mine');
    });
  });

  describe('Search State Persistence', () => {
    it('should preserve search form state when switching tabs after search submission', () => {
      // Go to Search tab
      cy.get('[data-cy="tab-search"]').click();

      // Fill in search fields and submit
      cy.get('input[placeholder="Artist"]').type('The Beatles');
      cy.get('input[placeholder="Song"]').type('Yesterday');
      
      // Submit the search to commit the values to URL/state
      cy.get('form').submit();
      
      // Wait a moment for search state to be set
      cy.wait(500);

      // Switch to another tab and back
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.get('[data-cy="tab-search"]').click();

      // The search fields should still be filled (from URL parameters)
      cy.get('input[placeholder="Artist"]').should('have.value', 'The Beatles');
      cy.get('input[placeholder="Song"]').should('have.value', 'Yesterday');
    });

    it('should preserve form state when switching tabs without submitting search', () => {
      // Go to Search tab
      cy.get('[data-cy="tab-search"]').click();

      // Fill in search fields but DON'T submit
      cy.get('input[placeholder="Artist"]').type('The Beatles');
      cy.get('input[placeholder="Song"]').type('Yesterday');

      // Switch to another tab and back
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.get('[data-cy="tab-search"]').click();

      // The search fields should still be filled (form state should persist)
      cy.get('input[placeholder="Artist"]').should('have.value', 'The Beatles');
      cy.get('input[placeholder="Song"]').should('have.value', 'Yesterday');
    });

    it('should preserve search results when switching tabs after search', () => {
      cy.get('[data-cy="tab-search"]').click();
      
      // Fill in search fields and submit
      cy.get('input[placeholder="Artist"]').type('Test Artist');
      
      // Submit the search if button exists
      cy.get('body').then($body => {
        if ($body.find('button:contains("Search")').length > 0) {
          cy.contains(/search/i).click();
          cy.wait(1000); // Wait for any results or loading state
        } else {
          // If no search button, submit the form
          cy.get('form').submit();
          cy.wait(500);
        }
      });
      
      // Switch tabs and return
      cy.get('[data-cy="tab-upload"]').click();
      cy.get('[data-cy="tab-search"]').click();
      
      // Search form should still show the artist (from URL parameters)
      cy.get('input[placeholder="Artist"]').should('have.value', 'Test Artist');
    });
  });

  describe('Tab Navigation Behavior', () => {
    it('should maintain active tab state during URL navigation', () => {
      // Start on default tab (My Chord Sheets)
      cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('exist');
      
      // Navigate to search with parameters via URL
      cy.visit('/search?artist=test');
      
      // Should automatically activate Search tab
      cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
      cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('not.exist');
    });

    it('should handle multiple tab switches with different URLs', () => {
      const testSequence = [
        { tab: 'search', url: '/search?artist=oasis', param: 'artist=oasis' },
        { tab: 'upload', url: '/upload', param: null },
        { tab: 'my-chord-sheets', url: '/my-chord-sheets', param: null },
        { tab: 'search', url: '/search', param: 'artist=oasis' } // Should restore params
      ];

      // Start with search parameters
      cy.visit('/search?artist=oasis');
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');

      // Test each transition in sequence
      testSequence.forEach((step, index) => {
        if (index === 0) return; // Skip first as we already visited

        cy.get(`[data-cy="tab-${step.tab}"]`).click();
        cy.url().should('include', step.url.split('?')[0]);
        
        if (step.param) {
          cy.url().should('include', step.param);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search parameters gracefully', () => {
      // Navigate to search without parameters
      cy.visit('/search');
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
      
      // Switch tabs and return
      cy.get('[data-cy="tab-upload"]').click();
      cy.get('[data-cy="tab-search"]').click();
      
      // Should still be on search tab with clean URL
      cy.url().should('include', '/search');
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
    });

    it('should handle malformed URL parameters', () => {
      // Visit with malformed parameters
      cy.visit('/search?artist=&song=');
      
      // Should still work and activate search tab
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
      
      // Tab switching should still work
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.get('[data-cy="tab-search"]').click();
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
    });

    it('should preserve parameters when refreshing the page', () => {
      // Navigate to search with parameters
      cy.visit('/search?artist=radiohead&song=creep');
      cy.get('[data-cy="tab-search"][data-state="active"]').should('exist');
      
      // Refresh the page
      cy.reload();
      
      // Parameters and tab state should be preserved
      cy.url().should('include', '/search?artist=radiohead&song=creep');
      cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    });
  });

  describe('My Chord Sheets Tab Persistence', () => {
    it('should preserve scroll position when switching tabs', () => {
      // Navigate to My Chord Sheets tab
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      
      // Try to scroll the song list if it exists
      cy.get('[data-cy="song-list"]', { timeout: 5000 }).then($songList => {
        if ($songList.length > 0) {
          // Scroll the list
          cy.wrap($songList).scrollTo(0, 200);
          
          // Switch tabs
          cy.get('[data-cy="tab-search"]').click();
          cy.get('[data-cy="tab-my-chord-sheets"]').click();
          
          // Simple scroll position check
          cy.wrap($songList).its('0.scrollTop').should('be.greaterThan', 100);
        }
      });
    });
  });
});
