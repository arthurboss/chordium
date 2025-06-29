import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { cacheChordSheet, getCachedChordSheet } from '@/cache/implementations/chord-sheet-cache';
import { addToMyChordSheets, getAllFromMyChordSheets } from '@/cache/implementations/my-chord-sheets-cache';
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
      }),
      length: 0,
      key: vi.fn(),
    },
    writable: true,
  });
  
  // Mock fetch for sample songs
  global.fetch = vi.fn();
});

describe('ChordSheet Interface Integration Test', () => {
  const mockChordSheet: ChordSheet = {
    title: 'Test Song',
    artist: 'Test Artist', 
    songChords: '[Verse]\nC G Am F\nTest lyrics with chords',
    songKey: 'C',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };

  it('should handle ChordSheet interface consistently across all systems', async () => {
    // 1. Test external song caching (for scraped songs)
    cacheChordSheet('Test Artist', 'Test Song', mockChordSheet);
    const cachedSheet = getCachedChordSheet('Test Artist', 'Test Song');
    
    expect(cachedSheet).toEqual(mockChordSheet);
    expect(cachedSheet?.songChords).toContain('[Verse]');
    expect(cachedSheet?.songKey).toBe('C');
    
    // 2. Test My ChordSheets caching (for user-saved chord sheets)
    addToMyChordSheets('Test Artist', 'Test Song', mockChordSheet);
    const myChordSheets = getAllFromMyChordSheets();
    
    expect(myChordSheets).toHaveLength(1);
    expect(myChordSheets[0]).toEqual(mockChordSheet);
    expect(myChordSheets[0].songChords).toContain('[Verse]');
    
    // 3. Test sample song loading
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockChordSheet)
    } as Response);
    
    const sampleSheet = await loadSampleChordSheet('test_artist', 'test_song');
    expect(sampleSheet).toEqual(mockChordSheet);
  });

  it('should handle empty cache keys correctly', () => {
    // This should not cache anything and return null
    cacheChordSheet('', 'Test Song', mockChordSheet);
    const result1 = getCachedChordSheet('', 'Test Song');
    expect(result1).toBeNull();
    
    // This should not cache anything and return null
    cacheChordSheet('Test Artist', '', mockChordSheet);
    const result2 = getCachedChordSheet('Test Artist', '');
    expect(result2).toBeNull();
  });

  it('should distinguish between external cache and My Chord Sheets cache', () => {
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
    cacheChordSheet('Test Artist', 'External Song', externalSong);
    
    // Cache in My ChordSheets (for user-saved chord sheets)
    addToMyChordSheets('Test Artist', 'My Song', mySong);
    
    // Verify they're in different caches
    const external = getCachedChordSheet('Test Artist', 'External Song');
    const myList = getAllFromMyChordSheets();
    
    expect(external?.songChords).toContain('External content');
    expect(myList[0].songChords).toContain('My content');
    expect(myList).toHaveLength(1);
    expect(myList[0].title).toBe('My Song');
  });
});
