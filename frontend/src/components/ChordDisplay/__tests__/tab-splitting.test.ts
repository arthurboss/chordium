import { describe, it, expect } from 'vitest';
import { processTabBlocks } from '../tab-splitting';

describe('processTabBlocks', () => {
  it('leaves a tab block untouched when it already fits within maxCols', () => {
    const html = '<span class="tablatura"><span class="cnt">E|-0-1-|\nB|-0-1-|</span></span>';

    expect(processTabBlocks(html, 40)).toBe(html);
  });

  it('re-wraps a leftover digit fragment in <b> when a split lands mid fret-number run', () => {
    // "9797975" (7 chars) split at column 20 lands after "979797", leaving
    // a lone "5" as the first character of the continuation chunk -- that
    // digit must still render bold/highlighted, not as plain text.
    const html =
      '<span class="tablatura"><span class="cnt">' +
      'E|--------------------------------------|\n' +
      'A|-<b>5454542</b>---<b>9797975</b>--------|</span></span>';

    const result = processTabBlocks(html, 20);

    // Every digit character must be wrapped in <b>...</b> somewhere in the
    // output -- none should appear as bare, unwrapped text.
    const cntMatch = result.match(/<span class="cnt">([\s\S]*?)<\/span><\/span>/);
    expect(cntMatch).not.toBeNull();
    const cnt = cntMatch![1];
    // Strip well-formed <b>digits</b> runs; anything left should have no
    // stray digits outside a <b> tag.
    const withoutBoldDigits = cnt.replace(/<b>\d+<\/b>/g, '');
    expect(withoutBoldDigits).not.toMatch(/\d/);
  });

  it('does not highlight dashes or pipe characters, only the digits', () => {
    const html =
      '<span class="tablatura"><span class="cnt">' +
      'E|--------------------------------------|\n' +
      'A|-<b>5454542</b>---<b>9797975</b>--------|</span></span>';

    const result = processTabBlocks(html, 20);

    expect(result).not.toContain('<b>-</b>');
    expect(result).not.toContain('<b>|</b>');
  });
});
