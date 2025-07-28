import { describe, it, expect } from '@jest/globals';
import { normalizeArtist } from '../../../utils/response-normalizers.js';

describe('normalizeArtist', () => {
  it('should normalize a single artist object', () => {
    const artist = { 
      id: 'uuid-123', 
      displayName: 'Oasis', 
      path: 'oasis', 
      songCount: 25 
    };
    const result = normalizeArtist(artist as any, 'supabase');
    expect(result).toEqual({
      displayName: 'Oasis',
      path: 'oasis',
      songCount: 25
    });
  });

  it('should return null for invalid artist', () => {
    const invalidArtist = { displayName: '', path: 'invalid' };
    const result = normalizeArtist(invalidArtist as any);
    expect(result).toBeNull();
  });

  it('should handle null input', () => {
    expect(normalizeArtist(null as any)).toBeNull();
    expect(normalizeArtist(undefined as any)).toBeNull();
  });
});
