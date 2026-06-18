import { isChordLine, parseChordFile } from '../chord-detection';

describe('chord-detection', () => {
  describe('isChordLine', () => {
    it('identifies pure chord lines', () => {
      expect(isChordLine('Am C G F')).toBe(true);
      expect(isChordLine('C  G  Am  F')).toBe(true);
      expect(isChordLine('F#m Bm E A')).toBe(true);
    });

    it('rejects lyric-only lines', () => {
      expect(isChordLine('Hello world, this is a lyric')).toBe(false);
      expect(isChordLine('Just some words here')).toBe(false);
    });

    it('returns false for empty input', () => {
      expect(isChordLine('')).toBe(false);
    });
  });

  describe('parseChordFile', () => {
    it('returns content unchanged', () => {
      const content = 'Am C G\nHello world';
      expect(parseChordFile(content)).toBe(content);
    });
  });
});
