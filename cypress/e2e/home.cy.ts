describe('Chordium E2E Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should display the homepage with tabs', () => {
    cy.get('[role="tablist"]').should('be.visible');
    cy.get('button[role="tab"]').should('have.length.at.least', 3);
  });

  it('should show My Songs tab by default', () => {
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    cy.contains('Hotel California').should('be.visible');
  });

  it('should have a working file uploader tab', () => {
    cy.get('button[role="tab"]').contains('Upload').click();
    cy.get('input[type="file"]').should('exist');
  });

  it('should navigate to My Songs tab', () => {
    cy.get('button[role="tab"]').contains('My Songs').click();
    cy.get('[data-state="active"]').should('contain.text', 'My Songs');
    // Sample songs should be visible
    cy.contains('Hotel California').should('be.visible');
    cy.contains('Wonderwall').should('be.visible');
  });

  it('should display the footer', () => {
    cy.get('footer').should('be.visible');
  });

  it('should have nav elements in the header', () => {
    cy.get('header').should('be.visible');
  });
});
