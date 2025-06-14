import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  cacheChordSheet, 
  getCachedChordSheet, 
  generateChordSheetCacheKey,
  clearChordSheetCache 
} from '../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

describe('Refactored Chord Sheet Cache Integration', () => {
  beforeEach(() => {
    clearChordSheetCache();
    vi.clearAllMocks();
  });

  it('should store and retrieve ChordSheet objects using song.path as key', () => {
    // Arrange
    const songPath = 'leonardo-goncalves:getsemani';
    const chordSheet: ChordSheet = {
      title: 'Getsêmani',
      artist: 'Leonardo Gonçalves',
      songChords: '[Intro] C7M G/B Am7...',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 2
    };

    // Act
    cacheChordSheet(songPath, chordSheet);
    const retrieved = getCachedChordSheet(songPath);

    // Assert
    expect(retrieved).toEqual(chordSheet);
  });

  it('should generate consistent cache keys from song paths', () => {
    // Arrange
    const songPath = 'leonardo-goncalves:getsemani';
    
    // Act
    const key = generateChordSheetCacheKey(songPath);
    
    // Assert
    expect(key).toBe('chord-sheet:leonardo-goncalves:getsemani');
  });

  it('should return null for non-existent cache entries', () => {
    // Act
    const result = getCachedChordSheet('non-existent:song');
    
    // Assert
    expect(result).toBeNull();
  });

  it('should store complete ChordSheet structure without extra fields', () => {
    // Arrange
    const songPath = 'test:song';
    const chordSheet: ChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: '[C]Test chord content',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    // Act
    cacheChordSheet(songPath, chordSheet);
    const retrieved = getCachedChordSheet(songPath);

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
    const songPath = 'chord:leonardo gonçalves:getsêmani';
    const chordSheet: ChordSheet = {
      title: 'Getsêmani',
      artist: 'Leonardo Gonçalves',
      songChords: '[Intro] C7M G/B Am7...',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 2
    };

    cacheChordSheet(songPath, chordSheet);
    
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
