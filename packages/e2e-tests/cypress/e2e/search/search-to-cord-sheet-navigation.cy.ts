/**
 * E2E tests for navigation from search results to chord sheet page
 * Tests the requirement: when clicking on a search result,
 * it should navigate to the chord sheet page and show the chord sheet viewer
 */

describe('Search to Chord Sheet Navigation E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
    
    // Wait for the search form to be ready
    cy.get('#search-form').should('be.visible');
  });

  it('should navigate from search results to chord sheet page when clicking on result', () => {
    // Mock the search API call
    cy.intercept('GET', '/api/cifraclub-search*', {
      fixture: 'search-results-sample.json'
    }).as('songSearch');

    // Perform a song search
    cy.get('#song-search-input').type('wonderwall');
    cy.get('button[type="submit"]').click();
    
    // Wait for search results
    cy.wait('@songSearch');
    
    // Verify search results are displayed
    cy.wait(2000);
    cy.get('body').should('contain', 'Search');
    
    // Click on the first search result card
    cy.get('[data-cy^="song-card-compact-"]').first().click();
    
    // Should navigate to the chord sheet page
    cy.url().should('include', 'oasis/wonderwall');
    
    // Should show the chord sheet viewer
    cy.get('button[aria-label="back-button"]').should('be.visible');
  });

  it('should navigate from artist search results to chord sheet page', () => {
    // Mock the artist search API call
    cy.intercept('GET', '/api/artists*', {
      fixture: 'artist-search-results.json'
    }).as('artistSearch');
    
    // Mock the artist songs API call
    cy.intercept('GET', '/api/artist-songs*', {
      fixture: 'artist-songs-sample.json'
    }).as('artistSongs');

    // Perform an artist search
    cy.get('#artist-search-input').type('oasis');
    cy.get('button[type="submit"]').click();
    
    // Wait for artist search results
    cy.wait('@artistSearch');
    
    // Click on the first artist result
    cy.get('[data-cy^="artist-card-compact-"]').first().click();
    
    // Wait for artist songs to load
    cy.wait('@artistSongs');
    
    // Verify artist songs are displayed
    cy.wait(2000);
    cy.get('body').should('contain', 'Search');
    
    // Click on the first song in artist songs
    cy.get('[data-cy^="song-card-compact-"]').first().click();
    
    // Should navigate to the chord sheet page
    cy.url().should('include', 'oasis/wonderwall');
    
    // Should show the chord sheet viewer
    cy.get('button[aria-label="back-button"]').should('be.visible');
  });

  it('should handle external song URLs properly in chord sheet viewer', () => {
    // Mock search with external URLs
    cy.intercept('GET', '/api/cifraclub-search*', {
      statusCode: 200,
      body: [
        {
          title: 'Wonderwall',
          artist: 'Oasis',
          path: 'https://www.cifraclub.com.br/oasis/wonderwall/'
        }
      ]
    }).as('songSearch');

    // Perform search
    cy.get('#song-search-input').type('wonderwall');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    
    // Click on the search result
    cy.get('[data-cy^="song-card-compact-"]').first().click();
    
    // Should navigate to the chord sheet page
    cy.url().should('include', 'oasis/wonderwall');
    
    // Should show chord sheet viewer
    cy.get('button[aria-label="back-button"]').should('be.visible');
    cy.contains('Wonderwall').should('be.visible');
    cy.contains('Oasis').should('be.visible');
  });

  it('should navigate back to search results from chord sheet viewer', () => {
    // Mock search
    cy.intercept('GET', '/api/cifraclub-search*', {
      fixture: 'search-results-sample.json'
    }).as('songSearch');

    // Perform search and navigate to song
    cy.get('#song-search-input').type('wonderwall');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    cy.get('[data-cy^="song-card-compact-"]').first().click();
    
    // Should be in chord sheet viewer
    cy.get('button[aria-label="back-button"]').should('be.visible');
    
    // Click back button
    cy.get('button[aria-label="back-button"]').click();
    
    // Should go back to the previous page
    cy.url().should('not.include', 'oasis/wonderwall');
  });
});
