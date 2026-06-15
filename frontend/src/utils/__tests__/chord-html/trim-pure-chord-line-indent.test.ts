import { describe, it, expect } from 'vitest';
import { trimPureChordLineIndent } from '../../chord-html/trim-pure-chord-line-indent';

describe('trimPureChordLineIndent', () => {
  it('removes leading whitespace from a pure chord line (only <b> tags)', () => {
    expect(trimPureChordLineIndent('   <b>G</b>  <b>C</b>')).toBe('<b>G</b>  <b>C</b>');
  });

  it('leaves lyric lines with leading whitespace untouched', () => {
    expect(trimPureChordLineIndent('   some lyric')).toBe('   some lyric');
  });

  it('leaves a mixed line (chord + lyric) untouched', () => {
    expect(trimPureChordLineIndent('   <b>G</b> some lyric')).toBe('   <b>G</b> some lyric');
  });

  it('handles multi-line input correctly', () => {
    const input = '   <b>Am</b>\n   lyric\n   <b>Em</b>';
    expect(trimPureChordLineIndent(input)).toBe('<b>Am</b>\n   lyric\n<b>Em</b>');
  });
});
