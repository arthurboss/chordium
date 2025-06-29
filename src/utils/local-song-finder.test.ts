import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findLocalSong } from './local-song-finder';
import { getSongs } from './unified-song-storage';
import { loadSampleSongs } from './sample-songs';
import { extractSongMetadata } from './metadata-extraction';

// Mock dependencies
vi.mock('./unified-song-storage');
vi.mock('./sample-songs');
vi.mock('./metadata-extraction');

const mockedGetSongs = vi.mocked(getSongs);
const mockedLoadSampleSongs = vi.mocked(loadSampleSongs);
const mockedExtractSongMetadata = vi.mocked(extractSongMetadata);

describe('findLocalSong', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find song by exact title match', async () => {
    // Arrange
    const mockSampleSongs = [
      { title: 'Hotel California', artist: 'Eagles', path: 'chord content...' }
    ];
    const mockMySongs = [
      { title: 'Hotel California', artist: 'Eagles', path: 'chord content...' }
    ];
    const mockMetadata = { songKey: 'Am', guitarTuning: 'Standard' };

    mockedLoadSampleSongs.mockResolvedValue(mockSampleSongs);
    mockedGetSongs.mockReturnValue(mockMySongs);
    mockedExtractSongMetadata.mockReturnValue(mockMetadata);

    // Act
    const result = await findLocalSong('eagles', 'hotel-california');

    // Assert
    expect(result).toEqual({
      title: 'Hotel California',
      artist: 'Eagles',
      path: 'chord content...',
      key: 'Am',
      tuning: 'Standard',
      capo: ''
    });
  });

  it('should find song by artist match', async () => {
    // Arrange
    const mockSongs = [
      { title: 'Wonderwall', artist: 'Oasis', path: 'chord content...' }
    ];
    const mockMetadata = { songKey: 'Em', guitarTuning: 'Standard' };

    mockedLoadSampleSongs.mockResolvedValue(mockSongs);
    mockedGetSongs.mockReturnValue(mockSongs);
    mockedExtractSongMetadata.mockReturnValue(mockMetadata);

    // Act
    const result = await findLocalSong('oasis', 'some-song');

    // Assert
    expect(result).toEqual({
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'chord content...',
      key: 'Em',
      tuning: 'Standard',
      capo: ''
    });
  });

  it('should handle capo information in tuning', async () => {
    // Arrange
    const mockSongs = [
      { title: 'Test Song', artist: 'Test Artist', path: 'chord content...' }
    ];
    const mockMetadata = { guitarTuning: 'Capo 2nd fret' };

    mockedLoadSampleSongs.mockResolvedValue(mockSongs);
    mockedGetSongs.mockReturnValue(mockSongs);
    mockedExtractSongMetadata.mockReturnValue(mockMetadata);

    // Act
    const result = await findLocalSong('test-artist', 'test-song');

    // Assert
    expect(result?.capo).toBe('Capo 2nd fret');
    expect(result?.tuning).toBe('Capo 2nd fret');
  });

  it('should return null when song not found', async () => {
    // Arrange
    mockedLoadSampleSongs.mockResolvedValue([]);
    mockedGetSongs.mockReturnValue([]);

    // Act
    const result = await findLocalSong('unknown-artist', 'unknown-song');

    // Assert
    expect(result).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    mockedLoadSampleSongs.mockRejectedValue(new Error('Load failed'));

    // Act
    const result = await findLocalSong('artist', 'song');

    // Assert
    expect(result).toBeNull();
  });

  it('should decode URI parameters correctly', async () => {
    // Arrange
    const mockSongs = [
      { title: 'Song With Spaces', artist: 'Artist With Spaces', path: 'content...' }
    ];
    mockedLoadSampleSongs.mockResolvedValue(mockSongs);
    mockedGetSongs.mockReturnValue(mockSongs);
    mockedExtractSongMetadata.mockReturnValue({});

    // Act
    const result = await findLocalSong('artist-with-spaces', 'song-with-spaces');

    // Assert
    expect(result).toBeTruthy();
    expect(result?.title).toBe('Song With Spaces');
  });
});
