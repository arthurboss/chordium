import { describe, it, expect } from 'vitest';
import { removeChordsForLyricsOnly } from '../../chord-html/remove-chords-for-lyrics-only';

describe('removeChordsForLyricsOnly', () => {
  it('removes pure chord lines (lines containing only <b> tags)', () => {
    const result = removeChordsForLyricsOnly('<b>G</b>  <b>C</b>\nsome lyric');
    expect(result).not.toContain('<b>');
    expect(result).toContain('some lyric');
  });

  it('removes chord lines wrapped in parentheses', () => {
    const input = '( <b>Bm</b>  <b>A</b>  <b>D</b> )\nsome lyric';
    const result = removeChordsForLyricsOnly(input);
    expect(result).not.toContain('(');
    expect(result).not.toContain(')');
    expect(result).toContain('some lyric');
  });

  it('removes chord lines wrapped in square brackets', () => {
    const input = '[ <b>Am</b>  <b>Em</b> ]\nsome lyric';
    const result = removeChordsForLyricsOnly(input);
    expect(result).not.toContain('[');
    expect(result).not.toContain(']');
    expect(result).toContain('some lyric');
  });

  it('handles consecutive parenthesised chord lines', () => {
    const input = [
      'In the presence of my Savior',
      '',
      '( <b>Bm</b>  <b>A</b>  <b>D</b>  <b>A</b>  <b>Em</b> )',
      '( <b>Bm</b>  <b>A</b>  <b>D</b>  <b>A</b>  <b>Em</b> )',
      '',
      'Refrão Final',
    ].join('\n');
    const result = removeChordsForLyricsOnly(input);
    expect(result).not.toContain('(');
    expect(result).toContain('In the presence of my Savior');
    expect(result).toContain('Refrão Final');
  });

  it('strips <b> tags from mixed lines and keeps the lyric text', () => {
    const result = removeChordsForLyricsOnly('<b>Am</b> a lyric with a chord above it');
    expect(result).toContain('a lyric with a chord above it');
    expect(result).not.toContain('<b>');
  });

  it('preserves empty lines (section separators)', () => {
    expect(removeChordsForLyricsOnly('lyric one\n\nlyric two')).toContain('\n\n');
  });

  it('drops trailing section titles (nothing after them)', () => {
    const input = 'lyric\n<span class="section-title">[Outro]</span>';
    expect(removeChordsForLyricsOnly(input)).not.toContain('section-title');
  });

  it('drops consecutive section titles, keeping only the last one before content', () => {
    const input = '<span class="section-title">[A]</span>\n<span class="section-title">[B]</span>\nlyric';
    const result = removeChordsForLyricsOnly(input);
    expect((result.match(/section-title/g) || []).length).toBe(1);
    expect(result).toContain('[B]');
  });

  it('ensures exactly one blank line before a section title', () => {
    const input = 'lyric\n<span class="section-title">[Verse]</span>\nmore lyric';
    expect(removeChordsForLyricsOnly(input)).toMatch(/\n\n<span class="section-title">/);
  });

  it('collapses 3+ consecutive newlines to 2', () => {
    expect(removeChordsForLyricsOnly('a\n\n\n\nb')).toBe('a\n\nb');
  });

  it('removes leading newlines', () => {
    expect(removeChordsForLyricsOnly('\n\nlyric')).not.toMatch(/^\n/);
  });

  it('handles a real-world chord+lyric block', () => {
    const input = [
      '<b>G</b>  <b>G/B</b>            <b>C9</b>',
      '       Chord sheet lyric line',
      '    <b>Am7</b>',
      'Another lyric line',
    ].join('\n');
    const result = removeChordsForLyricsOnly(input);
    expect(result).not.toContain('<b>');
    expect(result).toContain('Chord sheet lyric line');
    expect(result).toContain('Another lyric line');
  });
});
