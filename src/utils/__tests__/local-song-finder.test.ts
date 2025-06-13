import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findLocalSong } from '../local-song-finder';
import { Song } from '@/types/song';
import { getSongs, migrateSongsFromOldStorage } from '../unified-song-storage';
import { extractSongMetadata } from '../metadata-extraction';

// Mock dependencies with proper function definitions
vi.mock('../unified-song-storage', () => ({
  getSongs: vi.fn(),
  migrateSongsFromOldStorage: vi.fn()
}));

vi.mock('../metadata-extraction', () => ({
  extractSongMetadata: vi.fn()
}));

const mockGetSongs = vi.mocked(getSongs);
const mockMigrateSongsFromOldStorage = vi.mocked(migrateSongsFromOldStorage);
const mockExtractSongMetadata = vi.mocked(extractSongMetadata);

describe('findLocalSong', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMigrateSongsFromOldStorage.mockImplementation(() => {});
    mockExtractSongMetadata.mockReturnValue({
      songKey: 'C',
      guitarTuning: 'Standard'
    });
  });

  const mockSongs: Song[] = [
    {
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'chord content for wonderwall',
      key: 'Em',
      tuning: 'Standard',
      capo: '2'
    },
    {
      title: 'Hotel California',
      artist: 'Eagles',
      path: 'chord content for hotel california',
      key: 'Bm',
      tuning: 'Standard'
    }
  ];

  it('should find song by exact title match', async () => {
    mockGetSongs.mockReturnValue(mockSongs);

    const result = await findLocalSong('oasis', 'wonderwall');

    expect(mockMigrateSongsFromOldStorage).toHaveBeenCalled();
    expect(result).toEqual({
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'chord content for wonderwall',
      key: 'C',
      tuning: 'Standard',
      capo: ''
    });
  });

  it('should find song by artist match', async () => {
    mockGetSongs.mockReturnValue(mockSongs);

    const result = await findLocalSong('eagles', 'hotel-california');

    expect(result).toEqual({
      title: 'Hotel California',
      artist: 'Eagles',
      path: 'chord content for hotel california',
      key: 'C',
      tuning: 'Standard',
      capo: ''
    });
  });

  it('should handle URL-encoded parameters with hyphens', async () => {
    mockGetSongs.mockReturnValue(mockSongs);

    const result = await findLocalSong('the-eagles', 'hotel-california');

    expect(result).toEqual({
      title: 'Hotel California',
      artist: 'Eagles',
      path: 'chord content for hotel california',
      key: 'C',
      tuning: 'Standard',
      capo: ''
    });
  });

  it('should return null when song not found', async () => {
    mockGetSongs.mockReturnValue(mockSongs);

    const result = await findLocalSong('metallica', 'enter-sandman');

    expect(result).toBeNull();
  });

  it('should handle empty songs list', async () => {
    mockGetSongs.mockReturnValue([]);

    const result = await findLocalSong('oasis', 'wonderwall');

    expect(result).toBeNull();
  });

  it('should handle songs without artist gracefully', async () => {
    const songsWithoutArtist: Song[] = [
      {
        title: 'Untitled Song',
        path: 'some content',
        artist: undefined
      }
    ];
    mockGetSongs.mockReturnValue(songsWithoutArtist);

    const result = await findLocalSong('unknown', 'untitled-song');

    expect(result).toEqual({
      title: 'Untitled Song',
      artist: '',
      path: 'some content',
      key: 'C',
      tuning: 'Standard',
      capo: ''
    });
  });

  it('should extract capo information from guitar tuning', async () => {
    mockExtractSongMetadata.mockReturnValue({
      songKey: 'G',
      guitarTuning: 'Standard, Capo 3'
    });
    mockGetSongs.mockReturnValue(mockSongs);

    const result = await findLocalSong('oasis', 'wonderwall');

    expect(result?.capo).toBe('Standard, Capo 3');
  });

  it('should handle errors gracefully', async () => {
    mockGetSongs.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = await findLocalSong('oasis', 'wonderwall');

    expect(result).toBeNull();
  });
});
