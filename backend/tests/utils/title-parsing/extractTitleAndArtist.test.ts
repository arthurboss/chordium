import { describe, it, expect } from '@jest/globals';
import { extractTitleAndArtist } from '../../../utils/title-parsing.js';

describe('extractTitleAndArtist', () => {
  it('should extract title and artist from standard format', () => {
    const input = 'Wonderwall - Oasis - Cifra Club';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Wonderwall', artist: 'Oasis' });
  });

  it('should handle Unicode characters in artist names', () => {
    const input = 'Wonderful - Luca Hänni - Cifra Club';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Wonderful', artist: 'Luca Hänni' });
  });

  it('should handle complex artist names with hyphens', () => {
    const input = 'Sweet Child O Mine - Guns N Roses - Cifra Club';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Sweet Child O Mine', artist: 'Guns N Roses' });
  });

  it('should handle artist names with apostrophes and special characters', () => {
    const input = "Don't Stop Believin' - Journey - Cifra Club";
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: "Don't Stop Believin'", artist: 'Journey' });
  });

  it('should handle multiple hyphens in title or artist', () => {
    const input = 'Stairway to Heaven - Led Zeppelin - Cifra Club';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Stairway to Heaven', artist: 'Led Zeppelin' });
  });

  it('should handle title with multiple " - " separators correctly', () => {
    const input = 'Song - With - Multiple - Hyphens - Artist Name - Cifra Club';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Song - With - Multiple - Hyphens', artist: 'Artist Name' });
  });

  it('should handle title without artist (no separator)', () => {
    const input = 'Instrumental Track - Cifra Club';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Instrumental Track', artist: '' });
  });

  it('should handle title without "- Cifra Club" suffix', () => {
    const input = 'Wonderwall - Oasis';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Wonderwall', artist: 'Oasis' });
  });

  it('should handle empty string', () => {
    const result = extractTitleAndArtist('');
    expect(result).toEqual({ title: '', artist: '' });
  });

  it('should handle null/undefined input', () => {
    expect(extractTitleAndArtist(null as unknown as string)).toEqual({ title: '', artist: '' });
    expect(extractTitleAndArtist(undefined as unknown as string)).toEqual({ title: '', artist: '' });
  });

  it('should trim whitespace from title and artist', () => {
    const input = '  Wonderwall  -   Oasis   - Cifra Club';
    const result = extractTitleAndArtist(input);
    expect(result).toEqual({ title: 'Wonderwall', artist: 'Oasis' });
  });

  it('should handle real CifraClub title formats', () => {
    const testCases = [
      { input: 'Back in Black - AC/DC - Cifra Club', expected: { title: 'Back in Black', artist: 'AC/DC' } },
      { input: 'Wonderful Tonight - Eric Clapton - Cifra Club', expected: { title: 'Wonderful Tonight', artist: 'Eric Clapton' } },
      { input: 'Wonderful Life - Imany - Cifra Club', expected: { title: 'Wonderful Life', artist: 'Imany' } }
    ];
    testCases.forEach(({ input, expected }) => {
      expect(extractTitleAndArtist(input)).toEqual(expected);
    });
  });
});
