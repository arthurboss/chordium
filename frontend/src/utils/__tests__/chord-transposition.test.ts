import { transposeChord, NOTES } from '../chord-transposition';

describe('chord-transposition', () => {
  describe('NOTES', () => {
    it('contains all 12 chromatic notes in order', () => {
      expect(NOTES).toHaveLength(12);
      expect(NOTES[0]).toBe('C');
      expect(NOTES[11]).toBe('B');
    });
  });

  describe('transposeChord', () => {
    it('returns original chord when halfSteps is 0', () => {
      expect(transposeChord('C', 0)).toBe('C');
      expect(transposeChord('Am', 0)).toBe('Am');
      expect(transposeChord('F#m7', 0)).toBe('F#m7');
    });

    it('transposes basic major chords', () => {
      expect(transposeChord('C', 1)).toBe('C#');
      expect(transposeChord('C', 2)).toBe('D');
      expect(transposeChord('C', 12)).toBe('C');
      expect(transposeChord('C', -1)).toBe('B');
      expect(transposeChord('C', -2)).toBe('A#');
    });

    it('transposes minor chords, preserving quality', () => {
      expect(transposeChord('Am', 1)).toBe('A#m');
      expect(transposeChord('Am', 2)).toBe('Bm');
      expect(transposeChord('Am', -1)).toBe('G#m');
      expect(transposeChord('Bm', 1)).toBe('Cm');
    });

    it('transposes chords with extensions', () => {
      expect(transposeChord('Cmaj7', 1)).toBe('C#maj7');
      expect(transposeChord('Am7', 2)).toBe('Bm7');
      expect(transposeChord('F#sus4', -1)).toBe('Fsus4');
      expect(transposeChord('Gadd9', 3)).toBe('A#add9');
    });

    it('transposes slash chords — bass note transposes alongside root', () => {
      expect(transposeChord('C/E', 1)).toBe('C#/F');
      expect(transposeChord('Am/C', 2)).toBe('Bm/D');
      expect(transposeChord('F#m/A', -1)).toBe('Fm/G#');
      expect(transposeChord('G/B', -1)).toBe('F#/A#');
      expect(transposeChord('G/B', -2)).toBe('F/A');
    });

    it('normalises flat notes to sharps when transposing', () => {
      expect(transposeChord('F#', 1)).toBe('G');
      expect(transposeChord('Bb', 1)).toBe('B');
      expect(transposeChord('D#m', -1)).toBe('Dm');
      expect(transposeChord('Abmaj7', 2)).toBe('A#maj7');
    });

    it('handles octave and multi-octave transpositions', () => {
      expect(transposeChord('C', 12)).toBe('C');
      expect(transposeChord('C', -12)).toBe('C');
      expect(transposeChord('C', 24)).toBe('C');
      expect(transposeChord('C', -24)).toBe('C');
      expect(transposeChord('C', 100)).toBe('E'); // 100 % 12 = 4
    });

    it('returns original for invalid input', () => {
      expect(transposeChord('', 1)).toBe('');
      expect(transposeChord('Invalid', 1)).toBe('Invalid');
      expect(transposeChord('X', 1)).toBe('X');
    });

    it('handles complex chord names with extensions and accidentals', () => {
      expect(transposeChord('Cmaj7#11', 1)).toBe('C#maj7#11');
      expect(transposeChord('Am7b5', 2)).toBe('Bm7b5');
      expect(transposeChord('F#m7b5', -1)).toBe('Fm7b5');
      expect(transposeChord('Cmaj7#11/E', 1)).toBe('C#maj7#11/F');
    });

    it('round-trips correctly (transpose up then down returns original)', () => {
      expect(transposeChord(transposeChord('Am7', 5), -5)).toBe('Am7');
      expect(transposeChord(transposeChord('F#m', 12), -12)).toBe('F#m');
      expect(transposeChord(transposeChord('G/B', -2), 2)).toBe('G/B');
      expect(transposeChord(transposeChord('D9/F#', 3), -3)).toBe('D9/F#');
    });
  });

  describe('slash chord music theory — root-to-bass interval is preserved', () => {
    const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    function noteIdx(note: string): number {
      const n = note.endsWith('b') ? CHROMATIC[(CHROMATIC.indexOf(note[0]) + 11) % 12] : note;
      return CHROMATIC.indexOf(n);
    }

    function slashInterval(chord: string): number {
      const [root, bass] = chord.split('/');
      const rootNote = root.match(/^[A-G][#b]?/)?.[0] ?? '';
      return ((noteIdx(bass) - noteIdx(rootNote)) + 12) % 12;
    }

    it('G/B: major-third interval (4 semitones) is preserved after any transposition', () => {
      const original = slashInterval('G/B');
      expect(slashInterval(transposeChord('G/B', -1))).toBe(original); // → F#/A#
      expect(slashInterval(transposeChord('G/B', -2))).toBe(original); // → F/A
      expect(slashInterval(transposeChord('G/B',  5))).toBe(original); // → C/E
    });

    it('D9/F#: interval preserved (common capo chord in this project)', () => {
      const original = slashInterval('D9/F#');
      expect(slashInterval(transposeChord('D9/F#', -1))).toBe(original);
      expect(slashInterval(transposeChord('D9/F#',  2))).toBe(original);
    });

    it('C/E: first-inversion C major, interval preserved', () => {
      const original = slashInterval('C/E');
      expect(slashInterval(transposeChord('C/E', 1))).toBe(original); // → C#/F
      expect(slashInterval(transposeChord('C/E', 7))).toBe(original); // → G/B
    });

    it('capo 1 on G/B sounds as F#/A#', () => {
      expect(transposeChord('G/B', -1)).toBe('F#/A#');
    });

    it('capo 2 on G/B sounds as F/A', () => {
      expect(transposeChord('G/B', -2)).toBe('F/A');
    });
  });
});
