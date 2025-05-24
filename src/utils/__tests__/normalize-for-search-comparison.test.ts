import { normalizeForSearch, normalizeForSearchUnicode } from '../normalize-for-search';

describe('normalizeForSearch vs normalizeForSearchUnicode comparison', () => {
  describe('Unicode character handling differences', () => {
    test('should demonstrate the difference with "Luca Hänni"', () => {
      const input = 'Luca Hänni';
      
      // Old function strips accents
      expect(normalizeForSearch(input)).toBe('luca hnni');
      
      // New function preserves accents
      expect(normalizeForSearchUnicode(input)).toBe('luca hänni');
    });

    test('should demonstrate differences with various accented names', () => {
      const testCases = [
        { input: 'José María', old: 'jos mara', new: 'josé maría' },
        { input: 'François Müller', old: 'franois mller', new: 'françois müller' },
        { input: 'Café naïve', old: 'caf nave', new: 'café naïve' },
        { input: 'Björk Guðmundsdóttir', old: 'bjrk gumundsdttir', new: 'björk guðmundsdóttir' },
      ];

      testCases.forEach(({ input, old, new: expected }) => {
        expect(normalizeForSearch(input)).toBe(old);
        expect(normalizeForSearchUnicode(input)).toBe(expected);
      });
    });

    test('should demonstrate differences with non-Latin scripts', () => {
      const testCases = [
        { input: 'Владимир Путин', old: '', new: 'владимир путин' },
        { input: 'محمد علي', old: '', new: 'محمد علي' },
        { input: '中国 北京', old: '', new: '中国 北京' },
        { input: 'Αθήνα Ελλάδα', old: '', new: 'αθήνα ελλάδα' },
      ];

      testCases.forEach(({ input, old, new: expected }) => {
        expect(normalizeForSearch(input)).toBe(old);
        expect(normalizeForSearchUnicode(input)).toBe(expected);
      });
    });
  });

  describe('Consistent behavior for ASCII text', () => {
    test('should behave identically for ASCII-only text', () => {
      const testCases = [
        'The Beatles',
        'Led Zeppelin',
        'Queen',
        'Pink Floyd',
        'System of a Down',
      ];

      testCases.forEach(input => {
        const oldResult = normalizeForSearch(input);
        const newResult = normalizeForSearchUnicode(input);
        expect(oldResult).toBe(newResult);
      });
    });

    test('should handle punctuation with different behaviors', () => {
      const testCases = [
        { input: 'AC/DC', old: 'acdc', new: 'ac dc' }, // Old removes slash, new converts to space
        { input: "Guns N' Roses", old: 'guns n roses', new: 'guns n roses' }, // Both handle apostrophes same way
        { input: 'Green Day', old: 'green day', new: 'green day' }, // No punctuation difference
      ];

      testCases.forEach(({ input, old, new: expected }) => {
        expect(normalizeForSearch(input)).toBe(old);
        expect(normalizeForSearchUnicode(input)).toBe(expected);
      });
    });
  });

  describe('Migration scenarios', () => {
    test('should show search improvement for real artist names', () => {
      const artistNames = [
        'Luca Hänni',
        'DJ Ötzi',
        'Céline Dion',
        'Mylène Farmer',
        'Sigur Rós',
        'Håkan Hellström'
      ];

      artistNames.forEach(name => {
        const oldResult = normalizeForSearch(name);
        const newResult = normalizeForSearchUnicode(name);
        
        // Old version loses information
        expect(oldResult.length).toBeLessThan(newResult.length);
        
        // New version preserves Unicode characters
        expect(newResult).toMatch(/[^\w\s]/);
      });
    });

    test('should demonstrate search accuracy improvement', () => {
      const searchQuery = 'Hänni';
      const artistName = 'Luca Hänni';

      // Old normalization would make these NOT match
      const oldQueryNorm = normalizeForSearch(searchQuery);
      const oldArtistNorm = normalizeForSearch(artistName);
      expect(oldQueryNorm).toBe('hnni');
      expect(oldArtistNorm).toBe('luca hnni');
      expect(oldArtistNorm.includes(oldQueryNorm)).toBe(true); // Still works but loses context

      // New normalization preserves the match perfectly
      const newQueryNorm = normalizeForSearchUnicode(searchQuery);
      const newArtistNorm = normalizeForSearchUnicode(artistName);
      expect(newQueryNorm).toBe('hänni');
      expect(newArtistNorm).toBe('luca hänni');
      expect(newArtistNorm.includes(newQueryNorm)).toBe(true); // Perfect match
    });
  });
});
