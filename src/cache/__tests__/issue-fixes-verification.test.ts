import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheChordSheet, getCachedChordSheet } from '../implementations/chord-sheet-cache';
import { getAllFromMySongs, clearMySongs } from '../implementations/my-songs-cache';
import { populateDevModeSampleSongs } from '@/utils/dev-mode-sample-songs';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock localStorage
const mockLocalStorage: { [key: string]: string } = {};

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    DEV: true
  }
}));

beforeEach(() => {
  // Clear mock localStorage
  Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  
  // Mock localStorage
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
      }),
      length: 0,
      key: vi.fn(),
    },
    writable: true,
  });
  
  vi.clearAllMocks();
  clearMySongs();
});

describe('Issue Fixes Verification', () => {
  const sampleSong: ChordSheet = {
    title: 'Test Sample Song',
    artist: 'Sample Artist',
    songChords: '[Verse]\nC G Am F',
    songKey: 'C',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };

  const scrapedSong: ChordSheet = {
    title: 'Scraped Song',
    artist: 'External Artist',
    songChords: '[Verse]\nG D Em C',
    songKey: 'G',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 2
  };

  describe('Issue #1: Sample songs in both caches - FIXED', () => {
    it('should NOT have sample songs in chord-sheet-cache anymore', () => {
      // Before the fix, sample songs were being cached in both places
      // Now they should only be in My Songs (dev mode) and loaded from files when needed
      
      // Sample songs should NOT be in chord-sheet-cache
      const cachedSample = getCachedChordSheet('Oasis', 'Wonderwall');
      expect(cachedSample).toBeNull();
    });

    it('should only have sample songs in My Songs during dev mode', async () => {
      // Sample songs should only be populated in My Songs in dev mode
      await populateDevModeSampleSongs([sampleSong]);
      
      const mySongs = getAllFromMySongs();
      expect(mySongs).toHaveLength(1);
      expect(mySongs[0]).toEqual(sampleSong);
      
      // Should NOT be in chord-sheet-cache
      const cachedSample = getCachedChordSheet(sampleSong.artist, sampleSong.title);
      expect(cachedSample).toBeNull();
    });
  });

  describe('Issue #2: Songs not loading due to "data" field - FIXED', () => {
    it('should use songChords field consistently in ChordSheet schema', () => {
      // Cache a song using the correct ChordSheet schema
      cacheChordSheet(scrapedSong.artist, scrapedSong.title, scrapedSong);
      
      // Retrieve and verify it has songChords field (not content)
      const retrieved = getCachedChordSheet(scrapedSong.artist, scrapedSong.title);
      
      expect(retrieved).toBeDefined();
      expect(retrieved!.songChords).toBe('[Verse]\nG D Em C');
      expect(retrieved!.title).toBe('Scraped Song');
      expect(retrieved!.artist).toBe('External Artist');
      
      // Verify it follows the complete ChordSheet schema
      expect(retrieved).toMatchObject({
        title: expect.any(String),
        artist: expect.any(String),
        songChords: expect.any(String),
        songKey: expect.any(String),
        guitarTuning: expect.any(Array),
        guitarCapo: expect.any(Number)
      });
    });
  });

  describe('Issue #3: Empty cache keys being saved - FIXED', () => {
    it('should prevent caching with empty artist or title', () => {
      // These should not create cache entries
      cacheChordSheet('', 'Test Song', scrapedSong);
      cacheChordSheet('Test Artist', '', scrapedSong);
      cacheChordSheet('', '', scrapedSong);
      
      // Verify nothing was cached
      expect(getCachedChordSheet('', 'Test Song')).toBeNull();
      expect(getCachedChordSheet('Test Artist', '')).toBeNull();
      expect(getCachedChordSheet('', '')).toBeNull();
      
      // Verify localStorage doesn't have empty key entries
      const cacheData = mockLocalStorage['chordium-chord-sheet-cache'];
      expect(cacheData).toBeUndefined(); // No cache should exist
    });

    it('should generate valid cache keys for proper artist/title combinations', () => {
      // This should work properly
      cacheChordSheet('Valid Artist', 'Valid Song', scrapedSong);
      
      const retrieved = getCachedChordSheet('Valid Artist', 'Valid Song');
      expect(retrieved).toEqual(scrapedSong);
      
      // Verify cache structure
      const cacheData = JSON.parse(mockLocalStorage['chordium-chord-sheet-cache']);
      expect(cacheData.items).toHaveLength(1);
      expect(cacheData.items[0].key).toBe('valid_artist-valid_song');
      expect(cacheData.items[0].data).toEqual(scrapedSong);
    });
  });

  describe('Cache Separation Verification', () => {
    it('should maintain proper separation between the two caches', () => {
      // Add sample song to My Songs (dev mode behavior)
      populateDevModeSampleSongs([sampleSong]);
      
      // Add scraped song to chord-sheet-cache
      cacheChordSheet(scrapedSong.artist, scrapedSong.title, scrapedSong);
      
      // Verify My Songs has sample song
      const mySongs = getAllFromMySongs();
      expect(mySongs).toHaveLength(1);
      expect(mySongs[0]).toEqual(sampleSong);
      
      // Verify chord-sheet-cache has scraped song
      const cachedScraped = getCachedChordSheet(scrapedSong.artist, scrapedSong.title);
      expect(cachedScraped).toEqual(scrapedSong);
      
      // Verify sample song is NOT in chord-sheet-cache
      const cachedSample = getCachedChordSheet(sampleSong.artist, sampleSong.title);
      expect(cachedSample).toBeNull();
      
      // Verify different localStorage keys are used
      expect(mockLocalStorage['chordium-user-saved-songs']).toBeDefined();
      expect(mockLocalStorage['chordium-chord-sheet-cache']).toBeDefined();
    });
  });
});
