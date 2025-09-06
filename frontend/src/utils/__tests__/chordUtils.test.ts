import { songKeyToSemitones, transposeChord, semitonesToKeyName } from '../chordUtils';

describe('chordUtils', () => {
  describe('songKeyToSemitones', () => {
    describe('Major Keys', () => {
      it('should convert basic major keys to correct semitone values', () => {
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

      it('should handle major keys with explicit suffixes', () => {
        expect(songKeyToSemitones('C Major')).toBe(0);
        expect(songKeyToSemitones('F# major')).toBe(6);
        expect(songKeyToSemitones('G maj')).toBe(7);
        expect(songKeyToSemitones('D MAJOR')).toBe(2);
        expect(songKeyToSemitones('Bb major')).toBe(10);
      });

      it('should handle flat major keys by converting to sharp equivalents', () => {
        expect(songKeyToSemitones('Bb')).toBe(10); // A#
        expect(songKeyToSemitones('Eb')).toBe(3);  // D#
        expect(songKeyToSemitones('Ab')).toBe(8);  // G#
        expect(songKeyToSemitones('Db')).toBe(1);  // C#
        expect(songKeyToSemitones('Gb')).toBe(6);  // F#
      });
    });

    describe('Minor Keys', () => {
      it('should convert minor keys with "m" suffix to correct semitone values', () => {
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

      it('should handle minor keys with "minor" suffix', () => {
        expect(songKeyToSemitones('C minor')).toBe(0);
        expect(songKeyToSemitones('F# minor')).toBe(6);
        expect(songKeyToSemitones('G minor')).toBe(7);
        expect(songKeyToSemitones('D MINOR')).toBe(2);
        expect(songKeyToSemitones('Bb minor')).toBe(10);
      });

      it('should handle minor keys with "min" suffix', () => {
        expect(songKeyToSemitones('C min')).toBe(0);
        expect(songKeyToSemitones('F# min')).toBe(6);
        expect(songKeyToSemitones('G min')).toBe(7);
        expect(songKeyToSemitones('D MIN')).toBe(2);
      });

      it('should handle flat minor keys by converting to sharp equivalents', () => {
        expect(songKeyToSemitones('Bbm')).toBe(10); // A#m
        expect(songKeyToSemitones('Ebm')).toBe(3);  // D#m
        expect(songKeyToSemitones('Abm')).toBe(8);  // G#m
        expect(songKeyToSemitones('Dbm')).toBe(1);  // C#m
        expect(songKeyToSemitones('Gbm')).toBe(6);  // F#m
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should return 0 for invalid or empty keys', () => {
        expect(songKeyToSemitones('')).toBe(0);
        expect(songKeyToSemitones('Invalid')).toBe(0);
        expect(songKeyToSemitones('X')).toBe(0);
        expect(songKeyToSemitones('H')).toBe(0);
        expect(songKeyToSemitones('Z#')).toBe(0);
      });

      it('should handle null and undefined inputs', () => {
        expect(songKeyToSemitones(null as any)).toBe(0);
        expect(songKeyToSemitones(undefined as any)).toBe(0);
        expect(songKeyToSemitones(123 as any)).toBe(0);
      });

      it('should handle case insensitive input', () => {
        expect(songKeyToSemitones('c')).toBe(0);
        expect(songKeyToSemitones('f#')).toBe(6);
        expect(songKeyToSemitones('am')).toBe(9);
        expect(songKeyToSemitones('bb')).toBe(10);
        expect(songKeyToSemitones('d#m')).toBe(3);
      });

      it('should handle whitespace in input', () => {
        expect(songKeyToSemitones(' C ')).toBe(0);
        expect(songKeyToSemitones(' F# ')).toBe(6);
        expect(songKeyToSemitones(' Am ')).toBe(9);
        expect(songKeyToSemitones(' Bb ')).toBe(10);
      });

      it('should preserve single letter notes (not treat them as minor)', () => {
        expect(songKeyToSemitones('C')).toBe(0); // Not Cm
        expect(songKeyToSemitones('D')).toBe(2); // Not Dm
        expect(songKeyToSemitones('E')).toBe(4); // Not Em
        expect(songKeyToSemitones('F')).toBe(5); // Not Fm
        expect(songKeyToSemitones('G')).toBe(7); // Not Gm
        expect(songKeyToSemitones('A')).toBe(9); // Not Am
        expect(songKeyToSemitones('B')).toBe(11); // Not Bm
      });
    });

    describe('Comprehensive Key Format Support', () => {
      it('should handle all common key formats correctly', () => {
        // Major keys
        expect(songKeyToSemitones('C')).toBe(0);
        expect(songKeyToSemitones('C major')).toBe(0);
        expect(songKeyToSemitones('C maj')).toBe(0);
        
        // Minor keys
        expect(songKeyToSemitones('Cm')).toBe(0);
        expect(songKeyToSemitones('C minor')).toBe(0);
        expect(songKeyToSemitones('C min')).toBe(0);
        
        // Sharp keys
        expect(songKeyToSemitones('F#')).toBe(6);
        expect(songKeyToSemitones('F# major')).toBe(6);
        expect(songKeyToSemitones('F#m')).toBe(6);
        expect(songKeyToSemitones('F# minor')).toBe(6);
        
        // Flat keys
        expect(songKeyToSemitones('Bb')).toBe(10);
        expect(songKeyToSemitones('Bb major')).toBe(10);
        expect(songKeyToSemitones('Bbm')).toBe(10);
        expect(songKeyToSemitones('Bb minor')).toBe(10);
      });

      it('should specifically handle the reported Bm issue', () => {
        // This test specifically addresses the user's reported issue
        expect(songKeyToSemitones('Bm')).toBe(11); // Should be B (11 semitones), not C (0)
        expect(songKeyToSemitones('B')).toBe(11);  // Major B should also be 11
        expect(songKeyToSemitones('C')).toBe(0);   // C should be 0
        expect(songKeyToSemitones('Am')).toBe(9);  // A minor should be 9
        expect(songKeyToSemitones('A')).toBe(9);   // A major should be 9
      });
    });
  });

  describe('semitonesToKeyName', () => {
    it('should convert semitone values to correct key names using tonal', () => {
      expect(semitonesToKeyName(0)).toBe('C');
      expect(semitonesToKeyName(1)).toBe('Db');
      expect(semitonesToKeyName(2)).toBe('D');
      expect(semitonesToKeyName(3)).toBe('Eb');
      expect(semitonesToKeyName(4)).toBe('E');
      expect(semitonesToKeyName(5)).toBe('F');
      expect(semitonesToKeyName(6)).toBe('F#'); // tonal uses sharps by default
      expect(semitonesToKeyName(7)).toBe('G');
      expect(semitonesToKeyName(8)).toBe('Ab');
      expect(semitonesToKeyName(9)).toBe('A');
      expect(semitonesToKeyName(10)).toBe('Bb');
      expect(semitonesToKeyName(11)).toBe('B');
    });

    it('should handle negative semitone values', () => {
      expect(semitonesToKeyName(-1)).toBe('B');
      expect(semitonesToKeyName(-2)).toBe('Bb');
      expect(semitonesToKeyName(-11)).toBe('Db');
    });

    it('should handle values outside 0-11 range', () => {
      expect(semitonesToKeyName(12)).toBe('C');
      expect(semitonesToKeyName(13)).toBe('Db');
      expect(semitonesToKeyName(24)).toBe('C');
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

    it('should preserve chord quality (major/minor)', () => {
      // Minor chords should stay minor
      expect(transposeChord('Bm', 1)).toBe('Cm');
      expect(transposeChord('Am', 2)).toBe('Bm');
      expect(transposeChord('F#m', -1)).toBe('Fm');
      
      // Major chords should stay major
      expect(transposeChord('C', 1)).toBe('C#');
      expect(transposeChord('G', 2)).toBe('A');
      expect(transposeChord('F', -1)).toBe('E');
    });

    it('should return original chord when transpose is 0', () => {
      expect(transposeChord('C', 0)).toBe('C');
      expect(transposeChord('F#maj7', 0)).toBe('F#maj7');
    });
  });
});
