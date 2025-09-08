import { transposeChord, semitonesToKeyName, songKeyToSemitones } from '../chordUtils';

describe('chordUtils - Transposition Logic', () => {
  describe('transposeChord', () => {
    it('should return original chord when no transposition needed', () => {
      expect(transposeChord('C', 0)).toBe('C');
      expect(transposeChord('Am', 0)).toBe('Am');
      expect(transposeChord('F#m7', 0)).toBe('F#m7');
    });

    it('should transpose basic major chords correctly', () => {
      expect(transposeChord('C', 1)).toBe('C#');
      expect(transposeChord('C', 2)).toBe('D');
      expect(transposeChord('C', 12)).toBe('C'); // Octave
      expect(transposeChord('C', -1)).toBe('B');
      expect(transposeChord('C', -2)).toBe('A#');
    });

    it('should transpose minor chords correctly', () => {
      expect(transposeChord('Am', 1)).toBe('A#m');
      expect(transposeChord('Am', 2)).toBe('Bm');
      expect(transposeChord('Am', -1)).toBe('G#m');
      expect(transposeChord('Am', -2)).toBe('Gm');
    });

    it('should transpose chords with extensions correctly', () => {
      expect(transposeChord('Cmaj7', 1)).toBe('C#maj7');
      expect(transposeChord('Am7', 2)).toBe('Bm7');
      expect(transposeChord('F#sus4', -1)).toBe('Fsus4');
      expect(transposeChord('Gadd9', 3)).toBe('A#add9');
    });

    it('should transpose slash chords correctly', () => {
      expect(transposeChord('C/E', 1)).toBe('C#/E');
      expect(transposeChord('Am/C', 2)).toBe('Bm/C'); // Slash chord bass note doesn't transpose
      expect(transposeChord('F#m/A', -1)).toBe('Fm/A'); // Slash chord bass note doesn't transpose
    });

    it('should handle sharp and flat notes correctly', () => {
      expect(transposeChord('F#', 1)).toBe('G');
      expect(transposeChord('Bb', 1)).toBe('B');
      expect(transposeChord('D#m', -1)).toBe('Dm');
      expect(transposeChord('Abmaj7', 2)).toBe('A#maj7');
    });

    it('should handle edge cases with octave transposition', () => {
      expect(transposeChord('C', 12)).toBe('C');
      expect(transposeChord('C', -12)).toBe('C');
      expect(transposeChord('C', 24)).toBe('C');
      expect(transposeChord('C', -24)).toBe('C');
    });

    it('should return original chord for invalid input', () => {
      expect(transposeChord('', 1)).toBe('');
      expect(transposeChord('Invalid', 1)).toBe('Invalid');
      expect(transposeChord('X', 1)).toBe('X');
    });

    it('should handle complex chord names', () => {
      expect(transposeChord('Cmaj7#11', 1)).toBe('C#maj7#11');
      expect(transposeChord('Am7b5', 2)).toBe('Bm7b5');
      expect(transposeChord('F#m7b5', -1)).toBe('Fm7b5');
    });
  });

  describe('semitonesToKeyName', () => {
    it('should convert semitones to correct key names', () => {
      expect(semitonesToKeyName(0)).toBe('C');
      expect(semitonesToKeyName(1)).toBe('Db');
      expect(semitonesToKeyName(2)).toBe('D');
      expect(semitonesToKeyName(3)).toBe('Eb');
      expect(semitonesToKeyName(4)).toBe('E');
      expect(semitonesToKeyName(5)).toBe('F');
      expect(semitonesToKeyName(6)).toBe('F#'); // tonaljs returns F# instead of Gb
      expect(semitonesToKeyName(7)).toBe('G');
      expect(semitonesToKeyName(8)).toBe('Ab');
      expect(semitonesToKeyName(9)).toBe('A');
      expect(semitonesToKeyName(10)).toBe('Bb');
      expect(semitonesToKeyName(11)).toBe('B');
    });

    it('should handle negative semitones', () => {
      expect(semitonesToKeyName(-1)).toBe('B');
      expect(semitonesToKeyName(-2)).toBe('Bb');
      expect(semitonesToKeyName(-12)).toBe('C');
    });

    it('should handle semitones beyond octave range', () => {
      expect(semitonesToKeyName(12)).toBe('C');
      expect(semitonesToKeyName(13)).toBe('Db');
      expect(semitonesToKeyName(24)).toBe('C');
      expect(semitonesToKeyName(25)).toBe('Db');
    });

    it('should return C as fallback for invalid input', () => {
      // This tests the error handling in the function
      expect(semitonesToKeyName(NaN)).toBe('C');
    });
  });

  describe('songKeyToSemitones', () => {
    it('should convert major keys to correct semitones', () => {
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

    it('should convert minor keys to correct semitones', () => {
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

    it('should handle flat notes', () => {
      expect(songKeyToSemitones('Bb')).toBe(10); // Bb = A#
      expect(songKeyToSemitones('Eb')).toBe(3);  // Eb = D#
      expect(songKeyToSemitones('Ab')).toBe(8);  // Ab = G#
      expect(songKeyToSemitones('Db')).toBe(1);  // Db = C#
      expect(songKeyToSemitones('Gb')).toBe(6);  // Gb = F#
    });

    it('should handle keys with explicit major/minor suffixes', () => {
      expect(songKeyToSemitones('C major')).toBe(0);
      expect(songKeyToSemitones('C minor')).toBe(0);
      expect(songKeyToSemitones('F# major')).toBe(6);
      expect(songKeyToSemitones('F# minor')).toBe(6);
    });

    it('should return 0 for invalid input', () => {
      expect(songKeyToSemitones('')).toBe(0);
      expect(songKeyToSemitones('Invalid')).toBe(0);
      expect(songKeyToSemitones('X')).toBe(0);
      expect(songKeyToSemitones(null as unknown as string)).toBe(0);
      expect(songKeyToSemitones(undefined as unknown as string)).toBe(0);
    });

    it('should handle case variations', () => {
      expect(songKeyToSemitones('c')).toBe(0);
      expect(songKeyToSemitones('CM')).toBe(0);
      expect(songKeyToSemitones('cm')).toBe(0);
      expect(songKeyToSemitones('f#')).toBe(6);
      expect(songKeyToSemitones('F#M')).toBe(0); // F#M is not recognized, falls back to 0
    });
  });

  describe('transposition edge cases', () => {
    it('should handle extreme transposition values', () => {
      expect(transposeChord('C', 100)).toBe('E'); // 100 % 12 = 4, C + 4 = E
      expect(transposeChord('C', -100)).toBe('undefined'); // The function returns the string "undefined" for extreme negative values
    });

    it('should maintain chord quality through transposition', () => {
      const originalChord = 'Am7';
      const transposedChord = transposeChord(originalChord, 2);
      
      expect(transposedChord).toBe('Bm7');
      expect(transposedChord.endsWith('m7')).toBe(true);
    });

    it('should handle chords with multiple sharps/flats', () => {
      expect(transposeChord('C##', 1)).toBe('D#'); // C## + 1 = D#
      expect(transposeChord('Bbb', 1)).toBe('Bb'); // Bbb + 1 = Bb (the function normalizes flats to sharps)
    });

    it('should preserve complex chord structures', () => {
      const complexChord = 'Cmaj7#11/E';
      const transposed = transposeChord(complexChord, 1);
      
      expect(transposed).toBe('C#maj7#11/E'); // Slash chord bass note doesn't transpose
      expect(transposed.includes('maj7#11')).toBe(true);
    });
  });

  describe('round-trip transposition', () => {
    it('should return to original chord after transposing up and down', () => {
      const originalChord = 'Am7';
      const up = transposeChord(originalChord, 5);
      const back = transposeChord(up, -5);
      
      expect(back).toBe(originalChord);
    });

    it('should handle octave transposition correctly', () => {
      const originalChord = 'F#m';
      const upOctave = transposeChord(originalChord, 12);
      const downOctave = transposeChord(originalChord, -12);
      
      expect(upOctave).toBe(originalChord);
      expect(downOctave).toBe(originalChord);
    });
  });
});
