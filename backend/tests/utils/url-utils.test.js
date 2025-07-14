import { describe, it, expect } from '@jest/globals';
import { isValidResult, extractArtistSlug, extractFullPathFromUrl, normalizeArtistPath } from '../../utils/url-utils.ts';
import SEARCH_TYPES from '../../constants/searchTypes.ts';

describe('URL Utils', () => {
  describe('isValidResult - Legacy URL-based tests (deprecated)', () => {
    it('should return true for valid artist URL', () => {
      const result = { path: 'oasis' };
      expect(isValidResult(result, SEARCH_TYPES.ARTIST)).toBe(true);
    });

    it('should return true for valid song URL', () => {
      const result = { path: 'oasis/wonderwall' };
      expect(isValidResult(result, SEARCH_TYPES.SONG)).toBe(true);
    });

    it('should return false for HTML URLs', () => {
      const result = { url: 'https://www.cifraclub.com.br/oasis/wonderwall.html' };
      expect(isValidResult(result, SEARCH_TYPES.SONG)).toBe(false);
    });

    it('should return false for invalid URL format', () => {
      const result = { url: 'not-a-valid-url' };
      expect(isValidResult(result, SEARCH_TYPES.ARTIST)).toBe(false);
    });

    it('should return false for too many path segments in artist search', () => {
      const result = { url: 'https://www.cifraclub.com.br/oasis/wonderwall/tabs/' };
      expect(isValidResult(result, SEARCH_TYPES.ARTIST)).toBe(false);
    });

    it('should return false for too few path segments in song search', () => {
      const result = { url: 'https://www.cifraclub.com.br/oasis/' };
      expect(isValidResult(result, SEARCH_TYPES.SONG)).toBe(false);
    });

    it('should return false for unknown search type', () => {
      const result = { url: 'https://www.cifraclub.com.br/oasis/' };
      expect(isValidResult(result, 'UNKNOWN')).toBe(false);
    });
  });

  describe('extractArtistSlug', () => {
    it('should extract artist slug from valid URL', () => {
      const url = 'https://www.cifraclub.com.br/oasis/';
      expect(extractArtistSlug(url)).toBe('oasis');
    });

    it('should extract artist slug from URL without trailing slash', () => {
      const url = 'https://www.cifraclub.com.br/oasis';
      expect(extractArtistSlug(url)).toBe('oasis');
    });

    it('should return null for invalid URL', () => {
      const url = 'not-a-valid-url';
      expect(extractArtistSlug(url)).toBe(null);
    });

    it('should extract first segment from longer path', () => {
      const url = 'https://www.cifraclub.com.br/oasis/wonderwall/';
      expect(extractArtistSlug(url)).toBe('oasis');
    });
  });

  describe('extractArtistSlug (formerly extractPathFromUrl)', () => {
    it('should extract first path segment', () => {
      const url = 'https://www.cifraclub.com.br/oasis/wonderwall/';
      expect(extractArtistSlug(url)).toBe('oasis');
    });

    it('should handle URLs without trailing slash', () => {
      const url = 'https://www.cifraclub.com.br/oasis';
      expect(extractArtistSlug(url)).toBe('oasis');
    });

    it('should return null for invalid URL', () => {
      const url = 'not-a-valid-url';
      expect(extractArtistSlug(url)).toBe(null);
    });

    it('should handle root path', () => {
      const url = 'https://www.cifraclub.com.br/';
      expect(extractArtistSlug(url)).toBe(null);
    });
  });

  describe('extractFullPathFromUrl', () => {
    it('should extract full path from URL', () => {
      const url = 'https://www.cifraclub.com.br/oasis/wonderwall/';
      expect(extractFullPathFromUrl(url)).toBe('oasis/wonderwall');
    });

    it('should handle URLs without trailing slash', () => {
      const url = 'https://www.cifraclub.com.br/oasis/wonderwall';
      expect(extractFullPathFromUrl(url)).toBe('oasis/wonderwall');
    });

    it('should extract single segment path', () => {
      const url = 'https://www.cifraclub.com.br/oasis/';
      expect(extractFullPathFromUrl(url)).toBe('oasis');
    });

    it('should return null for invalid URL', () => {
      const url = 'not-a-valid-url';
      expect(extractFullPathFromUrl(url)).toBe(null);
    });

    it('should handle root path', () => {
      const url = 'https://www.cifraclub.com.br/';
      expect(extractFullPathFromUrl(url)).toBe('');
    });
  });

  describe('isValidResult - Path-based validation', () => {
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

      expect(isValidResult(invalidResult, SEARCH_TYPES.SONG)).toBe(false);
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
  });

  describe('normalizeArtistPath', () => {
    it('should remove trailing slash from artist path', () => {
      expect(normalizeArtistPath('oasis/')).toBe('oasis');
    });

    it('should keep path unchanged if no trailing slash', () => {
      expect(normalizeArtistPath('oasis')).toBe('oasis');
    });

    it('should handle paths with multiple trailing slashes', () => {
      expect(normalizeArtistPath('radiohead///')).toBe('radiohead//');
    });

    it('should throw error for invalid input', () => {
      expect(() => normalizeArtistPath('')).toThrow('Invalid artist path: must be a non-empty string');
      expect(() => normalizeArtistPath(null)).toThrow('Invalid artist path: must be a non-empty string');
      expect(() => normalizeArtistPath(undefined)).toThrow('Invalid artist path: must be a non-empty string');
      expect(() => normalizeArtistPath(123)).toThrow('Invalid artist path: must be a non-empty string');
    });
  });
});
