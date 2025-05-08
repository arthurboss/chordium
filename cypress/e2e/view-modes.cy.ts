
describe('Chord Sheet View Modes', () => {
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

e|---3---2---0---3---|
B|---0---3---1---0---|
G|---0---2---0---0---|
D|---0---0---2---0---|
A|---2-------3---2---|
E|---3-----------3---|
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

  it('should toggle between normal, chords-only, and lyrics-only modes', () => {
    // Check normal mode (default)
    cy.get('.chord-line').should('exist').and('be.visible');
    cy.get('.lyrics-line').should('exist').and('be.visible');
    cy.get('pre').should('exist').and('be.visible'); // Guitar tabs
    
    // Switch to chords-only mode
    cy.contains('button', 'Chords Only').click();
    cy.get('.chord-line').should('exist').and('be.visible');
    cy.get('.lyrics-line').should('not.exist');
    cy.get('pre').should('exist').and('be.visible'); // Guitar tabs should be visible
    
    // Switch to lyrics-only mode
    cy.contains('button', 'Lyrics Only').click();
    cy.get('.chord-line').should('not.exist');
    cy.get('.lyrics-line').should('exist').and('be.visible');
    cy.get('pre').should('not.exist'); // Guitar tabs should be hidden
    
    // Back to normal mode
    cy.contains('button', 'Normal').click();
    cy.get('.chord-line').should('exist').and('be.visible');
    cy.get('.lyrics-line').should('exist').and('be.visible');
    cy.get('pre').should('exist').and('be.visible');
  });

  it('should toggle guitar tabs visibility', () => {
    // Guitar tabs should be visible by default
    cy.get('pre').should('exist').and('be.visible');
    
    // Hide guitar tabs
    cy.contains('Hide Guitar Tabs').click();
    cy.get('pre').should('not.exist');
    
    // Show guitar tabs again
    cy.contains('Show Guitar Tabs').click();
    cy.get('pre').should('exist').and('be.visible');
  });

  it('should maintain view mode when using other controls', () => {
    // Switch to lyrics-only mode
    cy.contains('button', 'Lyrics Only').click();
    cy.get('.chord-line').should('not.exist');
    
    // Change font size, mode should persist
    cy.get('button[title="Increase Font Size"]').click();
    cy.get('.chord-line').should('not.exist');
    cy.get('.lyrics-line').should('exist').and('be.visible');
    
    // Change transpose, mode should persist
    cy.get('button[title="Increase Transpose"]').click();
    cy.get('.chord-line').should('not.exist');
    cy.get('.lyrics-line').should('exist').and('be.visible');
  });
});
