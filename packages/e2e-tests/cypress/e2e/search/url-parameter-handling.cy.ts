/**
 * E2E tests for URL parameter handling functionality
 * Tests the improvements made in recent commits:
 * - URL reflects current state (state → URL)
 * - URL does not drive input field state (URL ↛ state)
 * - Proper URL encoding for special characters
 * - URL parameter cleanup on full clear
 */

describe('URL Parameter Handling E2E', () => {
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

  describe('State to URL Reflection', () => {
    it('should reflect search input state in URL parameters', () => {
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
    });

    it('should update URL when search state changes', () => {
      // Start with empty search
      cy.url().should('not.include', 'artist=');
      cy.url().should('not.include', 'song=');
      
      // Add artist only
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // URL should reflect artist only
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('not.include', 'song=');
      
      // Add song
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // URL should reflect both artist and song
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
    });

    it('should reflect cleared state in URL', () => {
      // Perform a search first
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL contains parameters
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
      
      // Clear fields manually
      cy.get('#artist-search-input').clear();
      cy.get('#song-search-input').clear();
      
      // URL should reflect cleared state
      cy.url().should('not.include', 'artist=');
      cy.url().should('not.include', 'song=');
    });
  });

  describe('URL to State Independence', () => {
    it('should not restore input field values from URL parameters', () => {
      // Navigate to a URL with search parameters
      cy.visit('/search?artist=URL%20Artist&song=URL%20Song');
      
      // Input fields should NOT be populated from URL parameters
      // They should only get values from session storage or user input
      cy.get('#artist-search-input').should('have.value', '');
      cy.get('#song-search-input').should('have.value', '');
    });

    it('should not restore state when manually typing URL with parameters', () => {
      // Start with clean search
      cy.get('#artist-search-input').should('have.value', '');
      cy.get('#song-search-input').should('have.value', '');
      
      // Manually navigate to URL with parameters
      cy.visit('/search?artist=Manual%20Artist&song=Manual%20Song');
      
      // Input fields should remain empty (URL does not drive state)
      cy.get('#artist-search-input').should('have.value', '');
      cy.get('#song-search-input').should('have.value', '');
    });

    it('should maintain URL independence after tab switching', () => {
      // Perform a search to populate session storage
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Switch to another tab and back
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.get('[data-cy="tab-search"]').click();
      
      // Search fields should be restored from session storage, not URL
      cy.get('#artist-search-input').should('have.value', 'Test Artist');
      cy.get('#song-search-input').should('have.value', 'Test Song');
      
      // URL should reflect the current state
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
    });
  });

  describe('URL Encoding and Special Characters', () => {
    it('should properly encode special characters in URL', () => {
      // Test with various special characters
      const artistWithSpecialChars = 'Leonardo Gonçalves';
      const songWithSpecialChars = 'Test Song (Live) - Version 2.0';
      
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

    it('should handle spaces and punctuation correctly', () => {
      // Test with spaces and punctuation
      const artistWithSpaces = 'The Beatles';
      const songWithPunctuation = 'Hey Jude!';
      
      cy.get('#artist-search-input').type(artistWithSpaces);
      cy.get('#song-search-input').type(songWithPunctuation);
      
      // Submit search
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL encoding
      cy.url().should('include', encodeURIComponent(artistWithSpaces));
      cy.url().should('include', encodeURIComponent(songWithPunctuation));
      
      // Verify UI displays original text
      cy.get('#artist-search-input').should('have.value', artistWithSpaces);
      cy.get('#song-search-input').should('have.value', songWithPunctuation);
    });

    it('should handle non-ASCII characters properly', () => {
      // Test with non-ASCII characters
      const artistWithNonASCII = 'José González';
      const songWithNonASCII = 'Café del Mar';
      
      cy.get('#artist-search-input').type(artistWithNonASCII);
      cy.get('#song-search-input').type(songWithNonASCII);
      
      // Submit search
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL encoding
      cy.url().should('include', encodeURIComponent(artistWithNonASCII));
      cy.url().should('include', encodeURIComponent(songWithNonASCII));
      
      // Verify UI displays original text
      cy.get('#artist-search-input').should('have.value', artistWithNonASCII);
      cy.get('#song-search-input').should('have.value', songWithNonASCII);
    });
  });

  describe('URL Parameter Cleanup', () => {
    it('should clean URL parameters on full clear with trash button', () => {
      // Perform a search first
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL contains parameters
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
      
      // Use trash button for full clear
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Verify URL is cleaned (no query parameters)
      cy.url().should('eq', Cypress.config().baseUrl + '/search');
    });

    it('should preserve URL parameters on individual field clears', () => {
      // Perform a search first
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear individual fields
      cy.get('#artist-search-input').clear();
      cy.get('#song-search-input').clear();
      
      // URL should still contain the original search query
      // (Individual clears don't affect URL - only trash button does)
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
    });

    it('should handle URL cleanup after navigation', () => {
      // Perform a search
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Navigate to artist page
      cy.visit('/test-artist');
      
      // Navigate back to search
      cy.go('back');
      
      // Use trash button to clear
      cy.get('[data-cy="clear-search-button"]').click();
      
      // URL should be cleaned
      cy.url().should('eq', Cypress.config().baseUrl + '/search');
    });
  });

  describe('URL State Synchronization', () => {
    it('should maintain URL state consistency with input changes', () => {
      // Start with empty search
      cy.url().should('not.include', 'artist=');
      cy.url().should('not.include', 'song=');
      
      // Type in artist field
      cy.get('#artist-search-input').type('Test Artist');
      
      // URL should not change until search is submitted
      cy.url().should('not.include', 'artist=');
      
      // Submit search
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Now URL should reflect the state
      cy.url().should('include', 'artist=Test%20Artist');
    });

    it('should handle URL updates when search type changes', () => {
      // Start with artist-only search
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // URL should have artist only
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('not.include', 'song=');
      
      // Add song to search
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // URL should now have both
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
    });

    it('should preserve URL state during tab switching', () => {
      // Perform a search
      cy.get('#artist-search-input').type('Test Artist');
      cy.get('#song-search-input').type('Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL state
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
      
      // Switch tabs and return
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.get('[data-cy="tab-search"]').click();
      
      // URL state should be preserved
      cy.url().should('include', 'artist=Test%20Artist');
      cy.url().should('include', 'song=Test%20Song');
    });
  });
});
