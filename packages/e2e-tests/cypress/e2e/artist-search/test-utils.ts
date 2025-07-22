// Test utilities for artist search tests
import { CacheItem, CacheData } from './types';
import { SELECTORS } from './selectors';

export const navigateToSearchTab = () => {
  // Navigate to Search tab using the correct selector
  cy.get(SELECTORS.SEARCH_TAB).should('be.visible').click();
  
  // Wait for search form to be visible and interactive
  return cy.get(SELECTORS.SEARCH_FORM, { timeout: 10000 }).should('be.visible');
};

export const searchForArtist = (artistName: string) => {
  navigateToSearchTab().within(() => {
    // First clear any existing value and type the artist name
    cy.get(SELECTORS.ARTIST_INPUT)
      .should('be.visible')
      .clear()
      .type(artistName, { delay: 50 });
      
    // Find the submit button and ensure it's enabled before clicking
    cy.get(SELECTORS.SUBMIT_BUTTON)
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });
  });
  
  // Wait for the artist search API call
  cy.wait('@artistSearch', { timeout: 10000 })
    .its('response.statusCode')
    .should('eq', 200);
  
  // Wait a moment for the UI to update
  return cy.wait(1000);
};

export const verifyCachePopulated = (artistName: string) => {
  cy.window().then((win) => {
    const cacheData = win.localStorage.getItem('chordium-search-cache');
    expect(cacheData).to.not.be.null;
    
    if (cacheData) {
      const cache: CacheData = JSON.parse(cacheData);
      expect(cache.items).to.be.an('array');
      expect(cache.items.length).to.be.greaterThan(0);
      
      // Verify cache structure matches actual implementation
      const cacheItem = cache.items.find(item => 
        item.query?.artist?.toLowerCase().includes(artistName.toLowerCase())
      );
      
      expect(cacheItem).to.exist;
      if (cacheItem) {
        expect(cacheItem).to.have.property('key');
        expect(cacheItem).to.have.property('timestamp');
        expect(cacheItem).to.have.property('accessCount');
        expect(cacheItem).to.have.property('results');
        expect(cacheItem.query).to.have.property('artist');
        if (typeof cacheItem.query.artist === 'string') {
          expect(cacheItem.query.artist).to.include(artistName);
        }
      }
      
      return cacheItem;
    }
  });
};

export const verifyCacheAccessCount = (artistName: string, minCount: number) => {
  cy.window().then((win) => {
    const cacheData = win.localStorage.getItem('chordium-search-cache');
    if (cacheData) {
      const cache: CacheData = JSON.parse(cacheData);
      const cacheItem = cache.items.find((item: CacheItem) => 
        item.query.artist?.toLowerCase().includes(artistName.toLowerCase())
      );
      if (cacheItem) {
        expect(cacheItem.accessCount).to.be.at.least(minCount);
      }
    }
  });
};
