import { describe, it, expect } from '@jest/globals';
import { normalizeArtistPath } from '../../../utils/url-utils.js';

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

  it('should throw error for empty string', () => {
    expect(() => normalizeArtistPath('')).toThrow('Invalid artist path: must be a non-empty string');
  });

  it('should throw error for null input', () => {
    expect(() => normalizeArtistPath(null as unknown as string)).toThrow('Invalid artist path: must be a non-empty string');
  });

  it('should throw error for undefined input', () => {
    expect(() => normalizeArtistPath(undefined as unknown as string)).toThrow('Invalid artist path: must be a non-empty string');
  });

  it('should throw error for number input', () => {
    expect(() => normalizeArtistPath(123 as unknown as string)).toThrow('Invalid artist path: must be a non-empty string');
  });

  it('should handle paths with only slashes', () => {
    expect(normalizeArtistPath('///')).toBe('//');
  });

  it('should handle complex artist paths', () => {
    expect(normalizeArtistPath('the-beatles/')).toBe('the-beatles');
    expect(normalizeArtistPath('led-zeppelin')).toBe('led-zeppelin');
  });
});
