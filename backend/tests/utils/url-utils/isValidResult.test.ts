import { describe, it, expect } from '@jest/globals';
import { isValidResult } from '../../../utils/url-utils.js';
import SEARCH_TYPES from '../../../constants/searchTypes.js';
import type { SearchType } from '../../../../shared/types/index.js';

describe('isValidResult', () => {
  describe('Path-based validation', () => {
    it('should validate song results with path property', () => {
      const validSongResult = {
        title: 'Touch The Sky',
        path: 'hillsong-united/touch-the-sky',
        artist: 'Hillsong United'
      };

      expect(isValidResult(validSongResult, SEARCH_TYPES.SONG)).toBe(true);
    });

    it('should validate artist results with path property', () => {
      const validArtistResult = {
        title: 'Hillsong United - Cifra Club',
        path: 'hillsong-united',
        artist: 'Hillsong United'
      };

      expect(isValidResult(validArtistResult, SEARCH_TYPES.ARTIST)).toBe(true);
    });

    it('should reject results without path property', () => {
      const invalidResult = {
        title: 'Touch The Sky',
        artist: 'Hillsong United'
        // Missing path property
      };

      expect(isValidResult(invalidResult as unknown as { path: string }, SEARCH_TYPES.SONG)).toBe(false);
    });

    it('should reject results with empty path', () => {
      const invalidResult = {
        title: 'Touch The Sky',
        path: '',
        artist: 'Hillsong United'
      };

      expect(isValidResult(invalidResult, SEARCH_TYPES.SONG)).toBe(false);
    });

    it('should reject song results with wrong path segments', () => {
      const invalidSongResult = {
        title: 'Hillsong United',
        path: 'hillsong-united', // Should have 2 segments for songs
        artist: 'Hillsong United'
      };

      expect(isValidResult(invalidSongResult, SEARCH_TYPES.SONG)).toBe(false);
    });

    it('should reject artist results with wrong path segments', () => {
      const invalidArtistResult = {
        title: 'Touch The Sky',
        path: 'hillsong-united/touch-the-sky', // Should have 1 segment for artists
        artist: 'Hillsong United'
      };

      expect(isValidResult(invalidArtistResult, SEARCH_TYPES.ARTIST)).toBe(false);
    });

    it('should reject results with .html paths', () => {
      const invalidResult = {
        title: 'Touch The Sky',
        path: 'hillsong-united/touch-the-sky.html',
        artist: 'Hillsong United'
      };

      expect(isValidResult(invalidResult, SEARCH_TYPES.SONG)).toBe(false);
    });

    it('should handle paths with leading/trailing slashes', () => {
      const validResult = {
        title: 'Touch The Sky',
        path: '/hillsong-united/touch-the-sky/',
        artist: 'Hillsong United'
      };

      expect(isValidResult(validResult, SEARCH_TYPES.SONG)).toBe(true);
    });

    it('should reject unknown search types', () => {
      const result = { path: 'test/path' };
      expect(isValidResult(result, 'UNKNOWN' as SearchType)).toBe(false);
    });
  });
});
