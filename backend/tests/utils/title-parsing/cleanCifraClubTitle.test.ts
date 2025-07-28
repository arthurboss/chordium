import { describe, it, expect } from '@jest/globals';
import { cleanCifraClubTitle } from '../../../utils/title-parsing.js';

describe('cleanCifraClubTitle', () => {
  it('should remove "- Cifra Club" suffix from title', () => {
    const input = 'Wonderwall - Oasis - Cifra Club';
    const expected = 'Wonderwall - Oasis';
    expect(cleanCifraClubTitle(input)).toBe(expected);
  });

  it('should handle title without "- Cifra Club" suffix', () => {
    const input = 'Wonderwall - Oasis';
    const expected = 'Wonderwall - Oasis';
    expect(cleanCifraClubTitle(input)).toBe(expected);
  });

  it('should handle empty string', () => {
    expect(cleanCifraClubTitle('')).toBe('');
  });

  it('should handle null/undefined input', () => {
    expect(cleanCifraClubTitle(null as unknown as string)).toBe('');
    expect(cleanCifraClubTitle(undefined as unknown as string)).toBe('');
  });

  it('should trim whitespace after cleaning', () => {
    const input = '  Wonderwall - Oasis - Cifra Club  ';
    const expected = 'Wonderwall - Oasis';
    expect(cleanCifraClubTitle(input)).toBe(expected);
  });
});
