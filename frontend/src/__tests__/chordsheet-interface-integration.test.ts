import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';
import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';
import { loadSampleChordSheet } from '@/services/sample-song-loader';

// Mock localStorage
const mockLocalStorage: { [key: string]: string } = {};

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
      })
    },
    writable: true
  });

  // Mock fetch
  global.fetch = vi.fn();
});

describe('ChordSheet Interface Integration', () => {
  const mockChordSheet: ChordSheet = {
    title: 'Test Song',
    artist: 'Test Artist', 
    songChords: '[Verse]\nC G Am F\nTest lyrics with chords',
    songKey: 'C',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };

  it('should handle ChordSheet interface consistently across unified cache', async () => {
    // 1. Test external song caching (for scraped songs)
    unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', mockChordSheet);
    const cachedSheet = unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'Test Song');
    
    expect(cachedSheet).toEqual(mockChordSheet);
    expect(cachedSheet?.songChords).toContain('[Verse]');
    expect(cachedSheet?.songKey).toBe('C');
    
    // 2. Test saved chord sheet functionality
    unifiedChordSheetCache.cacheChordSheet('Test Artist', 'Test Song', mockChordSheet);
    unifiedChordSheetCache.setSavedStatus('Test Artist', 'Test Song', true);
    const savedSheets = unifiedChordSheetCache.getAllSavedChordSheets();
    
    expect(savedSheets).toHaveLength(1);
    expect(savedSheets[0]).toEqual(mockChordSheet);
    expect(savedSheets[0].songChords).toContain('[Verse]');
    
    // 3. Test sample song loading
    const sampleSheet = await loadSampleChordSheet('oasis', 'wonderwall');
    expect(sampleSheet).toBeTruthy();
    expect(sampleSheet?.title).toBe('Wonderwall');
    expect(sampleSheet?.artist).toBe('Oasis');
  });

  it('should handle empty cache keys correctly', () => {
    // This should not cache anything and return null
    unifiedChordSheetCache.cacheChordSheet('', 'Test Song', mockChordSheet);
    const result1 = unifiedChordSheetCache.getCachedChordSheet('', 'Test Song');
    expect(result1).toBeNull();
    
    // This should not cache anything and return null
    unifiedChordSheetCache.cacheChordSheet('Test Artist', '', mockChordSheet);
    const result2 = unifiedChordSheetCache.getCachedChordSheet('Test Artist', '');
    expect(result2).toBeNull();
  });

  it('should distinguish between cached and saved chord sheets', () => {
    const externalSong: ChordSheet = {
      ...mockChordSheet,
      title: 'External Song',
      songChords: '[Chorus]\nG D Em C\nExternal content'
    };
    
    const mySong: ChordSheet = {
      ...mockChordSheet, 
      title: 'My Song',
      songChords: '[Bridge]\nAm F C G\nMy content'
    };
    
    // Cache in external cache (for scraped songs)
    unifiedChordSheetCache.cacheChordSheet('Test Artist', 'External Song', externalSong);
    
    // Save to My ChordSheets (for user-saved chord sheets)
    unifiedChordSheetCache.cacheChordSheet('Test Artist', 'My Song', mySong);
    unifiedChordSheetCache.setSavedStatus('Test Artist', 'My Song', true);
    
    // Verify they're tracked separately
    const external = unifiedChordSheetCache.getCachedChordSheet('Test Artist', 'External Song');
    const myList = unifiedChordSheetCache.getAllSavedChordSheets();
    
    expect(external?.songChords).toContain('External content');
    expect(myList[0].songChords).toContain('My content');
    expect(myList).toHaveLength(1);
    expect(myList[0].title).toBe('My Song');
  });
});
