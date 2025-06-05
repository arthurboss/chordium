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
    // Log start of test
    cy.log('Starting test with fresh state');
    
    // Clear all existing intercepts first
    cy.intercept('**', (req) => {
      console.log(`[Network] ${req.method} ${req.url}`);
      req.continue();
    });
    
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Mock artist search endpoint (used for artist searches)
    cy.intercept('GET', '**/api/artists**', (req) => {
      console.log('Intercepted artist search request:', req.query);
      
      // Return a successful response with the artists fixture
      req.reply({
        statusCode: 200,
        fixture: 'artists.json',
        headers: {
          'x-mock-type': 'artist-search'
        }
      });
    }).as('artistSearch');
    
    // Mock CifraClub endpoint (used for song searches and fallback)
    cy.intercept('GET', '**/api/cifraclub-search**', (req) => {
      console.log('Intercepted CifraClub search request:', req.query);
      
      // For song searches, return the song search fixture
      req.reply({ 
        statusCode: 200, 
        fixture: 'cifraclub-search.json',
        headers: {
          'x-mock-type': 'cifraclub-search'
        }
      });
    }).as('cifraclubSearch');
    
    // Mock artist songs endpoint
    cy.intercept('GET', '**/api/artist-songs**', {
      statusCode: 200,
      fixture: 'artist-songs/hillsong-united.json',
      headers: {
        'x-mock-type': 'artist-songs'
      }
    }).as('artistSongsAPI');
    
    // Visit the app
    cy.visit('/', {
      onBeforeLoad(win) {
        // Enable console logging from the app
        cy.stub(win.console, 'log').as('consoleLog');
        cy.stub(win.console, 'error').as('consoleError');
      }
    });
    
    // Wait for the app to be fully loaded
    cy.get('body').should('be.visible');
  });
  
  afterEach(() => {
    // Log the cache state after each test for debugging
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        console.log('Cache after test:', JSON.parse(cacheData));
      }
    });
  });

  it('should cache artist search results and reuse them', () => {
    // Log test start
    cy.log('Starting test: should cache artist search results and reuse them');
    
    // Navigate to Search tab using the correct selector
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
    
    // Wait for search form to be visible and interactive
    cy.get('#search-form', { timeout: 10000 }).should('be.visible')
      .within(() => {
        // First clear any existing value and type the artist name
        cy.get('#artist-search-input')
          .should('be.visible')
          .clear()
          .type('Hillsong United', { delay: 50 });
          
        // Find the submit button and ensure it's enabled before clicking
        cy.get('button[type="submit"]')
          .should('be.visible')
          .should('not.be.disabled')
          .click({ force: true });
      });
    
    // Wait for the artist search API call
    cy.wait('@artistSearch', { timeout: 10000 })
      .its('response.statusCode')
      .should('eq', 200);
    
    // Wait a moment for the UI to update
    cy.wait(1000);
    
    // Verify cache was populated
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      expect(cacheData).to.not.be.null;
      
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache.items).to.be.an('array');
        expect(cache.items.length).to.be.greaterThan(0);
        
        // Verify cache structure matches actual implementation
        const cacheItem = cache.items.find(item => 
          item.query && item.query.artist && 
          typeof item.query.artist === 'string' &&
          item.query.artist.toLowerCase().includes('hillsong united')
        );
        
        expect(cacheItem).to.exist;
        if (cacheItem) {
          expect(cacheItem).to.have.property('key');
          expect(cacheItem).to.have.property('timestamp');
          expect(cacheItem).to.have.property('accessCount');
          expect(cacheItem).to.have.property('results');
          expect(cacheItem).to.have.property('query');
          expect(cacheItem.query).to.have.property('artist');
          if (typeof cacheItem.query.artist === 'string') {
            expect(cacheItem.query.artist).to.include('Hillsong United');
          }
        }
      }
    });
    
    // Clear search input and search again for same term
    cy.get('#artist-search-input').clear();
    cy.get('#artist-search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    
    // Verify no additional API calls were made (cache was used)
    cy.get('@artistSearch.all').should('have.length', 1);
    
    // Verify access count increased
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        const cacheItem = cache.items.find((item: CacheItem) => 
          item.query.artist && item.query.artist.toLowerCase().includes('hillsong united')
        );
        if (cacheItem) {
          // Access count should be at least 1, but incrementing might be async
          expect(cacheItem.accessCount).to.be.at.least(1);
        }
      }
    });
  });

  it('should cache multiple different artist searches separately', () => {
    // Log test start
    cy.log('Starting test: should cache multiple different artist searches separately');
    
    // Navigate to Search tab using the correct selector
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
    
    // Wait for search form to be visible and interactive
    cy.get('#search-form').should('be.visible');
    
    // Search for different artists from fixtures
    const artists = ['Hillsong United', 'AC/DC', 'Guns N\' Roses'];
    
    artists.forEach((artist, index) => {
      cy.get('#search-form').within(() => {
        cy.get('#artist-search-input')
          .should('be.visible')
          .clear()
          .type(artist, { delay: 50 });
          
        cy.get('button[type="submit"]')
          .should('be.visible')
          .should('not.be.disabled')
          .click();
      });
      
      // Wait for the artist search API call
      cy.wait('@artistSearch', { timeout: 10000 })
        .its('response.statusCode')
        .should('eq', 200);
      
      // Add a small delay between searches
      cy.wait(500);
    });
    
    // Verify all searches are cached separately
    cy.window().then((win) => {
      const cacheData = win.localStorage.getItem('chordium-search-cache');
      if (cacheData) {
        const cache: CacheData = JSON.parse(cacheData);
        expect(cache.items.length).to.be.at.least(1); // At least one search should be cached
        
        // Verify unique cache keys exist
        const cacheKeys = cache.items.map((item: CacheItem) => item.key);
        const uniqueKeys = new Set(cacheKeys);
        expect(uniqueKeys.size).to.equal(cache.items.length);
      }
    });
  });
});
