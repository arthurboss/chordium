import { describe, it, expect, beforeEach } from 'vitest';
import { 
  cacheChordSheet, 
  clearChordSheetCache 
} from '../../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('Cache Internal Structure Validation', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    clearChordSheetCache();
  });

  describe('localStorage Structure', () => {
    it('should demonstrate the consistent cache structure', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        songChords: '[Intro] C7M G/B Am7...',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2,
      };

      // Act
      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);

      // Assert - Verify the cache structure by checking localStorage directly
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      expect(cacheData).toBeTruthy();

      if (!cacheData) return; // Type guard for TypeScript

      const parsedCache = JSON.parse(cacheData);
      expect(parsedCache.items).toBeTruthy();
      expect(Array.isArray(parsedCache.items)).toBe(true);
      expect(parsedCache.items.length).toBe(1);

      const cachedItem = parsedCache.items[0];
      expect(cachedItem).toEqual({
        key: 'leonardo_goncalves-getsemani', // Diacritics are removed
        data: {
          title: 'Getsêmani',
          artist: 'Leonardo Gonçalves',
          songChords: '[Intro] C7M G/B Am7...',
          songKey: 'C',
          guitarTuning: GUITAR_TUNINGS.STANDARD,
          guitarCapo: 2,
        },
        timestamp: expect.any(Number),
        accessCount: 1,
      });
    });

    it('should maintain proper cache structure with multiple items', () => {
      // Arrange
      const chordSheet1: ChordSheet = {
        title: 'Wonderwall',
        artist: 'Oasis',
        songChords: '[Intro] Em7 G D C...',
        songKey: 'Em',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2,
      };

      const chordSheet2: ChordSheet = {
        title: 'Hotel California',
        artist: 'Eagles',
        songChords: '[Intro] Bm F# A E...',
        songKey: 'Bm',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet(chordSheet1.artist, chordSheet1.title, chordSheet1);
      cacheChordSheet(chordSheet2.artist, chordSheet2.title, chordSheet2);

      // Assert
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      expect(cacheData).toBeTruthy();

      if (!cacheData) return;

      const parsedCache = JSON.parse(cacheData);
      expect(parsedCache.items).toBeTruthy();
      expect(Array.isArray(parsedCache.items)).toBe(true);
      expect(parsedCache.items.length).toBe(2);

      // Verify both items are stored correctly
      const keys = parsedCache.items.map((item: { key: string }) => item.key);
      expect(keys).toContain('oasis-wonderwall');
      expect(keys).toContain('eagles-hotel_california');

      // Verify structure of each item
      parsedCache.items.forEach((item: { key: string; data: unknown; timestamp: number; accessCount: number }) => {
        expect(item).toHaveProperty('key');
        expect(item).toHaveProperty('data');
        expect(item).toHaveProperty('timestamp');
        expect(item).toHaveProperty('accessCount');
        expect(typeof item.timestamp).toBe('number');
        expect(typeof item.accessCount).toBe('number');
        expect(item.accessCount).toBeGreaterThan(0);
      });
    });

    it('should track access count correctly', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act - Cache multiple times (should overwrite but track access)
      cacheChordSheet('Test Artist', 'Test Song', chordSheet);
      cacheChordSheet('Test Artist', 'Test Song', chordSheet);
      cacheChordSheet('Test Artist', 'Test Song', chordSheet);

      // Assert
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      expect(cacheData).toBeTruthy();

      if (!cacheData) return;

      const parsedCache = JSON.parse(cacheData);
      expect(parsedCache.items.length).toBe(1);
      expect(parsedCache.items[0].accessCount).toBe(3);
    });

    it('should maintain timestamp on cache updates', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet('Test Artist', 'Test Song', chordSheet);
      
      const cacheData1 = localStorage.getItem('chordium-chord-sheet-cache');
      const timestamp1 = cacheData1 ? JSON.parse(cacheData1).items[0].timestamp : 0;

      // Cache again to update timestamp
      cacheChordSheet('Test Artist', 'Test Song', { ...chordSheet, songKey: 'G' });
      
      const cacheData2 = localStorage.getItem('chordium-chord-sheet-cache');
      const timestamp2 = cacheData2 ? JSON.parse(cacheData2).items[0].timestamp : 0;

      // Assert - timestamp should be updated (or at least not decrease)
      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
      expect(timestamp1).toBeGreaterThan(0);
      expect(timestamp2).toBeGreaterThan(0);
    });

    it('should maintain correct cache key format in storage', () => {
      // Test Simple Artist
      const simpleChordSheet: ChordSheet = {
        title: 'Simple Song',
        artist: 'Simple Artist',
        songChords: '[Verse] Test',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      cacheChordSheet('Simple Artist', 'Simple Song', simpleChordSheet);
      let cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      let parsedCache = cacheData ? JSON.parse(cacheData) : null;
      let item = parsedCache?.items.find((item: { key: string }) => item.key === 'simple_artist-simple_song');
      expect(item).toBeTruthy();
      clearChordSheetCache();

      // Test The Beatles
      const beatlesChordSheet: ChordSheet = {
        title: 'Here Comes The Sun',
        artist: 'The Beatles',
        songChords: '[Verse] Test',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      cacheChordSheet('The Beatles', 'Here Comes The Sun', beatlesChordSheet);
      cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      parsedCache = cacheData ? JSON.parse(cacheData) : null;
      item = parsedCache?.items.find((item: { key: string }) => item.key === 'the_beatles-here_comes_the_sun');
      expect(item).toBeTruthy();
    });
  });

  describe('Cache Metadata', () => {
    it('should include required metadata fields', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Metadata Test',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet('Test Artist', 'Metadata Test', chordSheet);

      // Assert
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      expect(cacheData).toBeTruthy();

      if (!cacheData) return;

      const parsedCache = JSON.parse(cacheData);
      const item = parsedCache.items[0];

      // Verify all required metadata fields are present
      expect(item).toHaveProperty('key');
      expect(item).toHaveProperty('data');
      expect(item).toHaveProperty('timestamp');
      expect(item).toHaveProperty('accessCount');

      // Verify metadata types
      expect(typeof item.key).toBe('string');
      expect(typeof item.data).toBe('object');
      expect(typeof item.timestamp).toBe('number');
      expect(typeof item.accessCount).toBe('number');

      // Verify timestamp is reasonable (within last minute)
      const now = Date.now();
      expect(item.timestamp).toBeGreaterThan(now - 60000);
      expect(item.timestamp).toBeLessThanOrEqual(now);

      // Verify access count starts at 1
      expect(item.accessCount).toBe(1);
    });
  });
});
