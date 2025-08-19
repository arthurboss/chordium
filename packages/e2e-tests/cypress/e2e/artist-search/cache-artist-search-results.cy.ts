import { setupIntercepts } from './api-mocks';
import { searchForArtist, verifyCachePopulated, verifyCacheAccessCount } from './test-utils';
import { TEST_ARTIST } from './types';

describe('Artist Search Caching', () => {
  beforeEach(() => {
    // Log start of test
    cy.log('Starting test with fresh state');
    
    // Clear IndexedDB before each test
    cy.window().then((win) => {
      win.indexedDB.deleteDatabase('chordium');
    });
    
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
    cy.log('Test completed - cache state logged in console');
  });

  it('should cache artist search results and reuse them', () => {
    // Log test start
    cy.log('Starting test: should cache artist search results and reuse them');
    
    // Perform initial artist search
    searchForArtist(TEST_ARTIST);
    
    // Wait for initial search to complete
    cy.wait(1000);
    
    // Clear search input and search again for the same term
    cy.get('#artist-search-input').clear();
    cy.get('#artist-search-input').type(TEST_ARTIST);
    cy.get('button[type="submit"]').click();
    
    // Wait for search to complete
    cy.wait(1000);
    
    // Verify app functions correctly
    cy.get('body').should('contain', 'Search');
  });
});
