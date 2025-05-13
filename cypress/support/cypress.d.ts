declare namespace Cypress {
  interface Chainable {
    /**
     * Navigate to the "My Songs" tab and open a specific song by title
     */
    openSong(songTitle: string): Chainable<void>;

    /**
     * Toggle the auto-scroll feature
     */
    toggleAutoScroll(): Chainable<void>;

    /**
     * Set the scroll speed to a specific value (1-10)
     */
    setScrollSpeed(speed: number): Chainable<void>;

    /**
     * Set the theme to dark, light, or system
     * @param theme - The theme to set: 'dark', 'light', or 'system'
     * @example
     * // Set theme to dark mode
     * cy.setTheme('dark')
     * // Set theme to system preference
     * cy.setTheme('system')
     */
    setTheme(theme: 'dark' | 'light' | 'system'): Chainable<void>;

    /**
     * Get the current active theme, either 'dark' or 'light'
     * @example
     * cy.getActiveTheme().should('eq', 'dark')
     */
    getActiveTheme(): Chainable<string>;
    
    /**
     * Simulate pressing the Tab key from the current focused element
     * @example
     * cy.get('button').focus().pressTab()
     */
    pressTab(): Chainable<Element>;
  }
}
