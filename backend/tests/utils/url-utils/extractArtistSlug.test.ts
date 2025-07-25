import { describe, it, expect } from '@jest/globals';
import { extractArtistSlug } from '../../../utils/url-utils.js';

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

  it('should handle root path by returning null', () => {
    const url = 'https://www.cifraclub.com.br/';
    expect(extractArtistSlug(url)).toBe(null);
  });

  it('should handle empty string input', () => {
    expect(extractArtistSlug('')).toBe(null);
  });

  it('should handle null input', () => {
    expect(extractArtistSlug(null as unknown as string)).toBe(null);
  });

  it('should handle undefined input', () => {
    expect(extractArtistSlug(undefined as unknown as string)).toBe(null);
  });
});
