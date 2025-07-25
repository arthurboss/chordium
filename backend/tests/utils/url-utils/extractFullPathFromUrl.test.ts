import { describe, it, expect } from '@jest/globals';
import { extractFullPathFromUrl } from '../../../utils/url-utils.js';

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

  it('should handle empty string input', () => {
    expect(extractFullPathFromUrl('')).toBe(null);
  });

  it('should handle null input', () => {
    expect(extractFullPathFromUrl(null as unknown as string)).toBe(null);
  });

  it('should handle undefined input', () => {
    expect(extractFullPathFromUrl(undefined as unknown as string)).toBe(null);
  });

  it('should handle complex paths with multiple segments', () => {
    const url = 'https://www.cifraclub.com.br/artist/song/version/tab/';
    expect(extractFullPathFromUrl(url)).toBe('artist/song/version/tab');
  });
});
