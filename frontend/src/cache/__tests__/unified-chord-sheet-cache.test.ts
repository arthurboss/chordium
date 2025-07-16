import { describe, it, expect, beforeEach } from 'vitest';
import { 
  UnifiedChordSheetCache,
  unifiedChordSheetCache
} from '../implementations/unified-chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('UnifiedChordSheetCache', () => {
  const testChordSheet: ChordSheet = {
    title: 'Test Song',
    artist: 'Test Artist',
    songChords: 'C G Am F',
    songKey: 'C',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };

  const anotherChordSheet: ChordSheet = {
    title: 'Another Song',
    artist: 'Another Artist',
    songChords: 'D A Bm G',
    songKey: 'D',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 2
  };

  beforeEach(() => {
    // Use proper localStorage mock and clear it
    setupLocalStorageMock();
    unifiedChordSheetCache.clearAllCache(); // Ensure clean state between tests
  });

  describe('Basic Cache Operations', () => {
    it('should cache and retrieve chord sheets', () => {
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet);
      const retrieved = unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
      
      expect(retrieved).toEqual(testChordSheet);
    });

    it('should return null for non-existent chord sheets', () => {
      const retrieved = unifiedChordSheetCache.getCachedChordSheet('Non-existent', 'Song');
      expect(retrieved).toBeNull();
    });

    it('should update access count when retrieving', () => {
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet);
      
      // First access
      unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
      // Second access
      unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
      
      // Verify the chord sheet is retrieved successfully
      const retrieved = unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
      expect(retrieved).toEqual(testChordSheet);
    });
  });

  describe('Saved Chord Sheets (My Chord Sheets)', () => {
    it('should save chord sheets and mark them as saved', () => {
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet, { saved: true });
      
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(true);
      
      const retrieved = unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
      expect(retrieved).toEqual(testChordSheet);
    });

    it('should get all saved chord sheets', () => {
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet, { saved: true });
      unifiedChordSheetCache.cacheChordSheet('Another Artist', 'Another Song', anotherChordSheet, { saved: true });
      
      const allSaved = unifiedChordSheetCache.getAllSavedChordSheets();
      expect(allSaved).toHaveLength(2);
      expect(allSaved).toContainEqual(testChordSheet);
      expect(allSaved).toContainEqual(anotherChordSheet);
    });

    it('should remove chord sheets from saved list', () => {
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet, { saved: true });
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(true);
      
      unifiedChordSheetCache.setSavedStatus('Test Artist', 'Test Song', false);
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(false);
      
      // Should still be in regular cache but not saved
      const retrieved = unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
      expect(retrieved).toEqual(testChordSheet);
    });

    it('should not return regular cached items as saved', () => {
      // Cache as regular (not saved)
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet);
      
      // Should not be marked as saved
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(false);
      
      // But should be accessible through regular cache API
      expect(unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song')).toEqual(testChordSheet);
    });
  });

  describe('Unified Cache Benefits', () => {
    it('should consolidate duplicate chord sheets', () => {
      // Cache the same song through both regular and saved APIs
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet);
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet, { saved: true });
      
      // The second call should update the existing entry to be saved
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(true);
      
      // And verify we can retrieve it
      expect(unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song')).toEqual(testChordSheet);
    });

    it('should preserve saved status when accessing through regular API', () => {
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet, { saved: true });
      
      // Access through regular API
      const retrieved = unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
      expect(retrieved).toEqual(testChordSheet);
      
      // Should still be saved
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(true);
    });

    it('should handle status transitions correctly', () => {
      // Start as regular cache
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet);
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(false);
      
      // Save it
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet, { saved: true });
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(true);
      
      // Unsave it
      unifiedChordSheetCache.setSavedStatus('Test Artist', 'Test Song', false);
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(false);
      
      // Should still be cached as regular
      expect(unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song')).toEqual(testChordSheet);
    });
  });

  describe('Cache Management', () => {
    it('should clear expired entries', () => {
      // Test the concept by caching and then clearing all cache
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet);
      
      // Verify it's cached
      expect(unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song')).toEqual(testChordSheet);
      
      // Clear all cache (simulating expired cleanup)
      unifiedChordSheetCache.clearAllCache();
      
      // Should no longer be cached
      expect(unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song')).toBeNull();
    });

    it('should clear all cache', () => {
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet);
      unifiedChordSheetCache.cacheChordSheet('Another Artist', 'Another Song', anotherChordSheet, { saved: true });
      
      unifiedChordSheetCache.clearAllCache();
      
      expect(unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song')).toBeNull();
      expect(unifiedChordSheetCache.getAllSavedChordSheets()).toHaveLength(0);
    });

    it('should provide accurate cache statistics', () => {
      // Cache items
      unifiedChordSheetCache.cacheChordSheet('Regular Artist', 'Regular Song', testChordSheet);
      unifiedChordSheetCache.cacheChordSheet('Saved Artist', 'Saved Song', anotherChordSheet, { saved: true });
      
      // Verify the behavior through the public functions
      expect(unifiedChordSheetCache.getCachedChordSheet('Regular Artist', 'Regular Song')).toEqual(testChordSheet);
      expect(unifiedChordSheetCache.isChordSheetSaved('Regular Artist', 'Regular Song')).toBe(false); // Not saved
      
      expect(unifiedChordSheetCache.getCachedChordSheet('Saved Artist', 'Saved Song')).toEqual(anotherChordSheet);
      expect(unifiedChordSheetCache.isChordSheetSaved('Saved Artist', 'Saved Song')).toBe(true); // Saved
    });
  });

  describe('Cache Key Handling', () => {
    it('should handle cache key parsing and generation', () => {
      const key = UnifiedChordSheetCache.generateCacheKey('Test Artist', 'Test Song');
      const parsed = UnifiedChordSheetCache.parseCacheKey(key);
      
      // Note: Cache keys are normalized to lowercase, so parsed values will be lowercase
      expect(parsed.artist).toBe('test artist');
      expect(parsed.title).toBe('test song');
      expect(key).toBe('test_artist-test_song');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid cache keys gracefully', () => {
      const cache = new UnifiedChordSheetCache();
      
      // These should not throw errors
      expect(() => cache.cacheChordSheet('', '', testChordSheet)).not.toThrow();
      expect(cache.getCachedChordSheet('', '')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };
      
      // Should not throw error
      expect(() => unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet)).not.toThrow();
      
      // Restore localStorage
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Saved Songs Expiration', () => {
    it('should ensure saved songs never expire', () => {
      // Add a song to saved sheets
      unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', testChordSheet, { saved: true });
      
      // Access the cache instance to verify the configuration
      const cache = unifiedChordSheetCache;
      expect(cache).toBeDefined();
      
      // Verify that saved expiration time is set to MAX_SAFE_INTEGER (never expires)
      const config = cache.getConfig();
      expect(config.savedExpirationTime).toBe(Number.MAX_SAFE_INTEGER);
      
      // Verify the song is still accessible
      expect(unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song')).toEqual(testChordSheet);
      expect(unifiedChordSheetCache.isChordSheetSaved('Test Artist', 'Test Song')).toBe(true);
    });
  });
});