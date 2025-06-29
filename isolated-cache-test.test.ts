import { describe, it, expect } from 'vitest';

// Copy the generateCacheKey function to test it in isolation
const generateCacheKey = (artist: string | null, song: string | null, extra?: Record<string, string | null>): string => {
  // Normalize inputs
  const clean = (v: string | null | undefined) => (v ? v.trim().toLowerCase() : '');
  let key = `artist:${clean(artist)}|song:${clean(song)}`;
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      key += `|${k}:${clean(v)}`;
    });
  }
  return key;
};

describe('Cache Key Generator - Isolated', () => {
  it('should generate cache keys without side effects', () => {
    console.log('Test starting...');
    const key1 = generateCacheKey('artist', null);
    console.log('Generated key1:', key1);
    const key2 = generateCacheKey('artist', null);
    console.log('Generated key2:', key2);
    expect(key1).toBe(key2);
    expect(key1).toBe('artist:artist|song:');
    console.log('Test completed successfully');
  });
});
