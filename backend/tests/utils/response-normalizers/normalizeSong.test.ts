import { describe, it, expect } from '@jest/globals';
import { normalizeSong } from '../../../utils/response-normalizers.js';

describe('normalizeSong', () => {
  it('should normalize a single song object', () => {
    const song = { 
      title: 'Wonderwall', 
      artist: 'Oasis', 
      path: 'oasis/wonderwall',
      displayName: 'Wonderwall' 
    };
    const result = normalizeSong(song as any);
    expect(result).toEqual({
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'oasis/wonderwall',
      displayName: 'Wonderwall'
    });
  });

  it('should use title as displayName when displayName is missing', () => {
    const song = {
      title: 'Creep',
      artist: 'Radiohead',
      path: 'radiohead/creep'
    };
    const result = normalizeSong(song as any);
    expect(result).toEqual({
      title: 'Creep',
      artist: 'Radiohead',
      path: 'radiohead/creep',
      displayName: 'Creep'
    });
  });

  it('should return null for invalid song', () => {
    const invalidSong = { title: '', artist: 'Artist', path: 'invalid' };
    const result = normalizeSong(invalidSong as any);
    expect(result).toBeNull();
  });

  it('should handle null input', () => {
    expect(normalizeSong(null as any)).toBeNull();
    expect(normalizeSong(undefined as any)).toBeNull();
  });
});
