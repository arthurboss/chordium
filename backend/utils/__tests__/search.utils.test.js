import { buildSearchQuery, determineSearchType } from '../search.utils.js';

describe('buildSearchQuery', () => {
  it('returns artist and song concatenated if both are provided', () => {
    expect(buildSearchQuery('Adele', 'Hello')).toBe('Adele Hello');
  });
  it('returns artist if only artist is provided', () => {
    expect(buildSearchQuery('Adele', '')).toBe('Adele');
  });
  it('returns song if only song is provided', () => {
    expect(buildSearchQuery('', 'Hello')).toBe('Hello');
  });
  it('returns empty string if neither is provided', () => {
    expect(buildSearchQuery('', '')).toBe('');
  });
});

describe('determineSearchType', () => {
  const SEARCH_TYPES = { ARTIST: 'ARTIST', SONG: 'SONG' };
  it('returns ARTIST if only artist is provided', () => {
    expect(determineSearchType('Adele', '', SEARCH_TYPES)).toBe('ARTIST');
  });
  it('returns SONG if only song is provided', () => {
    expect(determineSearchType('', 'Hello', SEARCH_TYPES)).toBe('SONG');
  });
  it('returns SONG if both artist and song are provided', () => {
    expect(determineSearchType('Adele', 'Hello', SEARCH_TYPES)).toBe('SONG');
  });
  it('returns null if neither is provided', () => {
    expect(determineSearchType('', '', SEARCH_TYPES)).toBeNull();
  });
});
