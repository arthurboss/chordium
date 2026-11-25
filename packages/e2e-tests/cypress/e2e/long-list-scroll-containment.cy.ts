// Regression coverage for the songbook's 60vh scroller: absolutely positioned
// screen-reader text inside each card must stay clipped by that scroller, and
// the scroller itself must not hand its remaining scroll to the page.
describe('Long chord sheet list scroll containment', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
  });

  it('keeps the page height at the viewport when the songbook overflows', () => {
    cy.get('input[accept*=".json"]').selectFile(
      '../../frontend/fixtures/api/chordium-many-songs.json',
      { force: true }
    );

    cy.get('[data-cy^="chordsheet-title-"]').should('have.length.at.least', 40);

    cy.get('[data-cy="chord-sheet-scroll"]').then(($list) => {
      const list = $list[0];
      expect(list.scrollHeight).to.be.greaterThan(list.clientHeight);
    });

    cy.window().then((win) => {
      const list = win.document.querySelector('[data-cy="chord-sheet-scroll"]') as HTMLElement;
      // The page may be a couple of pixels taller than a short test viewport,
      // but the list's hidden rows must not add their full height to it.
      expect(win.document.documentElement.scrollHeight).to.be.at.most(win.innerHeight + 1);
      expect(win.document.documentElement.scrollHeight).to.be.lessThan(list.scrollHeight);
      expect(win.getComputedStyle(list).overscrollBehaviorY).to.equal('contain');

      const card = list.closest('.bg-card') as HTMLElement;
      const footer = win.document.querySelector('footer') as HTMLElement;
      expect(footer.getBoundingClientRect().top - card.getBoundingClientRect().bottom).to.be.lessThan(40);
    });
  });

  it('caps a short results section at the same 60vh scroller', () => {
    cy.intercept('GET', '/api/search*', {
      statusCode: 200,
      body: Array.from({ length: 12 }, (_, i) => ({
        type: 'song',
        path: `fixture-artist/fixture-song-${i}`,
        title: `Fixture Song ${i}`,
        artist: 'Fixture Artist',
        match: 'title',
      })),
    }).as('shortSearch');

    cy.visit('/search?q=fixture&section=songs');
    cy.wait('@shortSearch');
    cy.contains('Fixture Song 0').should('be.visible');

    cy.window().then((win) => {
      const scrollable = win.document.querySelector('[data-cy="results-scroll"]');
      expect(Boolean(scrollable)).to.equal(true);

      const list = scrollable as HTMLElement;
      expect(list.scrollHeight).to.be.greaterThan(list.clientHeight);
      expect(win.getComputedStyle(list).overscrollBehaviorY).to.equal('contain');
      expect(win.document.documentElement.scrollHeight).to.be.at.most(win.innerHeight + 2);
    });
  });

  it('fits a virtualized results section inside the viewport', () => {
    cy.intercept('GET', '/api/search*', {
      statusCode: 200,
      body: Array.from({ length: 40 }, (_, i) => ({
        type: 'song',
        path: `fixture-artist/fixture-song-${i}`,
        title: `Fixture Song ${i}`,
        artist: 'Fixture Artist',
        match: 'title',
      })),
    }).as('longSearch');

    cy.visit('/search?q=fixture&section=songs');
    cy.wait('@longSearch');
    cy.get('[data-index]').should('have.length.greaterThan', 0);

    cy.window().then((win) => {
      const list = win.document.querySelector('[data-cy="results-scroll"]') as HTMLElement;
      expect(win.getComputedStyle(list).overscrollBehaviorY).to.equal('contain');
      expect(win.document.documentElement.scrollHeight).to.be.at.most(win.innerHeight + 2);

      const card = list.closest('.bg-card') as HTMLElement;
      const footer = win.document.querySelector('footer') as HTMLElement;
      expect(footer.getBoundingClientRect().top - card.getBoundingClientRect().bottom).to.be.lessThan(40);
    });
  });
});
