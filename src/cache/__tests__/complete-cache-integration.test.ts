import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheChordSheet, getCachedChordSheet } from '../implementations/chord-sheet-cache';
import { addToMyChordSheets, getAllFromMyChordSheets } from '../implementations/my-chord-sheets-cache';
import { loadSampleChordSheet, isSampleSong } from '@/services/sample-song-loader';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { getTestSong } from '@/__tests__/shared/test-setup';

// Mock localStorage
const mockLocalStorage: { [key: string]: string } = {};

// Mock fetch for sample songs
global.fetch = vi.fn();

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
});

describe('Complete Cache System Integration', () => {
  const scrapedSong: ChordSheet = {
    title: 'Scraped Song',
    artist: 'External Artist',
    songChords: '[Verse]\nG C D Em',
    songKey: 'G',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 2
  };

  const sampleSong = getTestSong(0); // Use first test song as sample

  describe('Scraped Song Cache (chord-sheet-cache)', () => {
    it('should cache scraped songs in chord-sheet-cache', () => {
      // Cache a scraped song
      cacheChordSheet(scrapedSong.artist, scrapedSong.title, scrapedSong);
      
      // Should be retrievable from chord-sheet-cache
      const retrieved = getCachedChordSheet(scrapedSong.artist, scrapedSong.title);
      expect(retrieved).toEqual(scrapedSong);
    });

    it('should not cache sample songs in chord-sheet-cache', () => {
      // Sample songs should not be cached in the external cache
      // They should only be loaded from files when needed
      
      // Verify sample song is not in cache initially
      const retrieved = getCachedChordSheet(sampleSong.artist, sampleSong.title);
      expect(retrieved).toBeNull();
    });
  });

  describe('My Chord Sheets Cache (chordium-user-saved-songs)', () => {
    it('should store user-saved songs in My ChordSheets cache', () => {
      // Add a song to My ChordSheets
      addToMyChordSheets(scrapedSong.artist, scrapedSong.title, scrapedSong);
      
      // Should be retrievable from My ChordSheets
      const myChordSheets = getAllFromMyChordSheets();
      expect(myChordSheets).toHaveLength(1);
      expect(myChordSheets[0]).toEqual(scrapedSong);
    });

    it('should handle sample songs in My ChordSheets (dev mode)', () => {
      // In dev mode, sample songs can be in My ChordSheets as starter content
      addToMyChordSheets(sampleSong.artist, sampleSong.title, sampleSong);
      
      const myChordSheets = getAllFromMyChordSheets();
      expect(myChordSheets).toHaveLength(1);
      expect(myChordSheets[0]).toEqual(sampleSong);
    });
  });

  describe('Sample Song Loading', () => {
    it('should identify sample songs correctly', () => {
      expect(isSampleSong(sampleSong.artist, sampleSong.title)).toBe(true);
      const anotherTestSong = getTestSong(1);
      expect(isSampleSong(anotherTestSong.artist, anotherTestSong.title)).toBe(true);
      expect(isSampleSong('External Artist', 'Scraped Song')).toBe(false);
    });

    it('should load sample songs from files', async () => {
      // Mock fetch response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleSong)
      } as Response);

      // Use normalized filename format for the API
      const normalizedArtist = sampleSong.artist.toLowerCase().replace(/\s+/g, '-');
      const normalizedTitle = sampleSong.title.toLowerCase().replace(/\s+/g, '-');
      const loaded = await loadSampleChordSheet(normalizedArtist, normalizedTitle);
      
      expect(fetch).toHaveBeenCalledWith(`/data/songs/${normalizedArtist}-${normalizedTitle}.json`);
      expect(loaded).toEqual(sampleSong);
    });
  });

  describe('Cache Separation', () => {
    it('should keep scraped songs and sample songs separate', () => {
      // Cache a scraped song
      cacheChordSheet(scrapedSong.artist, scrapedSong.title, scrapedSong);
      
      // Add a sample song to My ChordSheets
      addToMyChordSheets(sampleSong.artist, sampleSong.title, sampleSong);
      
      // Scraped song should be in chord-sheet-cache
      const cachedScraped = getCachedChordSheet(scrapedSong.artist, scrapedSong.title);
      expect(cachedScraped).toEqual(scrapedSong);
      
      // Sample song should NOT be in chord-sheet-cache
      const cachedSample = getCachedChordSheet(sampleSong.artist, sampleSong.title);
      expect(cachedSample).toBeNull();
      
      // Sample song should be in My ChordSheets
      const myChordSheets = getAllFromMyChordSheets();
      expect(myChordSheets).toHaveLength(1);
      expect(myChordSheets[0]).toEqual(sampleSong);
    });
  });

  describe('Empty Key Prevention', () => {
    it('should prevent caching with empty artist', () => {
      // This should not cache anything
      cacheChordSheet('', 'Test Song', scrapedSong);
      
      // Should not be retrievable
      expect(getCachedChordSheet('', 'Test Song')).toBeNull();
      
      // Check localStorage directly - should be empty
      expect(mockLocalStorage['chordium-chord-sheet-cache']).toBeUndefined();
    });

    it('should prevent caching with empty title', () => {
      // This should not cache anything
      cacheChordSheet('Test Artist', '', scrapedSong);
      
      // Should not be retrievable
      expect(getCachedChordSheet('Test Artist', '')).toBeNull();
      
      // Check localStorage directly - should be empty
      expect(mockLocalStorage['chordium-chord-sheet-cache']).toBeUndefined();
    });
  });
});
