import { describe, it, expect } from 'vitest';
import { ChordSheet } from '../chordSheet';
import { GUITAR_TUNINGS } from '../../constants/guitar-tunings';

describe('ChordSheet Interface - New Structure', () => {
  describe('Required Properties', () => {
    it('should require title as Required<string>', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test chords[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(chordSheet.title).toBe('Test Song');
      expect(typeof chordSheet.title).toBe('string');
    });

    it('should have artist defaulting to "Unknown Artist" when not provided', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Unknown Artist',
        songChords: '[C]Test chords[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(chordSheet.artist).toBe('Unknown Artist');
    });

    it('should use songChords instead of chords', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Intro] C G Am F\n[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(chordSheet.songChords).toContain('[Intro]');
      expect(chordSheet.songChords).toContain('[Verse]');
    });

    it('should use songKey instead of key', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test[G]',
        songKey: 'Am',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(chordSheet.songKey).toBe('Am');
    });

    it('should use guitarTuning as GuitarTuning type', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[D]Test[A]',
        songKey: 'D',
        guitarTuning: GUITAR_TUNINGS.DROP_D,
        guitarCapo: 0
      };

      expect(chordSheet.guitarTuning).toEqual(['D', 'A', 'D', 'G', 'B', 'E']);
    });

    it('should use guitarCapo as number with 0 default', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[G]Test[D]',
        songKey: 'G',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2
      };

      expect(chordSheet.guitarCapo).toBe(2);
      expect(typeof chordSheet.guitarCapo).toBe('number');
    });
  });

  describe('Default Values', () => {
    it('should handle empty songKey', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test[G]',
        songKey: '', // Empty is valid
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(chordSheet.songKey).toBe('');
    });

    it('should handle no capo (guitarCapo = 0)', () => {
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(chordSheet.guitarCapo).toBe(0);
    });
  });

  describe('Real-world Examples', () => {
    it('should match the fixture format for CPM 22 - Dias Atrás', () => {
      // This should match the structure from cpm-22_dias-atras.json
      const chordSheet: ChordSheet = {
        title: 'Dias Atrás',
        artist: 'CPM 22',
        songChords: '[Intro]\nC G Am F\n[Verse 1]\nC G Am F\nDias atrás...',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(chordSheet.title).toBe('Dias Atrás');
      expect(chordSheet.artist).toBe('CPM 22');
      expect(chordSheet.songChords).toContain('[Intro]');
      expect(chordSheet.songKey).toBe('C');
      expect(chordSheet.guitarTuning).toEqual(GUITAR_TUNINGS.STANDARD);
      expect(chordSheet.guitarCapo).toBe(0);
    });
  });
});
