import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { convertChordSheetToSong } from '../my-chord-sheets-search';
import { ChordSheet } from '@/types/chordSheet';

describe('My Chord Sheets Search Utility', () => {
  beforeEach(() => {
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
        path: '/my-chord-sheets/Oasis/Wonderwall'
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
        path: '/my-chord-sheets/Caf%C3%A9%20Tacvba/Do%20Lado%20de%20C%C3%A1'
      });
    });
  });
});
