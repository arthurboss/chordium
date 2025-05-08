
describe('Chord Sheet Auto Scroll', () => {
  const chordSheetData = `
[Verse 1]
G       D        C         G
Hello there, the angel from my nightmare
G       D        C         G
The shadow in the background of the morgue
G       D        C         G
The unsuspecting victim of darkness in the valley
G       D        C
We can live like Jack and Sally if we want

[Chorus]
G       D        C         G
Where you can always find me
G       D        C         G
And we'll have Halloween on Christmas
G       D        C         G
And in the night we'll wish this never ends
G       D        C         G
We'll wish this never ends

e|---3---2---0---3---|
B|---0---3---1---0---|
G|---0---2---0---0---|
D|---0---0---2---0---|
A|---2-------3---2---|
E|---3-----------3---|

[Verse 2]
G       D        C         G
I miss you, I miss you
G       D        C         G
I miss you, I miss you
`;

  beforeEach(() => {
    cy.visit('/');
    
    // Setup a chord sheet for testing
    cy.window().then((win) => {
      win.localStorage.setItem('chord_content', chordSheetData);
    });
    
    cy.reload();
    cy.get('#chord-display').should('exist');
  });

  it('should toggle auto scroll when play button is clicked', () => {
    // Start auto-scroll
    cy.get('button[title="Start Auto-Scroll"], button[title="Stop Auto-Scroll"]').first().click();
    
    // Check that speed control appears
    cy.get('.text-sm.font-medium').contains('x').should('be.visible');
    
    // Stop auto-scroll
    cy.get('button[title="Start Auto-Scroll"], button[title="Stop Auto-Scroll"]').first().click();
    
    // Check that speed control disappears
    cy.get('.text-sm.font-medium').contains('x').should('not.exist');
  });

  it('should change scroll speed', () => {
    // Start auto-scroll
    cy.get('button[title="Start Auto-Scroll"], button[title="Stop Auto-Scroll"]').first().click();
    
    // Get initial speed value
    cy.get('.text-sm.font-medium').contains('x').invoke('text').then((initialSpeed) => {
      
      // Click on slider to change speed
      cy.get('.w-28, .w-32').first().click('right');
      
      // Verify speed changed
      cy.get('.text-sm.font-medium').contains('x').invoke('text').should('not.eq', initialSpeed);
    });
  });

  it('should stop auto scroll when reaching the bottom of the page', () => {
    // Start auto-scroll
    cy.get('button[title="Start Auto-Scroll"], button[title="Stop Auto-Scroll"]').first().click();
    
    // Wait for auto-scroll to reach the bottom
    // Note: This is tricky to test because we need to force the scroll to reach the bottom
    cy.window().then((win) => {
      // Force scroll to bottom
      win.scrollTo(0, win.document.body.scrollHeight);
      
      // Small delay to let the auto-scroll logic detect the bottom
      cy.wait(500);
      
      // Check if auto-scroll stopped
      cy.get('.text-sm.font-medium').contains('x').should('not.exist');
    });
  });
});
