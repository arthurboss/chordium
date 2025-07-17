import { describe, it, expect } from 'vitest';
import {
  transformLegacyToNew,
  transformNewToLegacy,
  createDefaultChordSheet,
  validateChordSheet,
  LegacyChordSheet
} from '../chordsheet-transformer';
import { GUITAR_TUNINGS } from '../../types/guitarTuning';
import { ChordSheet } from '../../types/chordSheet';

describe('ChordSheet Transformer (TDD)', () => {
  describe('transformLegacyToNew', () => {
    it('should transform basic legacy format to new format', () => {
      const legacy: LegacyChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        chords: '[C]Test chord content[G]',
        key: 'C',
        tuning: 'Standard',
        capo: '2'
      };

      const result = transformLegacyToNew(legacy);

      expect(result).toEqual({
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test chord content[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2
      });
    });

    it('should handle empty/missing artist with default', () => {
      const legacy: LegacyChordSheet = {
        title: 'Test Song',
        artist: '',
        chords: '[C]Test[G]',
        key: 'C',
        tuning: 'Standard',
        capo: 0
      };

      const result = transformLegacyToNew(legacy);

      expect(result.artist).toBe('Unknown Artist');
    });

    it('should parse different tuning formats', () => {
      const testCases = [
        { input: 'Standard', expected: GUITAR_TUNINGS.STANDARD },
        { input: 'DROP_D', expected: GUITAR_TUNINGS.DROP_D },
        { input: 'drop d', expected: GUITAR_TUNINGS.DROP_D },
        { input: 'E A D G B E', expected: ['E', 'A', 'D', 'G', 'B', 'E'] },
        { input: 'D A D G B E', expected: ['D', 'A', 'D', 'G', 'B', 'E'] },
        { input: 'invalid', expected: GUITAR_TUNINGS.STANDARD }, // fallback
      ];

      testCases.forEach(({ input, expected }) => {
        const legacy: LegacyChordSheet = {
          title: 'Test',
          artist: 'Test',
          chords: '[C]Test[G]',
          key: 'C',
          tuning: input,
          capo: 0
        };

        const result = transformLegacyToNew(legacy);
        expect(result.guitarTuning).toEqual(expected);
      });
    });

    it('should parse different capo formats', () => {
      const testCases: Array<{ input: string | number | undefined, expected: number }> = [
        { input: '2', expected: 2 },
        { input: 2, expected: 2 },
        { input: 'Capo 3rd fret', expected: 3 },
        { input: '5th fret', expected: 5 },
        { input: 'No capo', expected: 0 },
        { input: '', expected: 0 },
        { input: undefined, expected: 0 },
        { input: -1, expected: 0 }, // negative should become 0
      ];

      testCases.forEach(({ input, expected }) => {
        const legacy: LegacyChordSheet = {
          title: 'Test',
          artist: 'Test',
          chords: '[C]Test[G]',
          key: 'C',
          tuning: 'Standard',
          capo: input ?? 0
        };

        const result = transformLegacyToNew(legacy);
        expect(result.guitarCapo).toBe(expected);
      });
    });
  });

  describe('transformNewToLegacy', () => {
    it('should transform new format back to legacy format', () => {
      const newFormat: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test chord content[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.DROP_D,
        guitarCapo: 2
      };

      const result = transformNewToLegacy(newFormat);

      expect(result).toEqual({
        title: 'Test Song',
        artist: 'Test Artist',
        chords: '[C]Test chord content[G]',
        key: 'C',
        tuning: 'D A D G B E',
        capo: 2
      });
    });

    it('should handle various guitar tunings', () => {
      const testCases = [
        { tuning: GUITAR_TUNINGS.STANDARD, expected: 'E A D G B E' },
        { tuning: GUITAR_TUNINGS.DROP_D, expected: 'D A D G B E' },
        { tuning: GUITAR_TUNINGS.OPEN_G, expected: 'D G D G B D' },
      ];

      testCases.forEach(({ tuning, expected }) => {
        const newFormat: ChordSheet = {
          title: 'Test',
          artist: 'Test',
          songChords: '[C]Test[G]',
          songKey: 'C',
          guitarTuning: tuning,
          guitarCapo: 0
        };

        const result = transformNewToLegacy(newFormat);
        expect(result.tuning).toBe(expected);
      });
    });
  });

  describe('createDefaultChordSheet', () => {
    it('should create default ChordSheet with standard values', () => {
      const result = createDefaultChordSheet();

      expect(result).toEqual({
        title: '',
        artist: 'Unknown Artist',
        songChords: '',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      });
    });

    it('should allow overriding default values', () => {
      const result = createDefaultChordSheet({
        title: 'Custom Song',
        songKey: 'Am',
        guitarCapo: 3
      });

      expect(result).toEqual({
        title: 'Custom Song',
        artist: 'Unknown Artist',
        songChords: '',
        songKey: 'Am',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 3
      });
    });
  });

  describe('validateChordSheet', () => {
    it('should validate correct ChordSheet objects', () => {
      const validChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(validateChordSheet(validChordSheet)).toBe(true);
    });

    it('should reject invalid objects', () => {
      const invalidCases = [
        null,
        undefined,
        'string',
        123,
        {},
        { title: 'Test' }, // missing properties
        { title: 123, artist: 'Test' }, // wrong type
        { 
          title: 'Test',
          artist: 'Test', 
          songChords: 'Test',
          songKey: 'C',
          guitarTuning: ['E', 'A', 'D'], // wrong length
          guitarCapo: 0
        },
        {
          title: 'Test',
          artist: 'Test', 
          songChords: 'Test',
          songKey: 'C',
          guitarTuning: GUITAR_TUNINGS.STANDARD,
          guitarCapo: '2' // wrong type
        }
      ];

      invalidCases.forEach((invalid) => {
        expect(validateChordSheet(invalid)).toBe(false);
      });
    });
  });

  describe('Round-trip transformation', () => {
    it('should maintain data integrity in legacy -> new -> legacy transformation', () => {
      const originalLegacy: LegacyChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        chords: '[Intro] C G Am F\n[Verse] C G Am F\nSome lyrics here',
        key: 'C',
        tuning: 'Drop D',
        capo: '2'
      };

      const transformed = transformLegacyToNew(originalLegacy);
      const backToLegacy = transformNewToLegacy(transformed);

      expect(backToLegacy.title).toBe(originalLegacy.title);
      expect(backToLegacy.artist).toBe(originalLegacy.artist);
      expect(backToLegacy.chords).toBe(originalLegacy.chords);
      expect(backToLegacy.key).toBe(originalLegacy.key);
      expect(backToLegacy.tuning).toBe('D A D G B E'); // Normalized format
      expect(backToLegacy.capo).toBe(2); // Parsed to number
    });
  });
});
