export {};

declare module 'cypress' {
  interface Chainable {
    /**
     * Navigate to the "My Songs" tab and open a specific song by title
     */
    openSong(songTitle: string): Chainable;
    
    /**
     * Toggle the auto-scroll feature
     */
    toggleAutoScroll(): Chainable;
    
    /**
     * Set the scroll speed to a specific value (1-10)
     */
    setScrollSpeed(speed: number): Chainable;

    /**
     * Set the theme to dark, light, or system
     */
    setTheme(theme: 'dark' | 'light' | 'system'): Chainable;

    /**
     * Get the current active theme
     */
    getCurrentTheme(): Chainable;
  }
}

Cypress.Commands.add('openSong', (songTitle) => {
  // Navigate to My Songs tab
  cy.get('button[role="tab"]').contains('My Songs').click();
  
  // Find the song card by title
  cy.contains('.font-semibold', songTitle)
    .should('exist')
    .closest('.overflow-hidden')  // Navigate up to the Card component
    .within(() => {
      cy.contains('View Chords').click();
    });
});

Cypress.Commands.add('toggleAutoScroll', () => {
  // Find the Play/Pause button that controls auto-scroll
  cy.get('button[title*="Auto-Scroll"]').click();
});

Cypress.Commands.add('setScrollSpeed', (speed) => {
  // Get the current speed value
  cy.get('[role="slider"]').first()
    .invoke('attr', 'aria-valuenow')
    .then((currentSpeed) => {
      const current = parseInt(currentSpeed || '3', 10);
      const diff = speed - current;
      
      if (diff > 0) {
        // Increase speed
        for (let i = 0; i < diff; i++) {
          cy.get('.flex').contains('x').parent().find('[role="slider"]')
            .type('{rightarrow}', { force: true });
        }
      } else if (diff < 0) {
        // Decrease speed
        for (let i = 0; i < Math.abs(diff); i++) {
          cy.get('.flex').contains('x').parent().find('[role="slider"]')
            .type('{leftarrow}', { force: true });
        }
      }
    });
});

// Theme-related commands
Cypress.Commands.add('setTheme', (theme) => {
  // Make sure the dropdown isn't already open
  cy.get('body').then($body => {
    if ($body.find('[data-cy="theme-dropdown-menu"]').length > 0) {
      // If dropdown is open, close it first
      cy.get('body').click('top');
    }
  });

  // Open the theme dropdown using the data-cy
  cy.get('[data-cy="theme-toggle-button"]').click();
  cy.wait(100); // Wait for animation
  cy.get('[data-cy="theme-dropdown-menu"]').should('exist');
  
  // Click on the selected theme option using data-cy
  if (theme === 'dark') {
    cy.get('[data-cy="theme-dark-item"]').click();
  } else if (theme === 'light') {
    cy.get('[data-cy="theme-light-item"]').click();
  } else {
    cy.get('[data-cy="theme-system-item"]').click();
  }
  
  // Wait for theme change to take effect
  cy.wait(100);
});

Cypress.Commands.add('getCurrentTheme', () => {
  return cy.get('html').invoke('hasClass', 'dark').then((hasDarkClass) => {
    return hasDarkClass ? 'dark' : 'light';
  });
});
