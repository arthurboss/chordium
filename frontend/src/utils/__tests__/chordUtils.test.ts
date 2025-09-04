import { songKeyToSemitones, transposeChord } from '../chordUtils';

describe('chordUtils', () => {
  describe('songKeyToSemitones', () => {
    it('should convert basic keys to correct semitone values', () => {
      expect(songKeyToSemitones('C')).toBe(0);
      expect(songKeyToSemitones('C#')).toBe(1);
      expect(songKeyToSemitones('D')).toBe(2);
      expect(songKeyToSemitones('D#')).toBe(3);
      expect(songKeyToSemitones('E')).toBe(4);
      expect(songKeyToSemitones('F')).toBe(5);
      expect(songKeyToSemitones('F#')).toBe(6);
      expect(songKeyToSemitones('G')).toBe(7);
      expect(songKeyToSemitones('G#')).toBe(8);
      expect(songKeyToSemitones('A')).toBe(9);
      expect(songKeyToSemitones('A#')).toBe(10);
      expect(songKeyToSemitones('B')).toBe(11);
    });

    it('should handle keys with major/minor suffixes', () => {
      expect(songKeyToSemitones('C Major')).toBe(0);
      expect(songKeyToSemitones('F# minor')).toBe(6);
      expect(songKeyToSemitones('Am')).toBe(9);
      expect(songKeyToSemitones('Bb major')).toBe(10);
    });

    it('should handle Portuguese suffixes', () => {
      expect(songKeyToSemitones('C maior')).toBe(0);
      expect(songKeyToSemitones('F# menor')).toBe(6);
    });

    it('should handle flat notes by converting to sharp equivalents', () => {
      expect(songKeyToSemitones('Bb')).toBe(10); // A#
      expect(songKeyToSemitones('Eb')).toBe(3);  // D#
    });

    it('should return 0 for invalid or empty keys', () => {
      expect(songKeyToSemitones('')).toBe(0);
      expect(songKeyToSemitones('Invalid')).toBe(0);
      expect(songKeyToSemitones('X')).toBe(0);
    });

    it('should handle case insensitive input', () => {
      expect(songKeyToSemitones('c')).toBe(0);
      expect(songKeyToSemitones('f#')).toBe(6);
      expect(songKeyToSemitones('am')).toBe(9);
    });
  });

  describe('transposeChord', () => {
    it('should transpose basic chords correctly', () => {
      expect(transposeChord('C', 2)).toBe('D');
      expect(transposeChord('F', -1)).toBe('E');
      expect(transposeChord('G', 5)).toBe('C');
    });

    it('should handle complex chords', () => {
      expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7');
      expect(transposeChord('F#m', -1)).toBe('Fm');
      expect(transposeChord('Bb', 1)).toBe('B');
    });

    it('should return original chord when transpose is 0', () => {
      expect(transposeChord('C', 0)).toBe('C');
      expect(transposeChord('F#maj7', 0)).toBe('F#maj7');
    });
  });
});
