
describe('Auto-scroll feature', () => {
  beforeEach(() => {
    // Visit the main page with a song parameter to show chord display
    cy.visit('/?song=wonderwall');
    // Give the page time to load
    cy.wait(1000);
  });

  it('should toggle auto-scroll when button is clicked', () => {
    // Find the auto-scroll toggle button
    cy.get('[data-testid="auto-scroll-toggle"]').should('be.visible');
    
    // Get the initial scroll position
    cy.window().then(($window) => {
      const initialScrollPos = $window.scrollY;
      
      // Click the auto-scroll toggle button to start scrolling
      cy.get('[data-testid="auto-scroll-toggle"]').click();
      
      // The speed control should now be visible
      cy.get('[data-testid="scroll-speed-control"]').should('be.visible');
      
      // Wait a bit and check if the page has scrolled down
      cy.wait(1000).window().then(($window) => {
        expect($window.scrollY).to.be.greaterThan(initialScrollPos);
      });
      
      // Click again to stop scrolling
      cy.get('[data-testid="auto-scroll-toggle"]').click();
      
      // The speed control should now be hidden
      cy.get('[data-testid="scroll-speed-control"]').should('not.exist');
      
      // Get the position after stopping
      const stoppedPosition = $window.scrollY;
      
      // Wait a bit and make sure it hasn't scrolled further
      cy.wait(500).window().then(($window) => {
        expect($window.scrollY).to.equal(stoppedPosition);
      });
    });
  });

  it('should adjust scroll speed when slider is moved', () => {
    // Start auto-scroll
    cy.get('[data-testid="auto-scroll-toggle"]').click();
    
    // Measure scroll speed at default setting
    cy.window().then(($window) => {
      const initialScrollPos = $window.scrollY;
      
      // Wait for some scrolling to happen at default speed
      cy.wait(1000).window().then(($window) => {
        const scrollAmountAtDefaultSpeed = $window.scrollY - initialScrollPos;
        
        // Set the slider to maximum speed (10)
        // We need to click on the slider at the far right to set max value
        cy.get('[data-testid="scroll-speed-control"] .slider-thumb').eq(0)
          .type('{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}');
        
        // Record position before measuring at max speed
        const positionBeforeMaxSpeed = $window.scrollY;
        
        // Wait the same amount of time and measure scroll amount at max speed
        cy.wait(1000).window().then(($window) => {
          const scrollAmountAtMaxSpeed = $window.scrollY - positionBeforeMaxSpeed;
          
          // The scroll amount at max speed should be greater than at default speed
          expect(scrollAmountAtMaxSpeed).to.be.greaterThan(scrollAmountAtDefaultSpeed);
          
          // Stop scrolling
          cy.get('[data-testid="auto-scroll-toggle"]').click();
        });
      });
    });
  });
  
  it('should not have horizontal overflow on mobile', () => {
    // Set viewport to mobile size
    cy.viewport('iphone-6');
    
    // Check the chord content container
    cy.get('[data-testid="chord-content"]').should('be.visible');
    
    // Make sure no horizontal scrollbar exists
    cy.window().then(($window) => {
      // Check if document width equals window width (no horizontal overflow)
      expect($window.document.documentElement.scrollWidth).to.equal($window.innerWidth);
    });
    
    // Check that chord lines don't overflow
    cy.get('.chord-line').each(($el) => {
      const elementWidth = $el[0].getBoundingClientRect().width;
      cy.window().then(($window) => {
        // Element width should be less than or equal to viewport width
        expect(elementWidth).to.be.at.most($window.innerWidth);
      });
    });
  });
});
