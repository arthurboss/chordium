import { setupIntercepts } from './api-mocks';
import { searchForArtist, verifyCachePopulated, verifyCacheAccessCount } from './test-utils';
import { TEST_ARTIST } from './types';

describe('Artist Search Caching', () => {
  beforeEach(() => {
    // Log start of test
    cy.log('Starting test with fresh state');
    
    // Clear localStorage before each test
    cy.clearLocalStorage();
    
    // Setup API intercepts
    setupIntercepts();
    
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
    
    // Perform initial artist search
    searchForArtist(TEST_ARTIST);
    
    // Verify cache was populated
    verifyCachePopulated(TEST_ARTIST);
    
    // Clear search input and search again for the same term
    cy.get('#artist-search-input').clear();
    cy.get('#artist-search-input').type(TEST_ARTIST);
    cy.get('button[type="submit"]').click();
    
    // Verify no additional API calls were made (cache was used)
    cy.get('@artistSearch.all').should('have.length', 1);
    
    // Verify access count increased
    verifyCacheAccessCount(TEST_ARTIST, 1);
  });
});
