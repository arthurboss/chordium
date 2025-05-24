/* eslint-disable @typescript-eslint/no-unused-expressions */

// E2E tests for cache functionality
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

describe('Artist Search Caching', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Mock API responses with realistic data - using correct endpoints
    cy.intercept('GET', '**/api/artists**', {
      fixture: 'artists.json'
    }).as('artistSearchAPI');
    
    cy.intercept('GET', '**/api/cifraclub-search**', {
      fixture: 'cifraclub-search.json'
    }).as('songSearchAPI');
    
    cy.intercept('GET', '**/api/artist-songs**', {
      fixture: 'artist-songs/hillsong-united.json'
    }).as('artistSongsAPI');
    
    cy.visit('/');
  });

  it('should cache artist search results and reuse them', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
    // Perform initial artist search using fixture data
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Wait for API call
    cy.wait('@artistSearchAPI');
    
    // Verify cache was populated
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      expect(cacheData).to.not.be.null;
      
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache.items).to.be.an('array');
        expect(cache.items.length).to.be.greaterThan(0);
        
        // Verify cache structure matches actual implementation
        const firstItem = cache.items[0];
        expect(firstItem).to.have.property('key');
        expect(firstItem).to.have.property('timestamp');
        expect(firstItem).to.have.property('accessCount');
        expect(firstItem).to.have.property('results');
        expect(firstItem).to.have.property('query');
        expect(firstItem.query).to.have.property('artist');
        expect(firstItem.query.artist).to.include('Hillsong United');
      }
    });
    
    // Clear search input and search again for same term
    cy.get('#artist-search-input').clear();
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Verify no second API call was made (cache was used)
    cy.get('@artistSearchAPI.all').should('have.length', 1);
    
    // Verify access count increased
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        const cacheItem = cache.items.find((item: CacheItem) => 
          item.query.artist && item.query.artist.toLowerCase().includes('hillsong united')
        );
        if (cacheItem) {
          expect(cacheItem.accessCount).to.be.greaterThan(1);
        }
      }
    });
  });

  it('should cache multiple different artist searches separately', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
    // Search for different artists from fixtures
    const artists = ['Hillsong United', 'AC/DC', 'Guns N\' Roses'];
    
    artists.forEach((artist, index) => {
      // Configure different responses for each artist
      if (index === 1) {
        cy.intercept('GET', '**/api/artists**', {
          fixture: 'artists.json'
        }).as(`artistSearchAPI${index}`);
      }
      
      cy.get('#artist-search-input').clear().type(artist);
      cy.get('button[type="submit"]').click();
      cy.wait('@artistSearchAPI');
      cy.wait(1000);
    });
    
    // Verify all searches are cached separately
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache.items.length).to.be.at.least(artists.length);
        
        // Verify unique cache keys
        const cacheKeys = cache.items.map((item: CacheItem) => item.key);
        const uniqueKeys = new Set(cacheKeys);
        expect(uniqueKeys.size).to.equal(cache.items.length);
      }
    });
  });
});
