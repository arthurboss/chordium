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
  }
}
