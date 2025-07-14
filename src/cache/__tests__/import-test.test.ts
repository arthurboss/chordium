import { describe, it, expect } from 'vitest';
import { getTestSong } from '@/__tests__/shared/test-setup';

describe('Simple Import Test', () => {
  it('should import getTestSong function', () => {
    expect(typeof getTestSong).toBe('function');
    const song = getTestSong(0);
    expect(song).toBeDefined();
    expect(song.title).toBe('Wonderwall');
  });
});
