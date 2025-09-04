import { describe, it, expect } from 'vitest';
import { filterSongsByArtistAndTitle } from '../filterSongsByArtistAndTitle';
import type { Song } from '@chordium/types';

const mockSongs: Song[] = [
  { path: '/song1', title: 'Bohemian Rhapsody', artist: 'Queen' },
  { path: '/song2', title: 'We Will Rock You', artist: 'Queen' },
  { path: '/song3', title: 'Hotel California', artist: 'Eagles' },
  { path: '/song4', title: 'Sweet Child O Mine', artist: 'Guns N Roses' },
  { path: '/song5', title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
];

describe('filterSongsByArtistAndTitle', () => {
  it('should return all songs when no filters are provided', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, '', '');
    expect(result).toEqual(mockSongs);
  });

  it('should filter by artist name only', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, 'Queen', '');
    expect(result).toHaveLength(2);
    expect(result.map(s => s.title)).toEqual(['Bohemian Rhapsody', 'We Will Rock You']);
  });

  it('should filter by song title only', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, '', 'Hotel');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Hotel California');
  });

  it('should filter by both artist and title', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, 'Queen', 'Bohemian');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Bohemian Rhapsody');
  });

  it('should return empty array when no matches found', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, 'Beatles', 'Yesterday');
    expect(result).toHaveLength(0);
  });

  it('should handle case-insensitive filtering', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, 'queen', '');
    expect(result).toHaveLength(2);
    expect(result.map(s => s.title)).toEqual(['Bohemian Rhapsody', 'We Will Rock You']);
  });

  it('should handle partial matches', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, 'Guns', 'Sweet');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Sweet Child O Mine');
  });

  it('should return empty array when both filters are provided but no song matches both', () => {
    const result = filterSongsByArtistAndTitle(mockSongs, 'Queen', 'Hotel');
    expect(result).toHaveLength(0);
  });
});
