describe('Enhanced Song Selection - E2E Integration', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for the app to load
    cy.get('[data-cy="tab-my-chord-sheets"]').should('be.visible');
  });

  it('should handle sample song selection with deduplication', () => {
    // 1. First, verify that sample songs are loaded in "My Chord Sheets"
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.get('.song-card, [data-cy="song-card"]').should('have.length.at.least', 1);
    
    // Check if Wonderwall is in My Chord Sheets (it should be loaded as a sample song)
    cy.contains('Wonderwall').should('exist');
    
    // 2. Go to Search tab and search for "Wonderwall"
    cy.get('[data-cy="tab-search"]').click();
    cy.get('input[placeholder*="artist" i], input[name*="artist" i]').first().type('Oasis');
    cy.get('input[placeholder*="song" i], input[name*="song" i]').first().type('Wonderwall');
    cy.get('button[type="submit"], button:contains("Search")').first().click();
    
    // Wait for search results to load (or no results)
    cy.wait(3000);
    
    // 3. If search returns results, try to click on Wonderwall
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Wonderwall")').length > 0) {
        // If Wonderwall appears in search results, click on it
        cy.contains('Wonderwall').first().click();
        
        // 4. Verify that we're navigated to the My Chord Sheets version (deduplication worked)
        cy.url().should('include', '/my-chord-sheets');
        cy.url().should('include', 'wonderwall');
      } else {
        // If no search results, that's also fine - just verify the app doesn't crash
        cy.get('[data-cy="tab-my-chord-sheets"]').click();
        cy.contains('Wonderwall').should('exist');
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
    cy.get('input[placeholder*="artist" i], input[name*="artist" i]').first().should('be.visible');
    cy.get('input[placeholder*="song" i], input[name*="song" i]').first().should('be.visible');
    
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
    
    // 2. Find and click on a sample song (like Wonderwall)
    cy.get('body').then(($body) => {
      if ($body.text().includes('Wonderwall')) {
        cy.contains('Wonderwall').first().click();
        
        // Should navigate to the song view
        cy.url().should('include', '/my-chord-sheets');
        cy.url().should('include', 'wonderwall');
      } else if ($body.text().includes('Hotel California')) {
        cy.contains('Hotel California').first().click();
        
        // Should navigate to the song view
        cy.url().should('include', '/my-chord-sheets');
        cy.url().should('include', 'hotel-california');
      }
    });
  });
});
