describe('Browser Navigation Tests', () => {
  beforeEach(() => {
    // Reset any localStorage state between tests
    cy.clearLocalStorage();
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should update active tab based on direct URL navigation', () => {
    // Check default tab
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    
    // Navigate directly to search page
    cy.visit('/search');
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Navigate directly to upload page
    cy.visit('/upload');
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Navigate back to my songs
    cy.visit('/my-songs');
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
  });

  it('should set active tab when navigating with tab buttons', () => {
    // Start at My Songs tab
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    
    // Navigate to Search using tab button
    cy.get('button[role="tab"]').contains('Search').click();
    cy.url().should('include', '/search');
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Navigate to Upload using tab button
    cy.get('button[role="tab"]').contains('Upload').click();
    cy.url().should('include', '/upload');
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Navigate back to My Songs using tab button
    cy.get('button[role="tab"]').contains('My Songs').click();
    cy.url().should('include', '/my-songs');
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
  });

  it('should update URL when viewing a song', () => {
    // Click View Chords on a song
    cy.contains('View Chords').first().click();
    
    // URL should have song parameter
    cy.url().should('include', 'song=');
    
    // My Songs tab should be active
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    
    // Should show song content
    cy.get('[role="tabpanel"]').should('be.visible');
  });

  it('should activate Search tab when URL has q parameter', () => {
    // Navigate to a search query URL
    cy.visit('/search?q=test');
    
    // Search tab should be active
    cy.get('[data-state="active"]').should('contain.text', 'Search');
  });
  
  // Testing a stub for browser back behavior - simulated through direct navigation
  it('should simulate browser history workflow through direct navigation', () => {
    // Record our navigation path
    cy.visit('/');
    cy.visit('/search');
    cy.visit('/upload');
    
    // Verify we're on Upload tab
    cy.get('[data-state="active"]').should('contain.text', 'Upload');
    
    // Go back to search (simulating back button)
    cy.visit('/search');
    cy.get('[data-state="active"]').should('contain.text', 'Search');
    
    // Go back to home (simulating back button)
    cy.visit('/');
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
  });
});
