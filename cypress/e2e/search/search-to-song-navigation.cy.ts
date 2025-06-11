/**
 * E2E tests for navigation from search results to song view page
 * Tests the requirement: when clicking "View Chords" on a search result,
 * it should redirect to the My Songs tab and show the song in SongViewer
 */

describe('Search to Song Navigation E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    // Navigate to Search tab
    cy.get('[data-cy="tab-search"]').should('be.visible').click();
    
    // Wait for the search form to be ready
    cy.get('#search-form').should('be.visible');
  });

  it('should navigate from search results to song view page when clicking View Chords', () => {
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
    cy.get('[data-cy="songs-view"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy^="view-btn-compact-"]').should('have.length.greaterThan', 0);
    
    // Click on the first "View Chords" button in search results
    cy.get('[data-cy^="view-btn-compact-"]').first().click();
    
    // Should navigate to My Songs tab
    cy.get('[data-cy="tab-my-songs"][data-state="active"]').should('contain.text', 'My Songs');
    cy.url().should('include', '/my-songs');
    
    // Should show the SongViewer component (not the song list)
    cy.get('.animate-fade-in').should('be.visible'); // SongViewer has this class
    cy.contains('button', 'Back to My Songs').should('be.visible');
    
    // Should show the chord display
    cy.get('[data-cy="chord-display"]').should('be.visible');
    
    // URL should include a song parameter
    cy.url().should('include', 'song=');
  });

  it('should navigate from artist search results to song view page', () => {
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
    
    // Click on "See Songs" for the first artist
    cy.get('[data-cy^="view-btn-"]').first().click();
    
    // Wait for artist songs to load
    cy.wait('@artistSongs');
    
    // Verify artist songs are displayed
    cy.get('[data-cy="songs-view"]').should('be.visible');
    cy.get('[data-cy^="view-btn-compact-"]').should('have.length.greaterThan', 0);
    
    // Click on the first "View Chords" button in artist songs
    cy.get('[data-cy^="view-btn-compact-"]').first().click();
    
    // Should navigate to My Songs tab
    cy.get('[data-cy="tab-my-songs"][data-state="active"]').should('contain.text', 'My Songs');
    cy.url().should('include', '/my-songs');
    
    // Should show the SongViewer component
    cy.get('.animate-fade-in').should('be.visible');
    cy.contains('button', 'Back to My Songs').should('be.visible');
    
    // Should show the chord display
    cy.get('[data-cy="chord-display"]').should('be.visible');
  });

  it('should handle external song URLs properly in song viewer', () => {
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
    cy.wait('@songSearch');
    
    // Click view chords
    cy.get('[data-cy^="view-btn-compact-"]').first().click();
    
    // Should navigate to My Songs tab
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    
    // Should show song viewer with external URL handling
    cy.get('.animate-fade-in').should('be.visible');
    cy.contains('Wonderwall').should('be.visible');
    cy.contains('Oasis').should('be.visible');
  });

  it('should navigate back to search results from song viewer', () => {
    // Mock search
    cy.intercept('GET', '/api/cifraclub-search*', {
      fixture: 'search-results-sample.json'
    }).as('songSearch');

    // Perform search and navigate to song
    cy.get('#song-search-input').type('wonderwall');
    cy.get('button[type="submit"]').click();
    cy.wait('@songSearch');
    cy.get('[data-cy^="view-btn-compact-"]').first().click();
    
    // Should be in song viewer
    cy.get('.animate-fade-in').should('be.visible');
    
    // Click back button
    cy.contains('button', 'Back to My Songs').click();
    
    // Should go back to My Songs list (not search)
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    cy.url().should('include', '/my-songs');
    cy.url().should('not.include', 'song=');
    
    // Should show the song list, not search results
    cy.get('.grid').should('be.visible'); // SongList uses grid layout
  });
});
