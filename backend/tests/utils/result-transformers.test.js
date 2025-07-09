import { describe, it, expect } from '@jest/globals';
import { 
  transformToArtistResults, 
  transformToSongResults, 
  transformToGenericResults 
} from '../../utils/result-transformers.js';

/**
 * Tests for result transformers that convert raw DOM extraction data 
 * into final API response format for the frontend.
 * 
 * Input: Raw data from DOM extractors (includes 'url' field for validation)
 * Output: Clean API format (only title/path/artist for songs, no 'url' field)
 * 
 * These transformers ensure the frontend receives properly formatted data
 * while the backend retains the 'url' field for internal validation.
 */

describe('Result Transformers', () => {
  describe('transformToArtistResults', () => {
    it('should transform results to artist objects', () => {
      const results = [
        { title: 'Oasis - Cifra Club', path: 'oasis', artist: 'Oasis' },
        { title: 'Radiohead - Cifra Club', path: 'radiohead', artist: 'Radiohead' }
      ];

      const transformed = transformToArtistResults(results);

      expect(transformed).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: null },
        { displayName: 'Radiohead', path: 'radiohead', songCount: null }
      ]);
    });

    it('should filter out results with invalid paths', () => {
      const results = [
        { title: 'Oasis - Cifra Club', path: 'oasis', artist: 'Oasis' },
        { title: 'Invalid - Cifra Club', path: '', artist: 'Invalid' }
      ];

      const transformed = transformToArtistResults(results);

      expect(transformed).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: null }
      ]);
    });
  });

  describe('transformToSongResults', () => {
    it('should transform results to song objects with artist information', () => {
      const results = [
        { 
          title: 'Wonderwall - Oasis - Cifra Club', 
          path: 'oasis/wonderwall',
          artist: 'Oasis'
        },
        { 
          title: 'Creep - Radiohead - Cifra Club', 
          path: 'radiohead/creep',
          artist: 'Radiohead'
        }
      ];

      const transformed = transformToSongResults(results);

      expect(transformed).toEqual([
        { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' },
        { title: 'Creep', path: 'radiohead/creep', artist: 'Radiohead' }
      ]);
    });

    it('should preserve path field in final API response', () => {
      const results = [
        { 
          title: 'Wonderwall - Oasis - Cifra Club', 
          path: 'oasis/wonderwall',
          artist: 'Oasis'
        }
      ];

      const transformed = transformToSongResults(results);

      // Verify that path field is included in final response
      expect(transformed[0]).toHaveProperty('path');
      expect(transformed).toEqual([
        { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' }
      ]);
    });

    it('should handle songs without artist information', () => {
      const results = [
        { 
          title: 'Wonderwall - Cifra Club', 
          path: 'oasis/wonderwall',
          artist: ''
        }
      ];

      const transformed = transformToSongResults(results);

      expect(transformed).toEqual([
        { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' }
      ]);
    });
  });

  describe('transformToGenericResults', () => {
    it('should remove Cifra Club suffix from titles', () => {
      const results = [
        { title: 'Some Result - Cifra Club', url: 'https://example.com/1' },
        { title: 'Another Result - Cifra Club', url: 'https://example.com/2' }
      ];

      const transformed = transformToGenericResults(results);

      expect(transformed).toEqual([
        { title: 'Some Result', url: 'https://example.com/1' },
        { title: 'Another Result', url: 'https://example.com/2' }
      ]);
    });

    it('should preserve other result properties', () => {
      const results = [
        { 
          title: 'Some Result - Cifra Club', 
          url: 'https://example.com/1',
          customProperty: 'test'
        }
      ];

      const transformed = transformToGenericResults(results);

      expect(transformed).toEqual([
        { 
          title: 'Some Result', 
          url: 'https://example.com/1',
          customProperty: 'test'
        }
      ]);
    });
  });
});
