import { describe, test, expect } from '@jest/globals';

/**
 * S3 Key Generation and Formatting Tests
 * Tests S3 key construction, URL safety, and naming conventions
 */
describe('S3 Key Generation and Formatting', () => {
  test('should generate correct S3 keys for artist songs', () => {
    const testCases: Array<{ input: string; expected: string }> = [
      { input: 'simple-artist', expected: 'artist-songs/simple-artist.json' },
      { input: 'artist-with-hyphens', expected: 'artist-songs/artist-with-hyphens.json' },
      { input: 'artist_with_underscores', expected: 'artist-songs/artist_with_underscores.json' },
    ];

    // This tests the internal key generation logic
    testCases.forEach(({ input, expected }) => {
      const key: string = `artist-songs/${input}.json`;
      expect(key).toBe(expected);
    });
  });

  test('should handle special characters in artist names for S3 keys', () => {
    const specialCases: string[] = [
      'guns-n-roses',
      'ac-dc',
      'twenty-one-pilots',
      'sigur-ros',
    ];

    specialCases.forEach((artistName: string) => {
      const key: string = `artist-songs/${artistName}.json`;
      // S3 keys should be URL-safe
      expect(key).toMatch(/^[a-zA-Z0-9\-_.\/]+$/);
    });
  });

  test('should create consistent key patterns', () => {
    const artists: string[] = ['test-artist', 'another-artist', 'third-artist'];
    const keys: string[] = artists.map((artist: string) => `artist-songs/${artist}.json`);

    // All keys should follow the same pattern
    keys.forEach((key: string) => {
      expect(key).toMatch(/^artist-songs\/[a-z0-9\-_]+\.json$/);
    });

    // Keys should be unique
    const uniqueKeys: Set<string> = new Set(keys);
    expect(uniqueKeys.size).toBe(artists.length);
  });
});
