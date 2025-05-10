describe('Theme Functionality Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test and clear localStorage
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should use system theme by default', () => {
    // We are starting with a clean localStorage from beforeEach
    
    // Wait for component to initialize
    cy.wait(100);
    
    // Check that no theme is set in localStorage (meaning system theme is used)
    cy.getAllLocalStorage().then((localStorage) => {
      const baseUrl = Cypress.config('baseUrl') || '';
      // Either the localStorage object doesn't exist or it doesn't have a theme property
      if (localStorage[baseUrl]) {
        expect(localStorage[baseUrl]).to.not.have.property('theme');
      } else {
        expect(true).to.equal(true); // No localStorage means system theme
      }
    });

    // Theme toggle button should be visible
    cy.get('button[aria-label="Toggle theme"]').should('be.visible');

    // Check if the System option is highlighted in the dropdown
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.contains('System').parent().should('have.class', 'bg-accent');
  });

  it('should switch to light mode when selected', () => {
    // Use our custom command to set light theme
    cy.setTheme('light');
    
    // Verify localStorage has the right theme directly using window.localStorage
    cy.window().then(win => {
      expect(win.localStorage.getItem('theme')).to.equal('light');
    });
    
    // Verify the HTML element doesn't have the 'dark' class
    cy.get('html').should('not.have.class', 'dark');
    
    // Get theme and verify it's light
    cy.getCurrentTheme().should('eq', 'light');
    
    // Re-open dropdown and verify Light is highlighted
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.contains('Light').parent().should('have.class', 'bg-accent');
  });

  it('should switch to dark mode when selected', () => {
    // Make sure dropdown is closed initially
    cy.get('body').click('top');
    
    // Explicitly click on the theme button and then Dark option
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.contains('Dark').click().then(() => {
      // Wait for theme to be applied
      cy.wait(200);
      
      // Verify localStorage has the right theme directly using window.localStorage
      cy.window().then(win => {
        expect(win.localStorage.getItem('theme')).to.equal('dark');
      });
      
      // Verify the HTML element has the 'dark' class
      cy.get('html').should('have.class', 'dark');
      
      // Get theme and verify it's dark
      cy.getCurrentTheme().should('eq', 'dark');
      
      // Re-open dropdown and verify Dark is highlighted
      cy.get('button[aria-label="Toggle theme"]').click();
      
      // More robust way to verify the Dark option is highlighted
      cy.contains('span', 'Dark').parent().should('have.class', 'bg-accent');
    });
  });

  it('should return to system theme when selected', () => {
    // First set to dark mode
    cy.setTheme('dark');
    
    // Then switch back to system
    cy.setTheme('system');
    
    // Verify localStorage has no theme (system theme) directly using window.localStorage
    cy.window().then(win => {
      expect(win.localStorage.getItem('theme')).to.be.null;
    });
    
    // Re-open dropdown and verify System is highlighted
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.contains('System').parent().should('have.class', 'bg-accent');
  });
  
  it('should persist theme preference after page reload', () => {
    // Set to dark mode
    cy.setTheme('dark');
    
    // Reload the page
    cy.reload();
    
    // Get theme and verify it's still dark
    cy.getCurrentTheme().should('eq', 'dark');
    
    // Re-open dropdown and verify Dark is still highlighted
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.contains('Dark').parent().should('have.class', 'bg-accent');
  });
  
  // This test mocks the system preference to ensure our app properly responds to it
  it('should respect system dark mode preference', () => {
    // First clear localStorage to ensure no theme preference is set
    cy.clearLocalStorage();
    
    // Mock the system preference using a CSS media query override
    cy.visit('/', {
      onBeforeLoad(win) {
        // Create a more complete stub for matchMedia
        cy.stub(win, 'matchMedia').callsFake((query) => {
          return {
            matches: query === '(prefers-color-scheme: dark)' ? true : false,
            media: query,
            onchange: null,
            addListener: cy.stub(),
            removeListener: cy.stub(),
            addEventListener: cy.stub(),
            removeEventListener: cy.stub(),
            dispatchEvent: cy.stub()
          };
        });
      }
    });
    
    // Wait for ThemeToggle component to initialize
    cy.wait(500); 
    
    // Get theme and verify it's dark (from system preference)
    cy.get('html').should('have.class', 'dark');
    cy.getCurrentTheme().should('eq', 'dark');
    
    // Open dropdown and verify System is highlighted
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.contains('System').parent().should('have.class', 'bg-accent');
  });
  
  it('should respect system light mode preference', () => {
    // First clear localStorage to ensure no theme preference is set
    cy.clearLocalStorage();
    
    // Mock the system preference using a CSS media query override
    cy.visit('/', {
      onBeforeLoad(win) {
        // Create a more complete stub for matchMedia
        cy.stub(win, 'matchMedia').callsFake((query) => {
          return {
            matches: query === '(prefers-color-scheme: dark)' ? false : true,
            media: query,
            onchange: null,
            addListener: cy.stub(),
            removeListener: cy.stub(),
            addEventListener: cy.stub(),
            removeEventListener: cy.stub(),
            dispatchEvent: cy.stub()
          };
        });
      }
    });
    
    // Wait for ThemeToggle component to initialize
    cy.wait(500);
    
    // Get theme and verify it's light (from system preference)
    cy.get('html').should('not.have.class', 'dark');
    cy.getCurrentTheme().should('eq', 'light');
    
    // Open dropdown and verify System is highlighted
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.contains('System').parent().should('have.class', 'bg-accent');
  });
});
