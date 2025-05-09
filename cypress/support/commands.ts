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
  }
}

Cypress.Commands.add('openSong', (songTitle) => {
  // Navigate to My Songs tab
  cy.get('button[role="tab"]').contains('My Songs').click();
  
  // Find the song card by title
  cy.contains('.p-4', songTitle)
    .should('exist')
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
