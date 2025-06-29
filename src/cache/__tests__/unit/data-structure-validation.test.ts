import { describe, it, expect, beforeEach } from 'vitest';
import { 
  cacheChordSheet, 
  getCachedChordSheet,
  clearChordSheetCache 
} from '../../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('ChordSheet Data Structure Validation', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    clearChordSheetCache();
  });

  describe('Complete Structure Validation', () => {
    it('should store complete ChordSheet structure without extra fields', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test chord content',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
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
        guitarCapo: 0,
      });

      // Verify no extra fields like 'content', 'data', etc.
      expect(retrieved).not.toHaveProperty('content');
      expect(retrieved).not.toHaveProperty('data');
      expect(retrieved).not.toHaveProperty('timestamp');
    });

    it('should preserve all ChordSheet properties', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Complex Song',
        artist: 'Complex Artist',
        songChords: '[Intro]\nC7M G/B Am7\n[Verse]\nF G C Am\n[Chorus]\nF G Am C',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.DROP_D,
        guitarCapo: 5,
      };

      // Act
      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
      const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);

      // Assert - every property should be preserved exactly
      expect(retrieved?.title).toBe('Complex Song');
      expect(retrieved?.artist).toBe('Complex Artist');
      expect(retrieved?.songChords).toBe('[Intro]\nC7M G/B Am7\n[Verse]\nF G C Am\n[Chorus]\nF G Am C');
      expect(retrieved?.songKey).toBe('C');
      expect(retrieved?.guitarTuning).toEqual(GUITAR_TUNINGS.DROP_D);
      expect(retrieved?.guitarCapo).toBe(5);
    });

    it('should handle different guitar tunings correctly', () => {
      // Arrange
      const testCases = [
        { tuning: GUITAR_TUNINGS.STANDARD, name: 'Standard' },
        { tuning: GUITAR_TUNINGS.DROP_D, name: 'Drop D' },
        { tuning: GUITAR_TUNINGS.DADGAD, name: 'DADGAD' },
      ];

      // Act & Assert
      testCases.forEach(({ tuning, name }, index) => {
        const chordSheet: ChordSheet = {
          title: `Song ${index + 1}`,
          artist: `Artist ${index + 1}`,
          songChords: `[Verse] Test chords for ${name}`,
          songKey: 'G',
          guitarTuning: tuning,
          guitarCapo: index,
        };

        cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
        const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);

        expect(retrieved?.guitarTuning).toEqual(tuning);
        expect(retrieved?.guitarCapo).toBe(index);
      });
    });

    it('should handle capo values correctly', () => {
      // Arrange
      const testCases = [0, 1, 5, 12]; // Different capo positions

      // Act & Assert
      testCases.forEach((capo) => {
        const chordSheet: ChordSheet = {
          title: `Capo ${capo} Song`,
          artist: 'Test Artist',
          songChords: '[Verse] C G Am F',
          songKey: 'C',
          guitarTuning: GUITAR_TUNINGS.STANDARD,
          guitarCapo: capo,
        };

        cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
        const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);

        expect(retrieved?.guitarCapo).toBe(capo);
      });
    });

    it('should handle empty chord content', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Empty Song',
        artist: 'Test Artist',
        songChords: '',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
      const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);

      // Assert
      expect(retrieved?.songChords).toBe('');
      expect(retrieved?.songKey).toBe('');
      expect(retrieved).toEqual(chordSheet);
    });

    it('should handle special characters in chord content', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Special Characters Song',
        artist: 'José González',
        songChords: '[Intro] C7M G/B Am7 F#dim\n[Verse] C/G D/F# Em7 A♭maj7',
        songKey: 'C♯',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2,
      };

      // Act
      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
      const retrieved = getCachedChordSheet(chordSheet.artist, chordSheet.title);

      // Assert
      expect(retrieved?.artist).toBe('José González');
      expect(retrieved?.songChords).toBe('[Intro] C7M G/B Am7 F#dim\n[Verse] C/G D/F# Em7 A♭maj7');
      expect(retrieved?.songKey).toBe('C♯');
    });
  });
});
