import { describe, it, expect } from 'vitest';
import { trimPureChordLineIndent } from '../../chord-html/trim-pure-chord-line-indent';

describe('trimPureChordLineIndent', () => {
  it('removes leading whitespace from a standalone pure chord line (no following lyric)', () => {
    expect(trimPureChordLineIndent('lyric\n   <b>G</b>  <b>C</b>')).toBe('lyric\n<b>G</b>  <b>C</b>');
  });

  it('leaves lyric lines with leading whitespace untouched', () => {
    expect(trimPureChordLineIndent('   some lyric')).toBe('   some lyric');
  });

  it('leaves a mixed line (chord + lyric) untouched', () => {
    expect(trimPureChordLineIndent('   <b>G</b> some lyric')).toBe('   <b>G</b> some lyric');
  });

  it('preserves indentation of a chord-position row paired with a real lyric line below (mid-word chord alignment)', () => {
    // Chord "G" sits at column 11, over "rts" in "hea[G]rts" -- trimming this
    // indent would collapse it to column 0 and break the visual alignment.
    const input = '           <b>G</b>\nAnd the hearts all over the world tonight';
    expect(trimPureChordLineIndent(input)).toBe(input);
  });

  it('still trims a standalone chord line at the end of the sheet (no following line)', () => {
    expect(trimPureChordLineIndent('lyric\n   <b>G</b>')).toBe('lyric\n<b>G</b>');
  });

  it('still trims a standalone chord line followed by a blank line', () => {
    expect(trimPureChordLineIndent('   <b>G</b>\n\nlyric')).toBe('<b>G</b>\n\nlyric');
  });

  it('still trims a standalone instrumental chord line followed by another chord line', () => {
    const input = 'lyric\n   <b>Em</b>  <b>G</b>\n   <b>Em</b>  <b>G</b>';
    expect(trimPureChordLineIndent(input)).toBe('lyric\n<b>Em</b>  <b>G</b>\n<b>Em</b>  <b>G</b>');
  });

  it('preserves a chord line indent when followed by a real lyric line, but still trims a trailing standalone chord line', () => {
    const input = '   <b>Am</b>\n   lyric\n   <b>Em</b>';
    expect(trimPureChordLineIndent(input)).toBe('   <b>Am</b>\n   lyric\n<b>Em</b>');
  });
});
