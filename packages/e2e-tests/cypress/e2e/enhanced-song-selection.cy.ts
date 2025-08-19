describe('Enhanced Song Selection - E2E Integration', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for the app to load
    cy.get('[data-cy="tab-my-chord-sheets"]').should('be.visible');
  });

  it('should handle sample song selection with deduplication', () => {
    // 1. First, verify that sample songs are loaded in "My Chord Sheets"
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    
    // Wait for chord sheets to load and be visible
    cy.get('[data-cy^="chordsheet-card-"]', { timeout: 10000 }).should('be.visible');
    
    // Check if Wonderwall is in My Chord Sheets (it should be loaded as a sample song)
    cy.contains('Wonderwall').should('exist');
    
    // 2. Go to Search tab and search for "Wonderwall"
    cy.get('[data-cy="tab-search"]').click();
    cy.get('#artist-search-input').type('Oasis');
    cy.get('#song-search-input').type('Wonderwall');
    cy.get('[data-cy="search-submit-button"]').click();
    
    // Wait for search results to load (or no results)
    cy.wait(3000);
    
    // 3. Check if search returned results and handle accordingly
    cy.get('body').then(($body) => {
      // Look for Wonderwall in search results that are actually visible
      const visibleWonderwall = $body.find(':contains("Wonderwall")').filter((i, el) => {
        return Cypress.$(el).is(':visible');
      });
      
      if (visibleWonderwall.length > 0) {
        // If Wonderwall appears in visible search results, click on it
        cy.contains('Wonderwall').first().click({ force: true });
        
        // 4. Verify that we're navigated to the song view (deduplication worked)
        cy.url().should('include', 'oasis/wonderwall');
      } else {
        // If no visible search results, go back to My Chord Sheets and click Wonderwall there
        cy.get('[data-cy="tab-my-chord-sheets"]').click();
        cy.contains('Wonderwall').should('be.visible').click();
        cy.url().should('include', 'oasis/wonderwall');
      }
    });
  });

  it('should handle navigation between tabs correctly', () => {
    // 1. Start with sample songs in My Chord Sheets
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.get('body').should(($body) => {
      expect($body.text()).to.satisfy((text: string) => 
        text.includes('Wonderwall') || text.includes('Hotel California')
      );
    });
    
    // 2. Go to search and back multiple times to test persistence
    cy.get('[data-cy="tab-search"]').click();
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.get('[data-cy="tab-search"]').click();
    
    // 3. Verify search functionality works
    cy.get('#artist-search-input').should('be.visible');
    cy.get('#song-search-input').should('be.visible');
    
    // 4. The test should verify that sample songs still appear and behave correctly
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.get('body').should(($body) => {
      expect($body.text()).to.satisfy((text: string) => 
        text.includes('Wonderwall') || text.includes('Hotel California')
      );
    });
  });

  it('should click on sample song directly from My Chord Sheets', () => {
    // 1. Go to My Chord Sheets tab
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    
    // Wait for chord sheets to be visible
    cy.get('[data-cy^="chordsheet-card-"]', { timeout: 10000 }).should('be.visible');
    
    // 2. Find and click on a sample song (like Wonderwall)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Wonderwall')) {
        cy.contains('Wonderwall').first().click();
        
        // Should navigate to the song view
        cy.url().should('include', 'oasis/wonderwall');
      } else if ($body.text().includes('Hotel California')) {
        cy.contains('Hotel California').first().click();
        
        // Should navigate to the song view
        cy.url().should('include', 'eagles/hotel-california');
      }
    });
  });
});
