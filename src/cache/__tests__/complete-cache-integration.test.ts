import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheChordSheet, getCachedChordSheet } from '../implementations/chord-sheet-cache';
import { addToMySongs, getAllFromMySongs } from '../implementations/my-songs-cache';
import { loadSampleChordSheet, isSampleSong } from '@/services/sample-song-loader';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

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

  const sampleSong: ChordSheet = {
    title: 'Wonderwall',
    artist: 'Oasis',
    songChords: '[Intro]\nEm7  G  Dsus4  A7sus4',
    songKey: 'G',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  };

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
      const retrieved = getCachedChordSheet('Oasis', 'Wonderwall');
      expect(retrieved).toBeNull();
    });
  });

  describe('My Songs Cache (chordium-user-saved-songs)', () => {
    it('should store user-saved songs in My Songs cache', () => {
      // Add a song to My Songs
      addToMySongs(scrapedSong.artist, scrapedSong.title, scrapedSong);
      
      // Should be retrievable from My Songs
      const mySongs = getAllFromMySongs();
      expect(mySongs).toHaveLength(1);
      expect(mySongs[0]).toEqual(scrapedSong);
    });

    it('should handle sample songs in My Songs (dev mode)', () => {
      // In dev mode, sample songs can be in My Songs as starter content
      addToMySongs(sampleSong.artist, sampleSong.title, sampleSong);
      
      const mySongs = getAllFromMySongs();
      expect(mySongs).toHaveLength(1);
      expect(mySongs[0]).toEqual(sampleSong);
    });
  });

  describe('Sample Song Loading', () => {
    it('should identify sample songs correctly', () => {
      expect(isSampleSong('Oasis', 'Wonderwall')).toBe(true);
      expect(isSampleSong('Eagles', 'Hotel California')).toBe(true);
      expect(isSampleSong('External Artist', 'Scraped Song')).toBe(false);
    });

    it('should load sample songs from files', async () => {
      // Mock fetch response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleSong)
      } as Response);

      const loaded = await loadSampleChordSheet('oasis', 'wonderwall');
      
      expect(fetch).toHaveBeenCalledWith('/data/songs/oasis-wonderwall.json');
      expect(loaded).toEqual(sampleSong);
    });
  });

  describe('Cache Separation', () => {
    it('should keep scraped songs and sample songs separate', () => {
      // Cache a scraped song
      cacheChordSheet(scrapedSong.artist, scrapedSong.title, scrapedSong);
      
      // Add a sample song to My Songs
      addToMySongs(sampleSong.artist, sampleSong.title, sampleSong);
      
      // Scraped song should be in chord-sheet-cache
      const cachedScraped = getCachedChordSheet(scrapedSong.artist, scrapedSong.title);
      expect(cachedScraped).toEqual(scrapedSong);
      
      // Sample song should NOT be in chord-sheet-cache
      const cachedSample = getCachedChordSheet(sampleSong.artist, sampleSong.title);
      expect(cachedSample).toBeNull();
      
      // Sample song should be in My Songs
      const mySongs = getAllFromMySongs();
      expect(mySongs).toHaveLength(1);
      expect(mySongs[0]).toEqual(sampleSong);
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
