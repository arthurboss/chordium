import { semitonesToKeyName, songKeyToSemitones } from '../key-conversion';

describe('key-conversion', () => {
  describe('semitonesToKeyName', () => {
    it('converts all 12 semitones to correct key names', () => {
      expect(semitonesToKeyName(0)).toBe('C');
      expect(semitonesToKeyName(1)).toBe('Db');
      expect(semitonesToKeyName(2)).toBe('D');
      expect(semitonesToKeyName(3)).toBe('Eb');
      expect(semitonesToKeyName(4)).toBe('E');
      expect(semitonesToKeyName(5)).toBe('F');
      expect(semitonesToKeyName(6)).toBe('F#');
      expect(semitonesToKeyName(7)).toBe('G');
      expect(semitonesToKeyName(8)).toBe('Ab');
      expect(semitonesToKeyName(9)).toBe('A');
      expect(semitonesToKeyName(10)).toBe('Bb');
      expect(semitonesToKeyName(11)).toBe('B');
    });

    it('handles negative semitones', () => {
      expect(semitonesToKeyName(-1)).toBe('B');
      expect(semitonesToKeyName(-2)).toBe('Bb');
      expect(semitonesToKeyName(-12)).toBe('C');
    });

    it('handles values beyond the 0–11 range', () => {
      expect(semitonesToKeyName(12)).toBe('C');
      expect(semitonesToKeyName(13)).toBe('Db');
      expect(semitonesToKeyName(24)).toBe('C');
      expect(semitonesToKeyName(25)).toBe('Db');
    });

    it('returns C as fallback for NaN', () => {
      expect(semitonesToKeyName(NaN)).toBe('C');
    });
  });

  describe('songKeyToSemitones', () => {
    it('converts all 12 major keys', () => {
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

    it('converts all 12 minor keys (m suffix)', () => {
      expect(songKeyToSemitones('Cm')).toBe(0);
      expect(songKeyToSemitones('C#m')).toBe(1);
      expect(songKeyToSemitones('Dm')).toBe(2);
      expect(songKeyToSemitones('D#m')).toBe(3);
      expect(songKeyToSemitones('Em')).toBe(4);
      expect(songKeyToSemitones('Fm')).toBe(5);
      expect(songKeyToSemitones('F#m')).toBe(6);
      expect(songKeyToSemitones('Gm')).toBe(7);
      expect(songKeyToSemitones('G#m')).toBe(8);
      expect(songKeyToSemitones('Am')).toBe(9);
      expect(songKeyToSemitones('A#m')).toBe(10);
      expect(songKeyToSemitones('Bm')).toBe(11);
    });

    it('handles flat keys by mapping to sharp equivalents', () => {
      expect(songKeyToSemitones('Bb')).toBe(10);
      expect(songKeyToSemitones('Eb')).toBe(3);
      expect(songKeyToSemitones('Ab')).toBe(8);
      expect(songKeyToSemitones('Db')).toBe(1);
      expect(songKeyToSemitones('Gb')).toBe(6);
      expect(songKeyToSemitones('Bbm')).toBe(10);
      expect(songKeyToSemitones('Ebm')).toBe(3);
    });

    it('handles explicit major/minor suffixes', () => {
      expect(songKeyToSemitones('C major')).toBe(0);
      expect(songKeyToSemitones('C minor')).toBe(0);
      expect(songKeyToSemitones('F# major')).toBe(6);
      expect(songKeyToSemitones('F# minor')).toBe(6);
      expect(songKeyToSemitones('G maj')).toBe(7);
      expect(songKeyToSemitones('C min')).toBe(0);
      expect(songKeyToSemitones('D MAJOR')).toBe(2);
      expect(songKeyToSemitones('D MINOR')).toBe(2);
    });

    it('is case-insensitive and trims whitespace', () => {
      expect(songKeyToSemitones('c')).toBe(0);
      expect(songKeyToSemitones('f#')).toBe(6);
      expect(songKeyToSemitones('am')).toBe(9);
      expect(songKeyToSemitones('bb')).toBe(10);
      expect(songKeyToSemitones(' C ')).toBe(0);
      expect(songKeyToSemitones(' F# ')).toBe(6);
    });

    it('does not treat single letters as minor keys', () => {
      expect(songKeyToSemitones('C')).toBe(0);
      expect(songKeyToSemitones('A')).toBe(9);
      expect(songKeyToSemitones('B')).toBe(11);
    });

    it('returns 0 for invalid or empty input', () => {
      expect(songKeyToSemitones('')).toBe(0);
      expect(songKeyToSemitones('Invalid')).toBe(0);
      expect(songKeyToSemitones('X')).toBe(0);
      expect(songKeyToSemitones(null as unknown as string)).toBe(0);
      expect(songKeyToSemitones(undefined as unknown as string)).toBe(0);
      expect(songKeyToSemitones(123 as unknown as string)).toBe(0);
    });
  });
});
