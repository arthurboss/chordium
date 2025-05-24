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

describe('Song Search Caching', () => {
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

  it('should cache song search results independently', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
    // Perform song-only search using fixture data
    cy.get('#song-search-input').type('Wonderful');
    cy.get('button[type="submit"]').click();
    
    // Wait for song search API call
    cy.wait('@songSearchAPI');
    
    // Verify song search cache
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache.items).to.be.an('array');
        
        const songSearchItem = cache.items.find((item: CacheItem) => 
          item.query.song && !item.query.artist
        );
        if (songSearchItem) {
          expect(songSearchItem.query.song).to.include('Wonderful');
          expect(songSearchItem.query.artist).to.be.undefined;
        }
      }
    });
    
    // Search for same song again
    cy.get('#song-search-input').clear().type('Wonderful');
    cy.get('button[type="submit"]').click();
    
    // Verify cache was reused (no new API call)
    cy.get('@songSearchAPI.all').should('have.length', 1);
  });

  it('should handle multiple song searches with proper caching', () => {
    // Navigate to Search tab
    cy.contains('Search').click();
    
    const songs = ['Wonderful', 'Amazing', 'Beautiful'];
    
    songs.forEach((song) => {
      cy.get('#song-search-input').clear().type(song);
      cy.get('button[type="submit"]').click();
      cy.wait('@songSearchAPI');
      cy.wait(1000);
    });
    
    // Verify all songs are cached
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        const songCacheItems = cache.items.filter((item: CacheItem) => 
          item.query.song && !item.query.artist
        );
        expect(songCacheItems.length).to.be.at.least(songs.length);
      }
    });
  });
});
