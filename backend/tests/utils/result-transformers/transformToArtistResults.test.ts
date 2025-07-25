import { describe, it, expect } from '@jest/globals';
import { transformToArtistResults } from '../../../utils/result-transformers.js';

/**
 * Tests for transformToArtistResults
 */
describe('transformToArtistResults', () => {
  it('should transform results to artist objects', () => {
    const results = [
      { title: 'Oasis - Cifra Club', path: 'oasis', artist: 'Oasis' },
      { title: 'Radiohead - Cifra Club', path: 'radiohead', artist: 'Radiohead' }
    ];

    const transformed = transformToArtistResults(results as any);

    expect(transformed).toEqual([
      { displayName: 'Oasis', path: 'oasis', songCount: null },
      { displayName: 'Radiohead', path: 'radiohead', songCount: null }
    ]);
  });

  it('should filter out results with invalid paths', () => {
    const results = [
      { title: 'Oasis - Cifra Club', path: 'oasis', artist: 'Oasis' },
      { title: 'Invalid - Cifra Club', path: '', artist: 'Invalid' }
    ];

    const transformed = transformToArtistResults(results as any);

    expect(transformed).toEqual([
      { displayName: 'Oasis', path: 'oasis', songCount: null }
    ]);
  });
});
