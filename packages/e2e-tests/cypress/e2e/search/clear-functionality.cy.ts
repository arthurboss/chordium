/**
 * E2E tests for search clear functionality
 * Tests the improvements made in recent commits:
 * - Individual input field clears (preserve URL and session storage)
 * - Full clear with trash button (clear everything)
 * - Single-click clear operations (no double-click required)
 */

describe('Search Clear Functionality E2E', () => {
  beforeEach(() => {
    // Clear session storage and localStorage before each test
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });
    
    // Mock the search API to return consistent results
    cy.intercept('GET', '/api/search*', {
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

  describe('Individual Input Field Clearing', () => {
    it('should clear artist field individually without affecting URL or session storage', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify search was performed and URL updated
      cy.url().should('include', 'q=Test%20Artist%20Test%20Song');
      
      // Clear only the artist field
      cy.get('#search-input').clear();
      
      // Verify artist field is cleared
      cy.get('#search-input').should('have.value', '');
      cy.get('#search-input').should('have.value', 'Test Song');
      
      // Verify session storage still contains the original search query
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.not.be.null;
        
        const parsedQuery = JSON.parse(storedQuery!);
        expect(parsedQuery.artist).to.equal('Test Artist');
        expect(parsedQuery.song).to.equal('Test Song');
      });
      
      // Verify URL still contains the original search query (not cleared)
      cy.url().should('include', 'q=Test%20Artist%20Test%20Song');
    });

    it('should clear song field individually without affecting URL or session storage', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear only the song field
      cy.get('#search-input').clear();
      
      // Verify song field is cleared
      cy.get('#search-input').should('have.value', 'Test Artist');
      cy.get('#search-input').should('have.value', '');
      
      // Verify session storage still contains the original search query
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.not.be.null;
        
        const parsedQuery = JSON.parse(storedQuery!);
        expect(parsedQuery.artist).to.equal('Test Artist');
        expect(parsedQuery.song).to.equal('Test Song');
      });
      
      // Verify URL still contains the original search query
      cy.url().should('include', 'q=Test%20Artist%20Test%20Song');
    });

    it('should clear both fields individually without affecting URL or session storage', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear both fields individually
      cy.get('#search-input').clear();
      
      // Verify both fields are cleared
      cy.get('#search-input').should('have.value', '');
      
      // Verify session storage still contains the original search query
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.not.be.null;
        
        const parsedQuery = JSON.parse(storedQuery!);
        expect(parsedQuery.artist).to.equal('Test Artist');
        expect(parsedQuery.song).to.equal('Test Song');
      });
      
      // Verify URL still contains the original search query
      cy.url().should('include', 'q=Test%20Artist%20Test%20Song');
    });

    it('should require only one click for individual field clears', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear artist field with single click
      cy.get('#search-input').clear();
      cy.get('#search-input').should('have.value', '');
      
      // Clear song field with single click
      cy.get('#search-input').clear();
      cy.get('#search-input').should('have.value', '');
      
      // Verify both fields remain cleared
      cy.get('#search-input').should('have.value', '');
    });
  });

  describe('Full Clear with Trash Button', () => {
    it('should clear all input fields when using trash button', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Click the trash button for full clear
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Verify all fields are cleared
      cy.get('#search-input').should('have.value', '');
    });

    it('should clear session storage when using trash button', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify session storage contains the search query
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.not.be.null;
      });
      
      // Click the trash button for full clear
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Verify session storage is cleared
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.be.null;
      });
    });

    it('should clear URL parameters when using trash button', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Verify URL contains query parameters
      cy.url().should('include', 'q=Test%20Artist%20Test%20Song');
      
      // Click the trash button for full clear
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Verify URL is cleaned (no query parameters)
      cy.url().should('eq', Cypress.config().baseUrl + '/search');
    });

    it('should require only one click for trash button clear', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Click trash button once - should work immediately
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Verify everything is cleared with single click
      cy.get('#search-input').should('have.value', '');
      
      // Verify session storage is cleared
      cy.window().then((win) => {
        const storedQuery = win.sessionStorage.getItem('chordium_search_query');
        expect(storedQuery).to.be.null;
      });
      
      // Verify URL is cleaned
      cy.url().should('eq', Cypress.config().baseUrl + '/search');
    });
  });

  describe('Clear Behavior Consistency', () => {
    it('should maintain clear behavior after tab switching', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Switch to another tab and back
      cy.get('[data-cy="tab-my-chord-sheets"]').click();
      cy.get('[data-cy="tab-search"]').click();
      
      // Verify search state is restored
      cy.get('#search-input').should('have.value', 'Test Artist');
      cy.get('#search-input').should('have.value', 'Test Song');
      
      // Test individual field clear still works
      cy.get('#search-input').clear();
      cy.get('#search-input').should('have.value', '');
      
      // Test trash button clear still works
      cy.get('[data-cy="clear-search-button"]').click();
      cy.get('#search-input').should('have.value', '');
    });

    it('should handle clear operations with special characters', () => {
      // Test with special characters
      const artistWithSpecialChars = 'Leonardo Gonçalves';
      const songWithSpecialChars = 'Test Song (Live)';
      
      cy.get('#search-input').type(artistWithSpecialChars);
      cy.get('#search-input').type(songWithSpecialChars);
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear artist field
      cy.get('#search-input').clear();
      cy.get('#search-input').should('have.value', '');
      
      // Clear song field
      cy.get('#search-input').clear();
      cy.get('#search-input').should('have.value', '');
      
      // Use trash button for full clear
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Verify everything is cleared
      cy.get('#search-input').should('have.value', '');
    });
  });

  describe('Clear State Management', () => {
    it('should not trigger unnecessary API calls after clearing', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Intercept API calls
      cy.intercept('GET', '/api/*').as('apiCall');
      
      // Clear individual fields
      cy.get('#search-input').clear();
      
      // Wait a bit to ensure no API calls are made
      cy.wait(1000);
      
      // Verify no unexpected API calls were made
      cy.get('@apiCall.all').should('have.length', 0);
    });

    it('should maintain clear state after page refresh', () => {
      // Perform a search first
      cy.get('#search-input').type('Test Artist Test Song');
      cy.get('[data-cy="search-submit-button"]').click();
      
      // Wait for API call
      cy.wait('@searchAPI');
      
      // Clear fields
      cy.get('#search-input').clear();
      
      // Refresh the page
      cy.reload();
      
      // Navigate back to search tab
      cy.get('[data-cy="tab-search"]').click();
      
      // Fields should remain cleared (session storage preserved the cleared state)
      cy.get('#search-input').should('have.value', '');
    });
  });
});
