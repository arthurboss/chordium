import { describe, it, expect } from '@jest/globals';
import { isValidResult, extractArtistSlug, extractPathFromUrl, extractFullPathFromUrl } from '../../utils/url-utils.js';
import SEARCH_TYPES from '../../constants/searchTypes.js';

describe('URL Utils', () => {
  describe('isValidResult', () => {
    it('should return true for valid artist URL', () => {
      const result = { url: 'https://www.cifraclub.com.br/oasis/' };
      expect(isValidResult(result, SEARCH_TYPES.ARTIST)).toBe(true);
    });

    it('should return true for valid song URL', () => {
      const result = { url: 'https://www.cifraclub.com.br/oasis/wonderwall/' };
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
});
