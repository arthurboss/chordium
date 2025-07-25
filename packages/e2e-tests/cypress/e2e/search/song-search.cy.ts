/**
 * E2E tests for song search functionality
 * These tests would have caught the song-only search failure that occurred during unification
 * 
 * ⚠️  IMPORTANT: These tests are EXCLUDED from GitHub Actions workflows because they use
 * real scraping/fetching from external sites (CifraClub). They should only be run locally
 * to avoid unnecessary scraping load and potential rate limiting issues.
 * 
 * To run these tests locally: npm run test:e2e -- --spec "cypress/e2e/search/song-search.cy.ts"
 */

describe('Song Search E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
  });

  describe('Song-Only Search', () => {
    it('should successfully search for songs and display results with unified Song interface', () => {
      // Set up intercept before the action
      cy.intercept('GET', '/api/cifraclub-search*').as('songSearch');
      
      // Test the exact scenario that was failing
      cy.get('#song-search-input').type('imagine');
      cy.get('button[type="submit"]').click();

      // Verify API call and response structure
      cy.wait('@songSearch').then((interception) => {
        // Verify the API returns unified Song interface
        expect(interception.response?.body).to.be.an('array');
        if (interception.response?.body?.length && interception.response.body.length > 0) {
          const firstSong = interception.response.body[0];
          
          // Should have unified Song interface fields
          expect(firstSong).to.have.property('title');
          expect(firstSong).to.have.property('path');
          expect(firstSong).to.have.property('artist');
          
          // Should NOT have redundant fields
          expect(firstSong).to.not.have.property('url');
          expect(firstSong).to.not.have.property('id');
          
          // Verify field types
          expect(firstSong.title).to.be.a('string');
          expect(firstSong.path).to.be.a('string');
          expect(firstSong.artist).to.be.a('string');
        }
      });

      // Verify UI displays results correctly - check for any song results
      cy.get('[data-cy="songs-view"], .grid', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="result-card"], .grid > div', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });    
    
    it('should maintain search functionality with unified Song interface', () => {
      cy.intercept('GET', '/api/cifraclub-search*').as('searchRequest');
      
      cy.get('#song-search-input').type('bohemian rhapsody');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@searchRequest');

      // Should show results
      cy.get('.grid', { timeout: 10000 }).should('be.visible');
      cy.get('.grid > div').should('have.length.greaterThan', 0);
    });

    it('should handle empty search results gracefully', () => {
      cy.intercept('GET', '/api/cifraclub-search*', []).as('emptySearch');
      
      cy.get('#song-search-input').type('nonexistentsongname12345');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@emptySearch');
      
      // Should show appropriate empty state or no crash
      cy.get('body').should('not.contain', 'Error');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/cifraclub-search*', { statusCode: 500 }).as('errorSearch');
      
      cy.get('#song-search-input').type('imagine');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@errorSearch');
      
      // Should show error state or not crash
      cy.get('body').should('not.contain', 'undefined').and('not.contain', 'TypeError');
    });
  });

  describe('Song Search Performance', () => {
    it('should load search results within acceptable time', () => {
      cy.intercept('GET', '/api/cifraclub-search*').as('songSearch');
      
      const startTime = Date.now();
      
      cy.get('#song-search-input').type('imagine');
      cy.get('button[type="submit"]').click();
      
      cy.wait('@songSearch').then(() => {
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        // Should load within 10 seconds (generous for e2e)
        expect(loadTime).to.be.lessThan(10000);
      });

      cy.get('.grid', { timeout: 10000 }).should('be.visible');
    });
  });
});
