import { describe, it, expect } from '@jest/globals';
import { 
  transformToArtistResults, 
  transformToSongResults, 
  transformToGenericResults 
} from '../../utils/result-transformers.js';

describe('Result Transformers', () => {
  describe('transformToArtistResults', () => {
    it('should transform results to artist objects', () => {
      const results = [
        { title: 'Oasis - Cifra Club', url: 'https://www.cifraclub.com.br/oasis/' },
        { title: 'Radiohead - Cifra Club', url: 'https://www.cifraclub.com.br/radiohead/' }
      ];

      const transformed = transformToArtistResults(results);

      expect(transformed).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: null },
        { displayName: 'Radiohead', path: 'radiohead', songCount: null }
      ]);
    });

    it('should filter out results with invalid paths', () => {
      const results = [
        { title: 'Oasis - Cifra Club', url: 'https://www.cifraclub.com.br/oasis/' },
        { title: 'Invalid - Cifra Club', url: 'invalid-url' }
      ];

      const transformed = transformToArtistResults(results);

      expect(transformed).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: null }
      ]);
    });
  });

  describe('transformToSongResults', () => {
    it('should transform results to song objects with artist information', () => {
      const results = [
        { 
          title: 'Wonderwall - Oasis - Cifra Club', 
          url: 'https://www.cifraclub.com.br/oasis/wonderwall/' 
        },
        { 
          title: 'Creep - Radiohead - Cifra Club', 
          url: 'https://www.cifraclub.com.br/radiohead/creep/' 
        }
      ];

      const transformed = transformToSongResults(results);

      expect(transformed).toEqual([
        { title: 'Wonderwall', url: 'https://www.cifraclub.com.br/oasis/wonderwall/', artist: 'Oasis' },
        { title: 'Creep', url: 'https://www.cifraclub.com.br/radiohead/creep/', artist: 'Radiohead' }
      ]);
    });

    it('should handle songs without artist information', () => {
      const results = [
        { 
          title: 'Wonderwall - Cifra Club', 
          url: 'https://www.cifraclub.com.br/oasis/wonderwall/' 
        }
      ];

      const transformed = transformToSongResults(results);

      expect(transformed).toEqual([
        { title: 'Wonderwall', url: 'https://www.cifraclub.com.br/oasis/wonderwall/', artist: '' }
      ]);
    });
  });

  describe('transformToGenericResults', () => {
    it('should remove Cifra Club suffix from titles', () => {
      const results = [
        { title: 'Some Result - Cifra Club', url: 'https://example.com/1' },
        { title: 'Another Result - Cifra Club', url: 'https://example.com/2' }
      ];

      const transformed = transformToGenericResults(results);

      expect(transformed).toEqual([
        { title: 'Some Result', url: 'https://example.com/1' },
        { title: 'Another Result', url: 'https://example.com/2' }
      ]);
    });

    it('should preserve other result properties', () => {
      const results = [
        { 
          title: 'Some Result - Cifra Club', 
          url: 'https://example.com/1',
          customProperty: 'test'
        }
      ];

      const transformed = transformToGenericResults(results);

      expect(transformed).toEqual([
        { 
          title: 'Some Result', 
          url: 'https://example.com/1',
          customProperty: 'test'
        }
      ]);
    });
  });
});
