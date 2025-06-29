import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateChordSheetCacheKey,
  cacheChordSheet,
  getCachedChordSheet,
  clearChordSheetCache
} from '../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { getTestSong } from '@/__tests__/shared/test-setup';

// Create a proper localStorage mock that actually stores data
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn(),
  };
};

describe('Chord Sheet Cache Key Format', () => {
  beforeEach(() => {
    // Setup localStorage mock for each test
    const localStorageMock = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    clearChordSheetCache();
  });

  describe('generateChordSheetCacheKey', () => {
    it('should generate key in format artist_name-song_title without chord-sheet prefix', () => {
      // Test the new format: artist name with underscores, dash separator, song title with underscores
      const key = generateChordSheetCacheKey('Charlie Brown Jr.', 'Só os Loucos Sabem');
      expect(key).toBe('charlie_brown_jr-so_os_loucos_sabem');
    });

    it('should handle single word artist and song', () => {
      const testSong = getTestSong(0); // Oasis - Wonderwall
      const key = generateChordSheetCacheKey(testSong.artist, testSong.title);
      // Key should be lowercase, with underscores for spaces, dash separator
      expect(key).toBe('oasis-wonderwall');
    });

    it('should handle complex artist and song names', () => {
      const key = generateChordSheetCacheKey('The Beatles', 'Hey Jude');
      expect(key).toBe('the_beatles-hey_jude');
    });

    it('should handle names with special characters already normalized', () => {
      const key = generateChordSheetCacheKey('João Gilberto', 'Garota de Ipanema');
      expect(key).toBe('joao_gilberto-garota_de_ipanema');
    });
  });

  describe('cache storage and retrieval with new key format', () => {
    it('should store and retrieve chord sheet using new key format', () => {
      const testSong = getTestSong(0);
      const chordSheet: ChordSheet = {
        title: testSong.title,
        artist: testSong.artist,
        songChords: testSong.songChords,
        songKey: testSong.songKey,
        guitarTuning: testSong.guitarTuning,
        guitarCapo: testSong.guitarCapo
      };

      // Cache the chord sheet
      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);

      // Retrieve the chord sheet
      const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);

      // Should match exactly
      expect(retrieved).toEqual(chordSheet);
    });

    it('should verify key is stored exactly as provided (no prefix)', () => {
      const testSong = getTestSong(1);
      const chordSheet: ChordSheet = {
        title: testSong.title,
        artist: testSong.artist,
        songChords: testSong.songChords,
        songKey: testSong.songKey,
        guitarTuning: testSong.guitarTuning,
        guitarCapo: testSong.guitarCapo
      };

      // Cache the chord sheet
      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);

      // Check localStorage directly to verify the key format
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      expect(cacheData).toBeTruthy();
      
      const cache = JSON.parse(cacheData || '{}');
      expect(cache.items).toHaveLength(1);
      const expectedKey = generateChordSheetCacheKey(testSong.artist, testSong.title);
      expect(cache.items[0].key).toBe(expectedKey);
      // Should NOT have 'chord-sheet:' prefix
      expect(cache.items[0].key).not.toContain('chord-sheet:');
    });
  });

  describe('backward compatibility', () => {
    it('should not retrieve old format keys when using new format', () => {
      const testSong = getTestSong(2);
      
      // Manually insert an old format key into localStorage
      const oldCacheData = {
        items: [{
          key: `chord-sheet:${generateChordSheetCacheKey(testSong.artist, testSong.title)}`,
          chordSheet: {
            title: 'Old Format',
            artist: 'Old Artist',
            songChords: 'Old chords',
            songKey: 'C',
            guitarTuning: GUITAR_TUNINGS.STANDARD,
            guitarCapo: 0
          },
          timestamp: Date.now(),
          accessCount: 1
        }]
      };
      
      localStorage.setItem('chordium-chord-sheet-cache', JSON.stringify(oldCacheData));

      // Try to retrieve using new format
      const retrieved = getCachedChordSheet(testSong.artist, testSong.title);
      
      // Should return null because the key formats don't match
      expect(retrieved).toBeNull();
    });
  });

  describe('real world examples', () => {
    it('should handle special character normalization in artist names', () => {
      const testSong = getTestSong(2); // Radiohead - Creep (index 2 exists)
      const chordSheet: ChordSheet = {
        title: testSong.title,
        artist: testSong.artist,
        songChords: testSong.songChords,
        songKey: testSong.songKey,
        guitarTuning: testSong.guitarTuning,
        guitarCapo: testSong.guitarCapo
      };

      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
      const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);
      
      expect(retrieved).toEqual(chordSheet);
      
      // Verify key format in storage
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      const cache = JSON.parse(cacheData || '{}');
      const expectedKey = generateChordSheetCacheKey(testSong.artist, testSong.title);
      expect(cache.items[0].key).toBe(expectedKey);
    });

    it('should handle multi-word artists and songs', () => {
      const testSong = getTestSong(1); // Eagles - Hotel California (index 1 exists)
      const chordSheet: ChordSheet = {
        title: testSong.title,
        artist: testSong.artist,
        songChords: testSong.songChords,
        songKey: testSong.songKey,
        guitarTuning: testSong.guitarTuning,
        guitarCapo: testSong.guitarCapo
      };

      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
      const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);
      
      expect(retrieved).toEqual(chordSheet);
      
      // Verify key format in storage
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      const cache = JSON.parse(cacheData || '{}');
      const expectedKey = generateChordSheetCacheKey(testSong.artist, testSong.title);
      expect(cache.items[0].key).toBe(expectedKey);
    });
  });
});
