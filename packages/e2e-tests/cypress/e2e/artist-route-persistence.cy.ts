// cypress/e2e/artist-route-persistence.cy.ts
// Cypress E2E tests for artist route persistence when switching tabs

describe('Artist Route Persistence', () => {
  it('preserves artist route when switching tabs', () => {
    cy.visit('/');

    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields and search
    cy.get('input[placeholder="Search for an artist"]').type('Hillsong');
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for results to appear
    cy.get('[data-cy="search-results-area"]').should('be.visible');

    // Click on an artist to navigate to artist page
    cy.get('[data-cy^="artist-card-compact-"]').first().click();

    // Verify we're on an artist route (URL should be /artist-name)
    cy.url().should('not.include', '/search');
    cy.url().should('match', /\/[^\/]+$/); // Should be a single segment path

    // Store the artist URL for comparison
    cy.url().then(artistUrl => {
      cy.log('Artist URL before tab switch:', artistUrl);

      // Switch to another tab
      cy.get('[data-cy="tab-my-chord-sheets"]').click();

      // Switch back to search tab
      cy.get('[data-cy="tab-search"]').click();

      // Verify we're still on the artist route (not reset to /search)
      cy.url().should('eq', artistUrl);
      cy.url().should('not.include', '/search');
      cy.url().should('match', /\/[^\/]+$/); // Should still be a single segment path

      // Verify the artist's songs are still displayed
      cy.get('[data-cy="search-results-area"]').should('be.visible');
      
      // Verify the back button is available (indicating we're on an artist page)
      cy.get('[data-cy="back-button"]').should('be.visible');
    });
  });

  it('preserves search results when switching tabs from search page', () => {
    cy.visit('/');

    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields and search
    cy.get('input[placeholder="Search for an artist"]').type('Hillsong');
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for results to appear
    cy.get('[data-cy="search-results-area"]').should('be.visible');

    // Verify we're on a search route
    cy.url().should('include', '/search');

    // Store the search URL for comparison
    cy.url().then(searchUrl => {
      cy.log('Search URL before tab switch:', searchUrl);

      // Switch to another tab
      cy.get('[data-cy="tab-my-chord-sheets"]').click();

      // Switch back to search tab
      cy.get('[data-cy="tab-search"]').click();

      // Verify we're still on the search route with results
      cy.url().should('eq', searchUrl);
      cy.get('[data-cy="search-results-area"]').should('be.visible');
      
      // Verify search fields still have values
      cy.get('input[placeholder="Search for an artist"]').should('have.value', 'Hillsong');
    });
  });

  it('handles back button correctly from artist page', () => {
    cy.visit('/');

    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields and search
    cy.get('input[placeholder="Search for an artist"]').type('Hillsong');
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for results to appear
    cy.get('[data-cy="search-results-area"]').should('be.visible');

    // Click on an artist to navigate to artist page
    cy.get('[data-cy^="artist-card-compact-"]').first().click();

    // Verify we're on an artist route
    cy.url().should('not.include', '/search');

    // Click the back button
    cy.get('[data-cy="back-button"]').click();

    // Verify we're back to the search results
    cy.url().should('include', '/search');
    cy.get('[data-cy="search-results-area"]').should('be.visible');
    
    // Verify search fields still have the original search query
    cy.get('input[placeholder="Search for an artist"]').should('have.value', 'Hillsong');
  });

  it('debug: logs URL changes during tab switching', () => {
    cy.visit('/');

    // Go to Search tab
    cy.get('[data-cy="tab-search"]').click();

    // Fill in search fields and search
    cy.get('input[placeholder="Search for an artist"]').type('Hillsong');
    cy.get('[data-cy="search-submit-button"]').click();

    // Wait for results to appear
    cy.get('[data-cy="search-results-area"]').should('be.visible');

    // Click on an artist to navigate to artist page
    cy.get('[data-cy^="artist-card-compact-"]').first().click();

    // Log the artist URL
    cy.url().then(url => {
      cy.log('Artist URL:', url);
    });

    // Switch to another tab and log
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.url().then(url => {
      cy.log('URL after switching to my-chord-sheets:', url);
    });

    // Switch back to search tab and log
    cy.get('[data-cy="tab-search"]').click();
    cy.url().then(url => {
      cy.log('URL after switching back to search:', url);
    });
  });
});
