import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { searchMySongs, convertChordSheetToSong, hasLocalMatches } from '../my-songs-search';
import { addToMySongs, clearMySongs } from '@/cache/implementations/my-songs-cache';
import { ChordSheet } from '@/types/chordSheet';

describe('My Songs Search Utility', () => {
  beforeEach(() => {
    // Clear My Songs before each test
    clearMySongs();
    
    // Mock localStorage
    const storage: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => storage[key] || null),
        setItem: vi.fn((key, value) => {
          storage[key] = value;
        }),
        removeItem: vi.fn((key) => {
          delete storage[key];
        }),
        clear: vi.fn(() => {
          Object.keys(storage).forEach(key => delete storage[key]);
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    clearMySongs();
    vi.restoreAllMocks();
  });

  describe('convertChordSheetToSong', () => {
    it('should convert ChordSheet to Song format', () => {
      const chordSheet: ChordSheet = {
        artist: 'Oasis',
        title: 'Wonderwall',
        songChords: '[Verse 1]\nEm7    G    D    C',
        songKey: 'Em',
        guitarCapo: 2,
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
      };

      const song = convertChordSheetToSong(chordSheet);

      expect(song).toEqual({
        title: 'Wonderwall',
        artist: 'Oasis',
        path: '/my-songs/Oasis/Wonderwall'
      });
    });

    it('should handle special characters in artist and title', () => {
      const chordSheet: ChordSheet = {
        artist: 'Café Tacvba',
        title: 'Do Lado de Cá',
        songChords: '[Intro]\nGm    F    Eb',
        songKey: 'Gm',
        guitarCapo: 0,
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
      };

      const song = convertChordSheetToSong(chordSheet);

      expect(song).toEqual({
        title: 'Do Lado de Cá',
        artist: 'Café Tacvba',
        path: '/my-songs/Caf%C3%A9%20Tacvba/Do%20Lado%20de%20C%C3%A1'
      });
    });
  });

  describe('searchMySongs', () => {
    beforeEach(() => {
      // Add test songs to My Songs
      const songs = [
        {
          artist: 'Chimarruts',
          title: 'Do Lado de Cá',
          chordSheet: {
            artist: 'Chimarruts',
            title: 'Do Lado de Cá',
            songChords: '[Intro]\nGm    F    Eb    Dm',
            songKey: 'Gm',
            guitarCapo: 0,
            guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
          } as ChordSheet
        },
        {
          artist: 'José González',
          title: 'Heartbeats',
          chordSheet: {
            artist: 'José González',
            title: 'Heartbeats',
            songChords: '[Verse 1]\nC    G    Am    F',
            songKey: 'C',
            guitarCapo: 0,
            guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
          } as ChordSheet
        },
        {
          artist: 'Oasis',
          title: 'Wonderwall',
          chordSheet: {
            artist: 'Oasis',
            title: 'Wonderwall',
            songChords: '[Verse 1]\nEm7    G    D    C',
            songKey: 'Em',
            guitarCapo: 2,
            guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
          } as ChordSheet
        }
      ];

      songs.forEach(song => {
        addToMySongs(song.artist, song.title, song.chordSheet);
      });
    });

    it('should find songs by accent-insensitive title search', () => {
      const results = searchMySongs(undefined, 'do lado de ca');
      
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'Do Lado de Cá',
        artist: 'Chimarruts'
      });
    });

    it('should find songs by accent-insensitive artist search', () => {
      const results = searchMySongs('jose gonzalez');
      
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'Heartbeats',
        artist: 'José González'
      });
    });

    it('should find songs by both artist and title search', () => {
      const results = searchMySongs('oasis', 'wonderwall');
      
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'Wonderwall',
        artist: 'Oasis'
      });
    });

    it('should find songs with partial matches', () => {
      const results = searchMySongs(undefined, 'wonder');
      
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: 'Wonderwall',
        artist: 'Oasis'
      });
    });

    it('should return empty array when no matches found', () => {
      const results = searchMySongs('beatles', 'hey jude');
      
      expect(results).toHaveLength(0);
    });

    it('should return empty array when no search terms provided', () => {
      const results = searchMySongs();
      
      expect(results).toHaveLength(0);
    });

    it('should handle empty string search terms', () => {
      const results = searchMySongs('', '');
      
      expect(results).toHaveLength(0);
    });

    it('should handle whitespace-only search terms', () => {
      const results = searchMySongs('   ', '   ');
      
      expect(results).toHaveLength(0);
    });

    it('should find multiple songs matching the search', () => {
      // Add another song that would match "heart"
      const anotherChordSheet: ChordSheet = {
        artist: 'Radiohead',
        title: 'Heart-Shaped Box',
        songChords: '[Verse 1]\nA    E    F#m    D',
        songKey: 'A',
        guitarCapo: 0,
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
      };
      addToMySongs('Radiohead', 'Heart-Shaped Box', anotherChordSheet);

      const results = searchMySongs(undefined, 'heart');
      
      expect(results).toHaveLength(2);
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Heartbeats', artist: 'José González' }),
          expect.objectContaining({ title: 'Heart-Shaped Box', artist: 'Radiohead' })
        ])
      );
    });
  });

  describe('hasLocalMatches', () => {
    beforeEach(() => {
      // Add a test song
      const chordSheet: ChordSheet = {
        artist: 'Chimarruts',
        title: 'Do Lado de Cá',
        songChords: '[Intro]\nGm    F    Eb    Dm',
        songKey: 'Gm',
        guitarCapo: 0,
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
      };
      addToMySongs('Chimarruts', 'Do Lado de Cá', chordSheet);
    });

    it('should return true when matches exist', () => {
      expect(hasLocalMatches(undefined, 'do lado de ca')).toBe(true);
      expect(hasLocalMatches('chimarruts')).toBe(true);
    });

    it('should return false when no matches exist', () => {
      expect(hasLocalMatches('beatles', 'hey jude')).toBe(false);
    });

    it('should return false when no search terms provided', () => {
      expect(hasLocalMatches()).toBe(false);
    });
  });
});
