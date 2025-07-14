import { describe, it, expect } from '@jest/globals';
import { 
  normalizeArtistResults, 
  normalizeSongResults, 
  normalizeArtist, 
  normalizeSong 
} from '../../utils/response-normalizers.ts';

describe('Response Normalizers', () => {
  describe('normalizeArtistResults', () => {
    it('should normalize Supabase artist results', () => {
      const supabaseArtists = [
        { 
          id: 'uuid-123', 
          displayName: 'Oasis', 
          path: 'oasis', 
          songCount: 25,
          createdAt: '2023-01-01'
        },
        { 
          id: 'uuid-456', 
          displayName: 'Radiohead', 
          path: 'radiohead', 
          songCount: 30,
          updatedAt: '2023-02-01'
        }
      ];

      const result = normalizeArtistResults(supabaseArtists, 'supabase');

      expect(result).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: 25 },
        { displayName: 'Radiohead', path: 'radiohead', songCount: 30 }
      ]);
    });

    it('should normalize CifraClub artist results', () => {
      const cifraClubArtists = [
        { 
          title: 'Oasis - Cifra Club', 
          path: 'oasis', 
          songCount: null,
          url: 'https://www.cifraclub.com.br/oasis'
        },
        { 
          title: 'Radiohead - Cifra Club', 
          path: 'radiohead', 
          songCount: null,
          url: 'https://www.cifraclub.com.br/radiohead'
        }
      ];

      const result = normalizeArtistResults(cifraClubArtists, 'cifraclub');

      expect(result).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: null },
        { displayName: 'Radiohead', path: 'radiohead', songCount: null }
      ]);
    });

    it('should handle mixed format results', () => {
      const mixedArtists = [
        { displayName: 'Oasis', path: 'oasis', songCount: 25 }, // Supabase format
        { title: 'Radiohead - Cifra Club', path: 'radiohead', songCount: null } // CifraClub format
      ];

      const result = normalizeArtistResults(mixedArtists);

      expect(result).toEqual([
        { displayName: 'Oasis', path: 'oasis', songCount: 25 },
        { displayName: 'Radiohead', path: 'radiohead', songCount: null }
      ]);
    });

    it('should filter out invalid entries', () => {
      const invalidArtists = [
        { displayName: 'Valid Artist', path: 'valid-artist', songCount: null },
        { displayName: '', path: 'empty-name', songCount: null }, // Invalid: empty name
        { displayName: 'No Path', songCount: null }, // Invalid: missing path
        null, // Invalid: null entry
        { path: 'no-name', songCount: null }, // Invalid: missing displayName
        { displayName: 'Another Valid', path: 'another-valid', songCount: 5 }
      ];

      const result = normalizeArtistResults(invalidArtists);

      expect(result).toEqual([
        { displayName: 'Valid Artist', path: 'valid-artist', songCount: null },
        { displayName: 'Another Valid', path: 'another-valid', songCount: 5 }
      ]);
    });

    it('should handle empty arrays', () => {
      expect(normalizeArtistResults([])).toEqual([]);
    });

    it('should handle non-array input', () => {
      expect(normalizeArtistResults(null)).toEqual([]);
      expect(normalizeArtistResults(undefined)).toEqual([]);
      expect(normalizeArtistResults('not-array')).toEqual([]);
      expect(normalizeArtistResults(123)).toEqual([]);
    });

    it('should set songCount to null when missing', () => {
      const artists = [
        { displayName: 'Test Artist', path: 'test-artist' } // Missing songCount
      ];

      const result = normalizeArtistResults(artists);

      expect(result).toEqual([
        { displayName: 'Test Artist', path: 'test-artist', songCount: null }
      ]);
    });
  });

  describe('normalizeSongResults', () => {
    it('should normalize song results', () => {
      const songs = [
        { 
          title: 'Wonderwall', 
          artist: 'Oasis', 
          path: 'oasis/wonderwall',
          displayName: 'Wonderwall'
        },
        { 
          title: 'Creep', 
          artist: 'Radiohead', 
          path: 'radiohead/creep',
          displayName: 'Creep'
        }
      ];

      const result = normalizeSongResults(songs);

      expect(result).toEqual([
        { title: 'Wonderwall', artist: 'Oasis', path: 'oasis/wonderwall', displayName: 'Wonderwall' },
        { title: 'Creep', artist: 'Radiohead', path: 'radiohead/creep', displayName: 'Creep' }
      ]);
    });

    it('should use title as displayName when displayName is missing', () => {
      const songs = [
        { title: 'Wonderwall', artist: 'Oasis', path: 'oasis/wonderwall' }
      ];

      const result = normalizeSongResults(songs);

      expect(result).toEqual([
        { title: 'Wonderwall', artist: 'Oasis', path: 'oasis/wonderwall', displayName: 'Wonderwall' }
      ]);
    });

    it('should filter out invalid song entries', () => {
      const invalidSongs = [
        { title: 'Valid Song', artist: 'Valid Artist', path: 'valid/song', displayName: 'Valid Song' },
        { title: '', artist: 'Artist', path: 'invalid', displayName: 'Invalid' }, // Invalid: empty title
        { artist: 'Artist', path: 'no-title', displayName: 'No Title' }, // Invalid: missing title
        { title: 'No Path', artist: 'Artist', displayName: 'No Path' }, // Invalid: missing path
        null, // Invalid: null entry
        { title: 'Another Valid', artist: 'Artist', path: 'another/valid', displayName: 'Another' }
      ];

      const result = normalizeSongResults(invalidSongs);

      expect(result).toEqual([
        { title: 'Valid Song', artist: 'Valid Artist', path: 'valid/song', displayName: 'Valid Song' },
        { title: 'Another Valid', artist: 'Artist', path: 'another/valid', displayName: 'Another' }
      ]);
    });

    it('should handle non-array input', () => {
      expect(normalizeSongResults(null)).toEqual([]);
      expect(normalizeSongResults(undefined)).toEqual([]);
      expect(normalizeSongResults('not-array')).toEqual([]);
    });
  });

  describe('normalizeArtist', () => {
    it('should normalize a single artist object', () => {
      const artist = { 
        id: 'uuid-123', 
        displayName: 'Oasis', 
        path: 'oasis', 
        songCount: 25 
      };

      const result = normalizeArtist(artist, 'supabase');

      expect(result).toEqual({
        displayName: 'Oasis',
        path: 'oasis',
        songCount: 25
      });
    });

    it('should return null for invalid artist', () => {
      const invalidArtist = { displayName: '', path: 'invalid' };

      const result = normalizeArtist(invalidArtist);

      expect(result).toBeNull();
    });

    it('should handle null input', () => {
      expect(normalizeArtist(null)).toBeNull();
      expect(normalizeArtist(undefined)).toBeNull();
    });
  });

  describe('normalizeSong', () => {
    it('should normalize a single song object', () => {
      const song = { 
        title: 'Wonderwall', 
        artist: 'Oasis', 
        path: 'oasis/wonderwall',
        displayName: 'Wonderwall'
      };

      const result = normalizeSong(song);

      expect(result).toEqual({
        title: 'Wonderwall',
        artist: 'Oasis',
        path: 'oasis/wonderwall',
        displayName: 'Wonderwall'
      });
    });

    it('should return null for invalid song', () => {
      const invalidSong = { title: '', artist: 'Artist', path: 'invalid' };

      const result = normalizeSong(invalidSong);

      expect(result).toBeNull();
    });

    it('should handle null input', () => {
      expect(normalizeSong(null)).toBeNull();
      expect(normalizeSong(undefined)).toBeNull();
    });
  });

  describe('edge cases and robustness', () => {
    it('should handle objects with extra properties', () => {
      const artist = {
        id: 'uuid-123',
        displayName: 'Test Artist',
        path: 'test-artist',
        songCount: 10,
        extraProperty: 'should be ignored',
        anotherExtra: { nested: 'object' }
      };

      const result = normalizeArtist(artist);

      expect(result).toEqual({
        displayName: 'Test Artist',
        path: 'test-artist',
        songCount: 10
      });
    });

    it('should handle string songCount values', () => {
      const artist = {
        displayName: 'Test Artist',
        path: 'test-artist',
        songCount: '15' // String instead of number
      };

      const result = normalizeArtist(artist);

      expect(result).toEqual({
        displayName: 'Test Artist',
        path: 'test-artist',
        songCount: '15' // Preserved as-is
      });
    });

    it('should handle whitespace in paths and names', () => {
      const artist = {
        displayName: '  Spaced Artist  ',
        path: '  spaced-artist  ',
        songCount: null
      };

      const result = normalizeArtist(artist);

      expect(result).toEqual({
        displayName: '  Spaced Artist  ', // Preserved as-is for now
        path: '  spaced-artist  ',     // Preserved as-is for now
        songCount: null
      });
    });
  });
});
