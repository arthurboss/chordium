import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  cacheChordSheet, 
  getCachedChordSheet, 
  generateChordSheetCacheKey,
  clearChordSheetCache 
} from '../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { getTestSong, setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('Chord Sheet Cache Comprehensive Integration', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    clearChordSheetCache();
    vi.clearAllMocks();
  });

  it('should store and retrieve ChordSheet objects using artist and title', () => {
    // Arrange - use test song for consistency
    const testSong = getTestSong(0); // Wonderwall
    const chordSheet: ChordSheet = {
      title: testSong.title,
      artist: testSong.artist,
      songChords: '[Intro] C7M G/B Am7...',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 2
    };

    // Act
    cacheChordSheet(testSong.artist, testSong.title, chordSheet);
    const retrieved = getCachedChordSheet(testSong.artist, testSong.title);

    // Assert
    expect(retrieved).toEqual(chordSheet);
  });

  it('should generate consistent cache keys from artist and title', () => {
    // Arrange
    const testSong = getTestSong(1); // Hotel California
    
    // Act
    const key = generateChordSheetCacheKey(testSong.artist, testSong.title);
    
    // Assert - should be normalized properly
    const expectedKey = `${testSong.artist.toLowerCase().replace(/\s+/g, '_')}-${testSong.title.toLowerCase().replace(/\s+/g, '_')}`;
    expect(key).toBe(expectedKey);
  });

  it('should return null for non-existent cache entries', () => {
    // Act
    const result = getCachedChordSheet('Non-Existent', 'Artist');
    
    // Assert
    expect(result).toBeNull();
  });

  it('should store complete ChordSheet structure without extra fields', () => {
    // Arrange
    const chordSheet: ChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: '[C]Test chord content',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    // Act
    cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
    const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);

    // Assert - verify structure matches exactly
    expect(retrieved).toEqual({
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: '[C]Test chord content',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    });
    
    // Verify no extra fields like 'content', 'data', etc.
    expect(retrieved).not.toHaveProperty('content');
    expect(retrieved).not.toHaveProperty('data');
    expect(retrieved).not.toHaveProperty('timestamp');
  });

  it('should demonstrate the new consistent cache structure', () => {
    // This test verifies the expected structure as described in the user requirements
    const chordSheet: ChordSheet = {
      title: 'Getsêmani',
      artist: 'Leonardo Gonçalves',
      songChords: '[Intro] C7M G/B Am7...',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 2
    };

    cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
    
    // Verify the cache structure by checking localStorage directly
    const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
    expect(cacheData).toBeTruthy();
    
    if (!cacheData) return; // Type guard for TypeScript
    
    const parsedCache = JSON.parse(cacheData);
    expect(parsedCache.items).toBeTruthy();
    expect(Array.isArray(parsedCache.items)).toBe(true);
    expect(parsedCache.items.length).toBe(1);
    
    const cachedItem = parsedCache.items[0];
    expect(cachedItem).toEqual({
      key: 'chord-sheet:chord:leonardo gonçalves:getsêmani',
      chordSheet: {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        songChords: '[Intro] C7M G/B Am7...',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2
      },
      timestamp: expect.any(Number),
      accessCount: 1
    });
  });
});
