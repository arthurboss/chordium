// Test file for session storage utilities
import { describe, it, test, expect, beforeEach } from 'vitest';
import { storeChordUrl, getChordUrl } from './session-storage-utils';

describe('Session Storage Utilities', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });
  
  test('should store and retrieve chord URLs', () => {
    const artistSlug = 'test-artist';
    const songSlug = 'test-song';
    const url = 'https://example.com/test-artist/test-song';
    
    storeChordUrl(artistSlug, songSlug, url);
    
    expect(getChordUrl(artistSlug, songSlug)).toBe(url);
  });
  
  test('should clean up old entries when limit is reached', () => {
    // Store more than the limit  
    const limit = 20; // This should match MAX_CHORD_URLS in the implementation
    
    // Create more than the limit (without async delays to avoid timeout)
    for (let i = 0; i < limit + 5; i++) {
      storeChordUrl(`artist-${i}`, `song-${i}`, `https://example.com/artist-${i}/song-${i}`);
    }
    
    // Check that we only have the limit number of chord URLs
    let count = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('chord-url-') && !key.endsWith('-timestamp')) {
        count++;
      }
    }
    
    // We should have exactly the limit number of entries
    expect(count).toBeLessThanOrEqual(limit);
    
    // The oldest entries should be removed (artist-0 through artist-4 should be gone)
    expect(getChordUrl('artist-0', 'song-0')).toBeNull();
    expect(getChordUrl('artist-1', 'song-1')).toBeNull();
    expect(getChordUrl('artist-2', 'song-2')).toBeNull();
    expect(getChordUrl('artist-3', 'song-3')).toBeNull();
    expect(getChordUrl('artist-4', 'song-4')).toBeNull();
    
    // The newest entries should still be there
    expect(getChordUrl(`artist-${limit + 4}`, `song-${limit + 4}`)).not.toBeNull();
    expect(getChordUrl(`artist-${limit + 3}`, `song-${limit + 3}`)).not.toBeNull();
  });
});
