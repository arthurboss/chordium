import { describe, it, expect } from '@jest/globals';
import { transformToSongResults } from '../../../utils/result-transformers.js';

/**
 * Tests for transformToSongResults
 */
describe('transformToSongResults', () => {
  it('should transform results to song objects with artist information', () => {
    const results = [
      { 
        title: 'Wonderwall - Oasis - Cifra Club', 
        path: 'oasis/wonderwall',
        artist: 'Oasis'
      },
      { 
        title: 'Creep - Radiohead - Cifra Club', 
        path: 'radiohead/creep',
        artist: 'Radiohead'
      }
    ];

    const transformed = transformToSongResults(results as any);

    expect(transformed).toEqual([
      { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' },
      { title: 'Creep', path: 'radiohead/creep', artist: 'Radiohead' }
    ]);
  });

  it('should preserve path field in final API response', () => {
    const results = [
      { 
        title: 'Wonderwall - Oasis - Cifra Club', 
        path: 'oasis/wonderwall',
        artist: 'Oasis'
      }
    ];

    const transformed = transformToSongResults(results as any);

    expect(transformed[0]).toHaveProperty('path');
    expect(transformed).toEqual([
      { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' }
    ]);
  });

  it('should handle songs without artist information', () => {
    const results = [
      { 
        title: 'Wonderwall - Cifra Club', 
        path: 'oasis/wonderwall',
        artist: ''
      }
    ];

    const transformed = transformToSongResults(results as any);

    expect(transformed).toEqual([
      { title: 'Wonderwall', path: 'oasis/wonderwall', artist: 'Oasis' }
    ]);
  });
});
