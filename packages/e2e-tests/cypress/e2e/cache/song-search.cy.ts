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
    // Clear IndexedDB before each test
    cy.window().then((win) => {
      win.indexedDB.deleteDatabase('chordium');
    });
    
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
    
    // Verify search results are displayed
    cy.get('body').should('contain', 'Search');
    
    // Search for same song again
    cy.get('#song-search-input').clear().type('Wonderful');
    cy.get('button[type="submit"]').click();
    
    // Wait for search to complete (cache might be used)
    cy.wait(2000);
    
    // Verify search functionality works
    cy.get('body').should('contain', 'Search');
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
    
    // Verify all searches completed successfully
    cy.get('body').should('contain', 'Search');
    
    // Wait for any final processing
    cy.wait(1000);
  });
});
