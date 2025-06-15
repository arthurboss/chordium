import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  generateChordSheetCacheKey,
  cacheChordSheet,
  getCachedChordSheet,
  clearChordSheetCache
} from '../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

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
      const key = generateChordSheetCacheKey('charlie_brown_jr-so_os_loucos_sabem');
      expect(key).toBe('charlie_brown_jr-so_os_loucos_sabem');
    });

    it('should handle single word artist and song', () => {
      const key = generateChordSheetCacheKey('oasis-wonderwall');
      expect(key).toBe('oasis-wonderwall');
    });

    it('should handle complex artist and song names', () => {
      const key = generateChordSheetCacheKey('the_beatles-hey_jude');
      expect(key).toBe('the_beatles-hey_jude');
    });

    it('should handle names with special characters already normalized', () => {
      const key = generateChordSheetCacheKey('joao_gilberto-garota_de_ipanema');
      expect(key).toBe('joao_gilberto-garota_de_ipanema');
    });
  });

  describe('cache storage and retrieval with new key format', () => {
    it('should store and retrieve chord sheet using new key format', () => {
      const songPath = 'charlie_brown_jr-so_os_loucos_sabem';
      const chordSheet: ChordSheet = {
        title: 'Só os Loucos Sabem',
        artist: 'Charlie Brown Jr.',
        songChords: '[Intro] Em C G D\n[Verse] Em C G D\nSó os loucos sabem...',
        songKey: 'Em',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      // Cache the chord sheet
      cacheChordSheet(songPath, chordSheet);

      // Retrieve the chord sheet
      const retrieved = getCachedChordSheet(songPath);

      // Should match exactly
      expect(retrieved).toEqual(chordSheet);
    });

    it('should verify key is stored exactly as provided (no prefix)', () => {
      const songPath = 'oasis-wonderwall';
      const chordSheet: ChordSheet = {
        title: 'Wonderwall',
        artist: 'Oasis',
        songChords: '[Intro] Em7 G D A\n[Verse] Em7 G D A\nToday is gonna be...',
        songKey: 'G',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2
      };

      // Cache the chord sheet
      cacheChordSheet(songPath, chordSheet);

      // Check localStorage directly to verify the key format
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      expect(cacheData).toBeTruthy();
      
      const cache = JSON.parse(cacheData || '{}');
      expect(cache.items).toHaveLength(1);
      expect(cache.items[0].key).toBe('oasis-wonderwall');
      // Should NOT have 'chord-sheet:' prefix
      expect(cache.items[0].key).not.toContain('chord-sheet:');
    });
  });

  describe('backward compatibility', () => {
    it('should not retrieve old format keys when using new format', () => {
      // Manually insert an old format key into localStorage
      const oldCacheData = {
        items: [{
          key: 'chord-sheet:charlie-brown-jr:so-os-loucos-sabem',
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
      const retrieved = getCachedChordSheet('charlie_brown_jr-so_os_loucos_sabem');
      
      // Should return null because the key formats don't match
      expect(retrieved).toBeNull();
    });
  });

  describe('real world examples', () => {
    it('should handle Leonardo Gonçalves songs correctly', () => {
      const songPath = 'leonardo_goncalves-getsemani';
      const chordSheet: ChordSheet = {
        title: 'Getsêmani',
        artist: 'Leonardo Gonçalves',
        songChords: '[Intro] C7M G/B Am7\n[Verse] C7M G/B Am7\nNo Getsêmani...',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      cacheChordSheet(songPath, chordSheet);
      const retrieved = getCachedChordSheet(songPath);
      
      expect(retrieved).toEqual(chordSheet);
      
      // Verify key format in storage
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      const cache = JSON.parse(cacheData || '{}');
      expect(cache.items[0].key).toBe('leonardo_goncalves-getsemani');
    });

    it('should handle multi-word artists and songs', () => {
      const songPath = 'red_hot_chili_peppers-under_the_bridge';
      const chordSheet: ChordSheet = {
        title: 'Under The Bridge',
        artist: 'Red Hot Chili Peppers',
        songChords: '[Intro] D F# Bm F# G D\n[Verse] D F# Bm\nSometimes I feel...',
        songKey: 'D',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      cacheChordSheet(songPath, chordSheet);
      const retrieved = getCachedChordSheet(songPath);
      
      expect(retrieved).toEqual(chordSheet);
      
      // Verify key format in storage
      const cacheData = localStorage.getItem('chordium-chord-sheet-cache');
      const cache = JSON.parse(cacheData || '{}');
      expect(cache.items[0].key).toBe('red_hot_chili_peppers-under_the_bridge');
    });
  });
});
