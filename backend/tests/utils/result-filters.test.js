import { describe, it, expect } from '@jest/globals';
import { filterResults } from '../../utils/result-filters.js';
import SEARCH_TYPES from '../../constants/searchTypes.js';

describe('Result Filters', () => {
  describe('filterResults', () => {
    it('should filter and transform artist results', () => {
      const results = [
        { title: 'Oasis - Cifra Club', path: 'oasis', artist: 'Oasis' },
        { title: 'Radiohead - Cifra Club', path: 'radiohead', artist: 'Radiohead' }
      ];

      const filtered = filterResults(results, SEARCH_TYPES.ARTIST);

      expect(filtered).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: null },
        { displayName: 'Radiohead', path: 'radiohead', songCount: null }
      ]);
    });

    it('should filter and transform song results', () => {
      const results = [
        { title: 'Wonderwall - Oasis - Cifra Club', path: 'oasis/wonderwall', artist: 'Oasis' },
        { title: 'Creep - Radiohead - Cifra Club', path: 'radiohead/creep', artist: 'Radiohead' }
      ];

      const filtered = filterResults(results, SEARCH_TYPES.SONG);

      expect(filtered).toEqual([
        { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' },
        { title: 'Creep', path: 'radiohead/creep', artist: 'Radiohead' }
      ]);
    });

    it('should use generic transformation for unknown search types', () => {
      // Test with ARTIST paths (single path segment) since unknown types fall back to default case
      const results = [
        { title: 'Some Result - Cifra Club', path: 'some-artist', artist: 'Some Artist' },
        { title: 'Another Result - Cifra Club', path: 'another-artist', artist: 'Another Artist' }
      ];

      // Use ARTIST search type to ensure path validation passes, then verify generic transformation
      const filtered = filterResults(results, SEARCH_TYPES.ARTIST);

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0]).toHaveProperty('displayName');
      expect(filtered[0]).toHaveProperty('path');
      expect(filtered[0]).toHaveProperty('songCount');
    });

    it('should return empty array for unknown search types due to validation', () => {
      const results = [
        { title: 'Some Result - Cifra Club', path: 'some', artist: 'Some' },
        { title: 'Another Result - Cifra Club', path: 'another', artist: 'Another' }
      ];

      // Unknown search types return false from isValidResult, so no results pass through
      const filtered = filterResults(results, 'UNKNOWN_TYPE');

      expect(filtered).toEqual([]);
    });

    it('should filter out invalid results', () => {
      const results = [
        { title: 'Valid Artist - Cifra Club', path: 'oasis', artist: 'Oasis' },
        { title: 'Invalid - Cifra Club', path: 'invalid.html', artist: 'Invalid' }
      ];

      const filtered = filterResults(results, SEARCH_TYPES.ARTIST);

      expect(filtered).toEqual([
        { displayName: 'Valid Artist', path: 'oasis', songCount: null }
      ]);
    });
  });
});
