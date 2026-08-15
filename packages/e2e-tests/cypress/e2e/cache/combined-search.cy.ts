/* eslint-disable @typescript-eslint/no-unused-expressions */

describe('Combined Search Caching', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/search**', {
      fixture: 'artists.json'
    }).as('searchAPI');

    cy.visit('/');
  });

  it('should cache artist+song combinations separately', () => {
    // Navigate to Search tab
    cy.contains('Search').click();

    // Each search is for something different, so each has to reach the API. Were
    // they sharing one cache entry, the later ones would be answered from it and
    // never ask, which is what this is checking.
    cy.get('#search-input').type('Hillsong United');
    cy.get('button[type="submit"]').click();
    cy.wait('@searchAPI');

    cy.get('#search-input').clear();
    cy.get('#search-input').type('Wonderful');
    cy.get('button[type="submit"]').click();
    cy.wait('@searchAPI');

    cy.get('#search-input').clear().type('Hillsong United Wonderful');
    cy.get('button[type="submit"]').click();
    cy.wait('@searchAPI');

    // Searching the first term again is answered from its own entry, so the URL
    // still reflects it even though nothing was fetched.
    cy.get('#search-input').clear().type('Hillsong United');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', 'q=Hillsong%20United');
  });
});
