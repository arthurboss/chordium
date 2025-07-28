import { buildSearchQuery, determineSearchType } from '../../utils/search.utils.js';
import { SEARCH_TYPES } from '../../../shared/types/index.js';

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
  it('returns ARTIST if only artist is provided', () => {
    expect(determineSearchType('Adele', '')).toBe(SEARCH_TYPES.ARTIST);
  });
  it('returns SONG if only song is provided', () => {
    expect(determineSearchType('', 'Hello')).toBe(SEARCH_TYPES.SONG);
  });
  it('returns SONG if both artist and song are provided', () => {
    expect(determineSearchType('Adele', 'Hello')).toBe(SEARCH_TYPES.SONG);
  });
  it('returns null if neither is provided', () => {
    expect(determineSearchType('', '')).toBeNull();
  });
});
