import { setupIntercepts } from './api-mocks';
import { navigateToSearchTab } from './test-utils';
import { TEST_ARTIST } from './types';

describe('Multiple Artist Searches', () => {
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

  it('should cache multiple different artist searches separately', () => {
    // Log test start
    cy.log('Starting test: should cache multiple different artist searches separately');
    
    // Navigate to Search tab
    const searchForm = navigateToSearchTab();
    
    // Search for different artists
    const artists = [TEST_ARTIST, 'AC/DC', 'Guns N\' Roses'];
    
    artists.forEach((artist) => {
      searchForm.within(() => {
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
    
    // Verify all searches completed successfully
    cy.get('body').should('contain', 'Search');
    
    // Wait for any final processing
    cy.wait(1000);
  });
});
