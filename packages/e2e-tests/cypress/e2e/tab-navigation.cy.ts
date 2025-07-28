describe('Tab Navigation URL Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should preserve search parameters when switching between tabs', () => {
    cy.visit('/search?artist=oasis&song=wonderwall');
    
    cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    cy.url().should('include', '/search?artist=oasis&song=wonderwall');
    
    cy.get('[data-cy="tab-upload"]').click();
    cy.url().should('include', '/upload');
    
    cy.get('[data-cy="tab-search"]').click();
    
    cy.url().should('include', '/search');
    cy.url().should('include', 'artist=oasis');
    cy.url().should('include', 'song=wonderwall');
  });

  it('should set search tab active when URL has search parameters', () => {
    cy.visit('/search?artist=test&song=song');
    
    cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    
    cy.url().should('include', 'artist=test');
    cy.url().should('include', 'song=song');
  });

  it('should update URL when clicking on Search tab', () => {
    cy.get('button[role="tab"]').contains('Search').click();
    
    cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    
    cy.url().should('include', '/search');
  });

  it('should navigate between tabs using buttons', () => {
    cy.visit('/');
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('contain.text', 'My Chord Sheets');
    cy.url().should('match', /\/(my-chord-sheets)?$/);
    
    cy.get('button[role="tab"]').contains('Search').click();
    cy.url().should('include', '/search');
    cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    
    cy.get('button[role="tab"]').contains('Upload').click();
    cy.url().should('include', '/upload');
    cy.get('[data-cy="tab-upload"][data-state="active"]').should('contain.text', 'Upload');
    
    cy.get('button[role="tab"]').contains('My Chord Sheets').click();
    cy.url().should('include', '/my-chord-sheets');
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('contain.text', 'My Chord Sheets');
  });
});
