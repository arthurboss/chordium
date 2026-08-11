import { describe, it, expect } from 'vitest';
import { extractLyricsFromChordSheet } from '../extract-lyrics';

describe('extractLyricsFromChordSheet', () => {
  it('returns nothing when there is no content', () => {
    expect(extractLyricsFromChordSheet(undefined, undefined)).toBe('');
    expect(extractLyricsFromChordSheet(undefined, '')).toBe('');
  });

  it('drops chord-only lines and keeps the words', () => {
    const html = '<b>G</b>  <b>C</b>\nToday is gonna be the day';
    expect(extractLyricsFromChordSheet(html)).toBe('Today is gonna be the day');
  });

  it('strips chords sitting above a lyric line', () => {
    const result = extractLyricsFromChordSheet('<b>Am</b>\nBackbeat, the word is on the street');
    expect(result).toBe('Backbeat, the word is on the street');
    expect(result).not.toContain('Am');
  });

  it('keeps the blank line between stanzas', () => {
    const html = 'first line\n\nsecond stanza';
    expect(extractLyricsFromChordSheet(html)).toBe('first line\n\nsecond stanza');
  });

  it('leaves no markup behind', () => {
    const result = extractLyricsFromChordSheet('<b>D</b>\n<span class="section-title">Chorus</span>\nand all the roads');
    expect(result).not.toMatch(/[<>]/);
    expect(result).toContain('and all the roads');
  });

  it('omits section titles, which are rendered from translated labels', () => {
    const result = extractLyricsFromChordSheet('<span class="section-title">Intro</span>\nsome words');
    expect(result).not.toContain('Intro');
    expect(result).toContain('some words');
  });

  it('decodes entities so words read normally', () => {
    expect(extractLyricsFromChordSheet('me &amp; you')).toBe('me & you');
  });

  it('accepts plain-text chord sheets as well as scraped html', () => {
    const result = extractLyricsFromChordSheet(undefined, 'C  G\nsomething here');
    expect(result).toContain('something here');
  });

  it('removes tab blocks, which have no words to sing', () => {
    const result = extractLyricsFromChordSheet('E|--0--2--\nB|--1--3--\nsung words');
    expect(result).toContain('sung words');
    expect(result).not.toContain('|--0--');
  });
});
