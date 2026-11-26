describe('Songbook bulk selection', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-cy="tab-my-chord-sheets"]').click();
    cy.get('input[accept*=".json"]').selectFile(
      '../../frontend/fixtures/api/chordium-many-songs.json',
      { force: true }
    );
    cy.get('[data-cy^="chordsheet-title-"]').should('have.length.at.least', 40);
  });

  it('selects cards without opening them, then deletes the selection', () => {
    cy.get('[data-cy^="chordsheet-title-"]').then(($titles) => {
      const initial = $titles.length;

      cy.get('[data-cy^="select-card-"]').eq(0).click();
      cy.get('[data-cy="chord-sheet-scroll"]').should('exist');
      cy.get('[data-cy="bulk-actions"]').should('exist');
      cy.get('[data-cy="select-all-chord-sheets"]').should('have.attr', 'data-state', 'indeterminate');

      cy.get('[data-cy^="select-card-"]').eq(1).click();
      cy.get('[data-cy="bulk-actions"]').should('contain.text', '2 selected');
      cy.get('[data-cy="bulk-delete"]').click();
      cy.get('[data-cy="confirm-bulk-delete"]').click();

      cy.get('[data-cy^="chordsheet-title-"]').should('have.length', initial - 2);
    });
  });

  it('select all toggles every card and clears the bar', () => {
    cy.get('[data-cy="select-all-chord-sheets"]').click();
    cy.get('[data-cy="select-all-chord-sheets"]').should('have.attr', 'data-state', 'checked');
    cy.get('[data-cy="bulk-actions"]').should('exist');

    cy.get('[data-cy="select-all-chord-sheets"]').click();
    cy.get('[data-cy="select-all-chord-sheets"]').should('have.attr', 'data-state', 'unchecked');
    cy.get('[data-cy="bulk-actions"]').should('not.exist');
  });

  it('asks for confirmation and can undo the delete', () => {
    cy.get('[data-cy^="select-card-"]').eq(0).click();
    cy.get('[data-cy="bulk-delete"]').click();
    cy.get('[role="alertdialog"]').should('exist');

    cy.get('[data-cy="cancel-bulk-delete"]').click();
    cy.get('[role="alertdialog"]').should('not.exist');
    cy.get('[data-cy="bulk-actions"]').should('exist');

    cy.get('[data-cy^="chordsheet-title-"]').then(($titles) => {
      const initial = $titles.length;

      cy.get('[data-cy="bulk-delete"]').click();
      cy.get('[data-cy="confirm-bulk-delete"]').click();
      cy.get('[data-cy^="chordsheet-title-"]').should('have.length', initial - 1);

      cy.get('[data-sonner-toast] [data-button]').click();
      cy.get('[data-cy^="chordsheet-title-"]').should('have.length', initial);
    });
  });

  it('toggles selection when clicking a card while a selection is active', () => {
    cy.get('[data-cy^="select-card-"]').eq(0).click();
    cy.get('[data-cy="bulk-actions"]').should('contain.text', '1 selected');

    cy.get('[data-cy^="chordsheet-card-content-"]').eq(1).click();
    cy.get('[data-cy="bulk-actions"]').should('contain.text', '2 selected');
    cy.get('[data-cy="chord-sheet-scroll"]').should('exist');
  });

  it('drag-selects cards starting from a selected card', () => {
    cy.get('[data-cy^="select-card-"]').eq(0).click();
    cy.get('[data-cy="bulk-actions"]').should('contain.text', '1 selected');

    cy.window().then((win) => {
      const scroll = win.document.querySelector('[data-cy="chord-sheet-scroll"]') as HTMLElement;
      const contents = scroll.querySelectorAll('[data-cy^="chordsheet-card-content-"]');
      const start = contents[0].getBoundingClientRect();
      const target = contents[1].getBoundingClientRect();
      const startX = start.x + 10;
      const startY = start.y + 10;
      const targetX = target.x + 10;
      const targetY = target.y + 10;

      contents[0].dispatchEvent(new win.PointerEvent('pointerdown', {
        bubbles: true, pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, clientX: startX, clientY: startY,
      }));
      scroll.dispatchEvent(new win.PointerEvent('pointermove', {
        bubbles: true, pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: targetX, clientY: targetY,
      }));
      scroll.dispatchEvent(new win.PointerEvent('pointerup', {
        bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: targetX, clientY: targetY,
      }));
    });

    cy.get('[data-cy="bulk-actions"]').should('contain.text', '2 selected');

    // Dragging over an already-selected card unselects it again.
    cy.window().then((win) => {
      const scroll = win.document.querySelector('[data-cy="chord-sheet-scroll"]') as HTMLElement;
      const contents = scroll.querySelectorAll('[data-cy^="chordsheet-card-content-"]');
      const start = contents[0].getBoundingClientRect();
      const target = contents[1].getBoundingClientRect();
      const startX = start.x + 10;
      const startY = start.y + 10;
      const targetX = target.x + 10;
      const targetY = target.y + 10;

      contents[0].dispatchEvent(new win.PointerEvent('pointerdown', {
        bubbles: true, pointerId: 2, pointerType: 'mouse', button: 0, buttons: 1, clientX: startX, clientY: startY,
      }));
      scroll.dispatchEvent(new win.PointerEvent('pointermove', {
        bubbles: true, pointerId: 2, pointerType: 'mouse', buttons: 1, clientX: targetX, clientY: targetY,
      }));
      scroll.dispatchEvent(new win.PointerEvent('pointerup', {
        bubbles: true, pointerId: 2, pointerType: 'mouse', clientX: targetX, clientY: targetY,
      }));
    });

    cy.get('[data-cy="bulk-actions"]').should('contain.text', '1 selected');
  });
});
