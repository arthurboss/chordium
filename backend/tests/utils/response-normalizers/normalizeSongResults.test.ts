import { describe, it, expect } from '@jest/globals';
import { normalizeSongResults } from '../../../utils/response-normalizers.js';

/**
 * Tests for normalizeSongResults function
 */

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

    const result = normalizeSongResults(songs as any);

    expect(result).toEqual([
      { title: 'Wonderwall', artist: 'Oasis', path: 'oasis/wonderwall', displayName: 'Wonderwall' },
      { title: 'Creep', artist: 'Radiohead', path: 'radiohead/creep', displayName: 'Creep' }
    ]);
  });

  it('should use title as displayName when displayName is missing', () => {
    const songs = [
      { title: 'Wonderwall', artist: 'Oasis', path: 'oasis/wonderwall' }
    ];

    const result = normalizeSongResults(songs as any);

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

    const result = normalizeSongResults(invalidSongs as any);

    expect(result).toEqual([
      { title: 'Valid Song', artist: 'Valid Artist', path: 'valid/song', displayName: 'Valid Song' },
      { title: 'Another Valid', artist: 'Artist', path: 'another/valid', displayName: 'Another' }
    ]);
  });

  it('should handle non-array input', () => {
    expect(normalizeSongResults(null as any)).toEqual([]);
    expect(normalizeSongResults(undefined as any)).toEqual([]);
    expect(normalizeSongResults('not-array' as any)).toEqual([]);
  });
});
