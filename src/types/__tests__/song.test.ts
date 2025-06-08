import { describe, it, expect } from 'vitest';
import type { Song } from '../song';

describe('Song Interface', () => {
  it('should have all required properties', () => {
    const song: Song = {
      title: 'Wonderwall',
      path: 'oasis/wonderwall',
      artist: 'Oasis'
    };

    expect(song.title).toBe('Wonderwall');
    expect(song.path).toBe('oasis/wonderwall');
    expect(song.artist).toBe('Oasis');
  });

  it('should enforce artist as required property', () => {
    // This test ensures TypeScript compilation fails if artist is missing
    // @ts-expect-error - artist is required
    const invalidSong: Song = {
      title: 'Test Song',
      path: 'test/song'
      // Missing artist property
    };

    expect(invalidSong).toBeDefined();
  });

  it('should enforce path as required property', () => {
    // @ts-expect-error - path is required
    const invalidSong: Song = {
      title: 'Test Song',
      artist: 'Test Artist'
      // Missing path property
    };

    expect(invalidSong).toBeDefined();
  });

  it('should enforce title as required property', () => {
    // @ts-expect-error - title is required
    const invalidSong: Song = {
      path: 'test/song',
      artist: 'Test Artist'
      // Missing title property
    };

    expect(invalidSong).toBeDefined();
  });
});
