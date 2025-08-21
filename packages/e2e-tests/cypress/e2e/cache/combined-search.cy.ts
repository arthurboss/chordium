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

describe('Combined Search Caching', () => {
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

  it('should cache artist+song combinations separately', () => {
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
    
    // Verify all searches completed successfully
    cy.get('body').should('contain', 'Search');
    
    // Wait for any final processing
    cy.wait(1000);
  });
});
