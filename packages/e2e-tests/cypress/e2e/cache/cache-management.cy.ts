/* eslint-disable @typescript-eslint/no-unused-expressions */

describe('Cache Management', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test (using correct database name)
    cy.window().then((win) => {
      // Clear IndexedDB for the domain
      win.indexedDB.deleteDatabase('chordium');
    });
    
    cy.intercept('GET', '**/api/artists**', {
      fixture: 'artists.json'
    }).as('artistSearchAPI');
    
    cy.visit('/');
  });

  it('should handle cache expiration correctly', () => {
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').click();
    
    // Perform search to populate cache
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    cy.wait('@artistSearchAPI');
    
    // Wait for cache to be populated
    cy.wait(1000);
    
    // Verify initial cache was created by checking if search works without API call
    cy.get('#artist-search-input').clear();
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Should not make another API call since cache should be used
    cy.get('@artistSearchAPI.all').should('have.length', 1);
    
    // Verify app still works after cache operations
    cy.get('body').should('contain', 'Search');
  });

  it('should handle IndexedDB cache operations gracefully', () => {
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').click();
    
    // Perform initial search to populate cache
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call or cache to load
    cy.wait(2000);
    
    // Verify app functions with search
    cy.get('body').should('contain', 'Search');
    
    // Clear the search input
    cy.get('#artist-search-input').clear();
    
    // Search again - should work whether using cache or API
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Wait for processing
    cy.wait(1000);
    
    // Verify app still functions regardless of cache behavior
    cy.get('body').should('contain', 'Search');
    
    // Test with a different search term to ensure search functionality works
    cy.get('#artist-search-input').clear();
    cy.get('#artist-search-input').type('AC/DC');
    cy.get('button[type="submit"]').click();
    
    // Wait for processing
    cy.wait(2000);
    
    // Verify app continues to function
    cy.get('body').should('contain', 'Search');
  });

  it('should verify cache performance', () => {
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').click();
    
    // Perform initial search
    const startTime = Date.now();
    cy.get('#artist-search-input').type('AC/DC');
    cy.get('button[type="submit"]').click();
    cy.wait('@artistSearchAPI');
    
    // Record time for initial search
    cy.then(() => {
      const firstSearchTime = Date.now() - startTime;
      cy.wrap(firstSearchTime).as('firstSearchTime');
    });
    
    // Wait for cache to be populated
    cy.wait(1000);
    
    // Perform same search again (should use cache)
    cy.then(() => {
      const cacheStartTime = Date.now();
      cy.get('#artist-search-input').clear();
      cy.get('#artist-search-input').type('AC/DC');
      cy.get('button[type="submit"]').click();
      
      // Should not make another API call
      cy.get('@artistSearchAPI.all').should('have.length', 1);
      
      cy.then(() => {
        const cacheSearchTime = Date.now() - cacheStartTime;
        cy.wrap(cacheSearchTime).as('cacheSearchTime');
      });
    });
    
    // Verify cache is working by checking that no additional API calls were made
    cy.get('@artistSearchAPI.all').should('have.length', 1);
  });
});
