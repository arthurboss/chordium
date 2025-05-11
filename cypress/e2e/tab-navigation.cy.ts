describe('Tab Navigation URL Tests', () => {
  beforeEach(() => {
    // Reset any localStorage state between tests
    cy.clearLocalStorage();
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should default to My Songs tab and have /my-songs in URL', () => {
    // Check that My Songs tab is active
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    
    // Check URL has been updated to /my-songs (or root which also maps to my-songs)
    cy.url().then(url => {
      const path = new URL(url).pathname;
      expect(path === '/' || path === '/my-songs').to.be.true;
    });
  });

  it('should update URL when clicking on Search tab', () => {
    // Click on Search tab
    cy.get('button[role="tab"]').contains('Search').click();
    
    // Verify Search tab is active
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Check that URL is updated
    cy.url().should('include', '/search');
  });

  it('should update URL when clicking on Upload tab', () => {
    // Click on Upload tab
    cy.get('button[role="tab"]').contains('Upload').click();
    
    // Verify Upload tab is active
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Check that URL is updated
    cy.url().should('include', '/upload');
  });

  it('should update URL when clicking back to My Songs tab', () => {
    // First navigate to another tab
    cy.get('button[role="tab"]').contains('Search').click();
    cy.url().should('include', '/search');
    
    // Then click on My Songs tab
    cy.get('button[role="tab"]').contains('My Songs').click();
    
    // Verify My Songs tab is active
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    
    // Check that URL is updated
    cy.url().should('include', '/my-songs');
  });

  it('should set the correct tab when navigating directly to a URL', () => {
    // Navigate directly to search page
    cy.visit('/search');
    
    // Check that Search tab is active
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Navigate directly to upload page
    cy.visit('/upload');
    
    // Check that Upload tab is active
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
  });

  it('should set search tab active when URL has q parameter', () => {
    // Navigate to a search with query parameter
    cy.visit('/search?q=test');
    
    // Check that Search tab is active
    cy.get('[data-state="active"]').should('contain.text', 'Search');
  });

  it('should open a song when clicking on View Chords', () => {
    // Find and click the View Chords button for a song
    cy.contains('View Chords').first().click();
    
    // Check that song content is displayed
    cy.get('[role="tabpanel"]').should('be.visible');
    
    // Verify the My Songs tab remains active
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    
    // URL should include a song parameter
    cy.url().should('include', 'song=');
  });

  it('should load correct tab when navigating directly to URL with path', () => {
    // Navigate to search
    cy.visit('/search');
    
    // Verify Search tab is active
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Navigate to upload
    cy.visit('/upload');
    
    // Verify Upload tab is active
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Navigate to my-songs
    cy.visit('/my-songs');
    
    // Verify My Songs tab is active
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
  });

  it('should navigate between tabs using buttons', () => {
    // Start at My Songs tab
    cy.visit('/');
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    cy.url().should('match', /\/(my-songs)?$/);
    
    // Switch to Search tab
    cy.get('button[role="tab"]').contains('Search').click();
    cy.url().should('include', '/search');
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Switch to Upload tab
    cy.get('button[role="tab"]').contains('Upload').click();
    cy.url().should('include', '/upload');
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Switch back to My Songs tab
    cy.get('button[role="tab"]').contains('My Songs').click();
    cy.url().should('include', '/my-songs');
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
  });
});
