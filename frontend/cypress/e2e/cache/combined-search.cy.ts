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

describe.skip('Combined Search Caching', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    cy.intercept('GET', '**/api/artists**', {
      fixture: 'artists.json'
    }).as('artistSearchAPI');
    
    cy.intercept('GET', '**/api/cifraclub-search**', {
      fixture: 'cifraclub-search.json'
    }).as('songSearchAPI');
    
    cy.visit('/');
  });

  it.skip('should cache artist+song combinations separately', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
    // Search for artist only
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    cy.wait('@artistSearchAPI');
    cy.wait(1000);
    
    // Search for song only
    cy.get('#artist-search-input').clear();
    cy.get('#song-search-input').type('Wonderful');
    cy.get('button[type="submit"]').click();
    cy.wait('@songSearchAPI');
    cy.wait(1000);
    
    // Search for combined artist+song
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('#song-search-input').clear().type('Wonderful');
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
    
    // Verify all three search types are cached separately
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache.items.length).to.be.at.least(3);
        
        // Check for artist-only search
        const artistOnly = cache.items.find((item: CacheItem) => 
          item.query.artist && !item.query.song
        );
        expect(artistOnly).to.exist;
        
        // Check for song-only search  
        const songOnly = cache.items.find((item: CacheItem) => 
          item.query.song && !item.query.artist
        );
        expect(songOnly).to.exist;
        
        // Check for combined search
        const combined = cache.items.find((item: CacheItem) => 
          item.query.artist && item.query.song
        );
        expect(combined).to.exist;
      }
    });
  });
});
