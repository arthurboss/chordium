// API mocks for artist search tests

export const setupIntercepts = () => {
  // Clear all existing intercepts first
  cy.intercept('**', (req) => {
    console.log(`[Network] ${req.method} ${req.url}`);
    req.continue();
  });
  
  // Mock artist search endpoint
  cy.intercept('GET', '**/api/artists**', (req) => {
    console.log('Intercepted artist search request:', req.query);
    req.reply({
      statusCode: 200,
      fixture: 'artists.json',
      headers: { 'x-mock-type': 'artist-search' }
    });
  }).as('artistSearch');
  
  // Mock CifraClub endpoint
  cy.intercept('GET', '**/api/cifraclub-search**', (req) => {
    console.log('Intercepted CifraClub search request:', req.query);
    req.reply({ 
      statusCode: 200, 
      fixture: 'cifraclub-search.json',
      headers: { 'x-mock-type': 'cifraclub-search' }
    });
  }).as('cifraclubSearch');
  
  // Mock artist songs endpoint
  cy.intercept('GET', '**/api/artist-songs**', (req) => {
    console.log('Intercepted artist songs request:', req.query);
    req.reply({
      statusCode: 200,
      fixture: 'artist-songs/hillsong-united.json',
      headers: { 'x-mock-type': 'artist-songs' }
    });
  }).as('artistSongsAPI');
};
