import { describe, it, expect } from '@jest/globals';
import { isValidResult, extractArtistSlug, extractPathFromUrl, extractFullPathFromUrl } from '../../utils/url-utils.js';
import SEARCH_TYPES from '../../constants/searchTypes.js';

describe('URL Utils', () => {
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

  describe('extractPathFromUrl', () => {
    it('should extract first path segment', () => {
      const url = 'https://www.cifraclub.com.br/oasis/wonderwall/';
      expect(extractPathFromUrl(url)).toBe('oasis');
    });

    it('should handle URLs without trailing slash', () => {
      const url = 'https://www.cifraclub.com.br/oasis';
      expect(extractPathFromUrl(url)).toBe('oasis');
    });

    it('should return null for invalid URL', () => {
      const url = 'not-a-valid-url';
      expect(extractPathFromUrl(url)).toBe(null);
    });

    it('should handle root path', () => {
      const url = 'https://www.cifraclub.com.br/';
      expect(extractPathFromUrl(url)).toBe('');
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
});
