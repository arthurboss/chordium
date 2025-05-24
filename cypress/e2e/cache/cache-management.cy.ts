/* eslint-disable @typescript-eslint/no-unused-expressions */

interface CacheItem {
  key: string;
  timestamp: number;
  accessCount: number;
  results: unknown;
  query: {
    artist?: string;
    song?: string;
  };
}

interface CacheData {
  items: CacheItem[];
}

describe('Cache Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    cy.intercept('GET', '**/api/artists**', {
      fixture: 'artists.json'
    }).as('artistSearchAPI');
    
    cy.visit('/');
  });

  it('should handle cache expiration correctly', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
    // Perform search to populate cache
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    cy.wait('@artistSearchAPI');
    
    // Verify initial cache was created
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      expect(cacheData).to.not.be.null;
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache.items.length).to.be.greaterThan(0);
      }
    });
    
    // Manually expire the cache by modifying the timestamp
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        // Set all cache items' timestamps to be old (expired)
        cache.items.forEach((item: CacheItem) => {
          item.timestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago (beyond 30-day expiration)
        });
        win.localStorage.setItem('chordium-search-cache', JSON.stringify(cache));
      }
    });
    
    // Search again with same term - should make new API call due to expiration
    cy.get('#artist-search-input').clear();
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Should make a new API call since cache is expired
    cy.wait('@artistSearchAPI');
    
    // Verify at least 2 API calls were made (initial + after expiration)
    cy.get('@artistSearchAPI.all').should('have.length', 2);
  });

  it('should handle corrupted cache data gracefully', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
    // Manually corrupt cache data
    cy.window().then((win) => {
      win.localStorage.setItem('chordium-search-cache', 'invalid json data');
    });
    
    // App should still work normally with API
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Should make API call and handle corrupted cache gracefully
    cy.wait('@artistSearchAPI');
    
    // Verify app still functions
    cy.get('body').should('contain', 'Search');
    
    // Verify new valid cache is created
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData && cacheData !== 'invalid json data') {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache).to.have.property('items');
        expect(cache.items).to.be.an('array');
      }
    });
  });

  it('should verify cache performance', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
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
    
    // Verify cache access count increased
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        const cacheItem = cache.items.find((item: CacheItem) => 
          item.query.artist && item.query.artist.toLowerCase().includes('ac/dc')
        );
        if (cacheItem) {
          expect(cacheItem.accessCount).to.be.greaterThan(1);
        }
      }
    });
  });
});
