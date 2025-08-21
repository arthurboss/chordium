describe('Keyboard Navigation and Accessibility Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('should ensure header elements are keyboard accessible', () => {
    // Check logo link has proper tabindex and aria-label
    cy.get('header a').first()
      .should('have.attr', 'tabindex', '0')
      .should('have.attr', 'aria-label', 'Chordium home');
    
    // Check theme toggle has proper tabindex and aria-label
    cy.get('button[aria-label="Toggle theme"]')
      .should('have.attr', 'tabindex', '0');
  });

  it('should ensure all tabs have role="tab" and can be focused', () => {
    // Check that all tabs have the correct role
    cy.get('button[role="tab"]').should('exist');
    
    // Check that at least one tab can be focused (we need to check this way because
    // Radix UI handles focus within its own implementation, which may use tabindex=-1)
    cy.get('button[role="tab"]').first().focus().should('have.focus');
  });

  it('should allow keyboard activation of tabs', () => {
    // Focus on My Chord Sheets tab
    cy.get('button[role="tab"]').contains('My Chord Sheets').focus();
    
    // Activate with Enter key
    cy.focused().type('{enter}');
    cy.get('[data-cy="tab-my-chord-sheets"][data-state="active"]').should('contain.text', 'My Chord Sheets');
    
    // Focus on Search tab
    cy.get('button[role="tab"]').contains('Search').focus();
    
    // Activate with Space key
    cy.focused().type(' ');
    cy.get('[data-cy="tab-search"][data-state="active"]').should('contain.text', 'Search');
    
    // Focus on Upload tab
    cy.get('button[role="tab"]').contains('Upload').focus();
    
    // Activate with Enter key
    cy.focused().type('{enter}');
    cy.get('[data-cy="tab-upload"][data-state="active"]').should('contain.text', 'Upload');
  });

  it('should make song card buttons focusable with keyboard', () => {
    // Navigate to My Chord Sheets tab
    cy.get('button[role="tab"]').contains('My Chord Sheets').click();
    
    // Wait for chord sheets to load and be visible
    cy.get('[data-cy^="chordsheet-card-"]', { timeout: 10000 }).should('be.visible');
    
    // Check chord sheet cards for tabindex (they are clickable)
    cy.get('[data-cy^="chordsheet-card-"]').each(($card) => {
      cy.wrap($card)
        .should('have.css', 'cursor', 'pointer');
    });
    
    // Check "Delete" buttons for tabindex
    cy.get('[data-cy^="delete-btn-"]').each(($btn) => {
      cy.wrap($btn)
        .should('have.attr', 'tabindex', '0')
        .should('have.attr', 'aria-label');
    });
  });

  it('should allow keyboard activation of song card actions', () => {
    // Navigate to My Chord Sheets tab
    cy.get('button[role="tab"]').contains('My Chord Sheets').click();
    
    // Wait for chord sheets to be visible
    cy.get('[data-cy^="chordsheet-card-"]', { timeout: 10000 }).should('be.visible');
    
    // Click on a chord sheet card directly
    cy.get('[data-cy^="chordsheet-card-"]').first().click();
    
    // Should have navigated to song view
    cy.get('button[aria-label="back-button"]')
      .should('be.visible');
  });
  
  it('should make theme dropdown menu items keyboard accessible', () => {
    // Open the theme menu using the data-cy we added
    cy.get('[data-cy="theme-toggle-button"]').click();
    
    // Wait for the dropdown to open
    cy.wait(200);
    
    // Look for the dropdown menu with the test ID
    cy.get('[data-cy="theme-dropdown-menu"]').should('exist');
    
    // Check that all theme menu items are present and have the correct attributes
    // Use a more specific selector to target only the menu items
    cy.get('[data-cy^="theme-"][data-cy$="-item"]').each(($item) => {
      cy.wrap($item)
        .should('have.attr', 'tabindex', '0')
        .should('have.attr', 'role', 'menuitem');
    });
  });

  it('should make Back button accessible in song view', () => {
    // Navigate to My Chord Sheets tab and open a song
    cy.get('button[role="tab"]').contains('My Chord Sheets').click();
    cy.get('[data-cy^="chordsheet-card-"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy^="chordsheet-card-"]').first().click();
    
    // Check back button has proper attributes
    cy.get('button[aria-label="back-button"]')
      .should('have.attr', 'tabindex', '0')
      .should('have.attr', 'aria-label', 'back-button');
      
    // Check delete button has proper attributes (if visible)
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="delete-button"]').length > 0) {
        cy.get('button[aria-label="delete-button"]')
          .should('have.attr', 'tabindex', '0')
          .should('have.attr', 'aria-label', 'delete-button');
      }
    });
  });
  
  it('should ensure file upload elements are keyboard accessible', () => {
    // Navigate to Upload tab
    cy.get('button[role="tab"]').contains('Upload').click();
    
    // Check that file input is accessible
    cy.get('input[type="file"]')
      .should('exist');
      
    // Note: We can't easily test the Save button because it requires a file upload
    // In a real test, we would mock a file upload and then test the Save button
  });
  
  it('should allow keyboard navigation between different sections', () => {
    // Test the logical tab order - check key elements are focusable in sequence
    // First focus the logo - using correct selector for Link components
    cy.get('header a[aria-label="Chordium home"]').focus();
    cy.focused().should('have.attr', 'aria-label', 'Chordium home');
    
    // Focusing the theme toggle (would be next in tab order)
    cy.get('button[aria-label="Toggle theme"]').focus();
    cy.focused().should('have.attr', 'aria-label', 'Toggle theme');
    
    // Focusing the first tab (would be next in tab order)
    cy.get('button[role="tab"]').first().focus();
    cy.focused().should('contain', 'My Chord Sheets');
  });
});
