import { describe, it, expect } from '@jest/globals';
import { normalizeArtistResults } from '../../../utils/response-normalizers.js';

import type { Artist } from '../../../../shared/types/index.js';

/**
 * Tests for normalizeArtistResults function
 */

describe('normalizeArtistResults', () => {
  it('should normalize Supabase artist results', () => {
    const supabaseArtists = [
      { id: 'uuid-123', displayName: 'Oasis', path: 'oasis', songCount: 25, createdAt: '2023-01-01' },
      { id: 'uuid-456', displayName: 'Radiohead', path: 'radiohead', songCount: 30, updatedAt: '2023-02-01' }
    ];
    const result = normalizeArtistResults(supabaseArtists as unknown as Artist[], 'supabase');
    expect(result).toEqual([
      { displayName: 'Oasis', path: 'oasis', songCount: 25 },
      { displayName: 'Radiohead', path: 'radiohead', songCount: 30 }
    ]);
  });

  it('should normalize CifraClub artist results', () => {
    const cifraClubArtists = [
      { title: 'Oasis - Cifra Club', path: 'oasis', songCount: null, url: 'https://www.cifraclub.com.br/oasis' },
      { title: 'Radiohead - Cifra Club', path: 'radiohead', songCount: null, url: 'https://www.cifraclub.com.br/radiohead' }
    ];
    const result = normalizeArtistResults(cifraClubArtists as unknown as Artist[], 'cifraclub');
    expect(result).toEqual([
      { displayName: 'Oasis', path: 'oasis', songCount: null },
      { displayName: 'Radiohead', path: 'radiohead', songCount: null }
    ]);
  });

  it('should handle mixed format results', () => {
    const mixedArtists = [
      { displayName: 'Oasis', path: 'oasis', songCount: 25 },
      { title: 'Radiohead - Cifra Club', path: 'radiohead', songCount: null }
    ];
    const result = normalizeArtistResults(mixedArtists as unknown as Artist[]);
    expect(result).toEqual([
      { displayName: 'Oasis', path: 'oasis', songCount: 25 },
      { displayName: 'Radiohead', path: 'radiohead', songCount: null }
    ]);
  });

  it('should filter out invalid entries', () => {
    const invalidArtists = [
      { displayName: 'Valid Artist', path: 'valid-artist', songCount: null },
      { displayName: '', path: 'empty-name', songCount: null },
      { displayName: 'No Path', songCount: null },
      null,
      { path: 'no-name', songCount: null },
      { displayName: 'Another Valid', path: 'another-valid', songCount: 5 }
    ];
    const result = normalizeArtistResults(invalidArtists as unknown as Artist[]);
    expect(result).toEqual([
      { displayName: 'Valid Artist', path: 'valid-artist', songCount: null },
      { displayName: 'Another Valid', path: 'another-valid', songCount: 5 }
    ]);
  });

  it('should handle empty arrays', () => {
    expect(normalizeArtistResults([] as unknown as Artist[])).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(normalizeArtistResults(null as unknown as Artist[])).toEqual([]);
    expect(normalizeArtistResults(undefined as unknown as Artist[])).toEqual([]);
    expect(normalizeArtistResults('not-array' as unknown as Artist[])).toEqual([]);
    expect(normalizeArtistResults(123 as unknown as Artist[])).toEqual([]);
  });

  it('should set songCount to null when missing', () => {
    const artists = [
      { displayName: 'Test Artist', path: 'test-artist' }
    ];
    const result = normalizeArtistResults(artists as unknown as Artist[]);
    expect(result).toEqual([
      { displayName: 'Test Artist', path: 'test-artist', songCount: null }
    ]);
  });
});
