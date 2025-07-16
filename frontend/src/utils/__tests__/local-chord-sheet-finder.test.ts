import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findLocalSong } from '../local-chord-sheet-finder';
import { getMyChordSheetsAsSongs } from '../chord-sheet-storage';
import { unifiedChordSheetCache } from '../../cache/implementations/unified-chord-sheet-cache';
import { extractSongMetadata } from '../metadata-extraction';
import { GUITAR_TUNINGS } from '../../types/guitarTuning';

// Mock dependencies
vi.mock('../chord-sheet-storage');
vi.mock('../../cache/implementations/unified-chord-sheet-cache');
vi.mock('../metadata-extraction');

const mockedGetMyChordSheetsAsSongs = vi.mocked(getMyChordSheetsAsSongs);
const mockedGetCachedChordSheet = vi.mocked(unifiedChordSheetCache.getCachedChordSheet);
const mockedExtractSongMetadata = vi.mocked(extractSongMetadata);

describe('findLocalSong', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find chord sheet by exact title match', async () => {
    // Arrange
    const mockMySongs = [
      { title: 'Hotel California', artist: 'Eagles', path: 'chord content...' }
    ];
    const mockCachedChordSheet = { 
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: 'chord content for song...',
      songKey: 'Am',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };
    const mockMetadata = { songKey: 'Am', guitarTuning: 'Standard' };

    mockedGetMyChordSheetsAsSongs.mockReturnValue(mockMySongs);
    mockedGetCachedChordSheet.mockReturnValue(mockCachedChordSheet);
    mockedExtractSongMetadata.mockReturnValue(mockMetadata);

    // Act
    const result = await findLocalSong('eagles', 'hotel-california');

    // Assert
    expect(result).toEqual({
      title: 'Hotel California',
      artist: 'Eagles',
      path: 'chord content for song...',
      key: 'Am',
      tuning: 'Standard',
      capo: ''
    });
  });

  it('should find chord sheet by artist match', async () => {
    // Arrange
    const mockSongs = [
      { title: 'Wonderwall', artist: 'Oasis', path: 'chord content...' }
    ];
    const mockCachedChordSheet = { 
      title: 'Wonderwall',
      artist: 'Oasis',
      songChords: 'chord content for oasis song...',
      songKey: 'Em',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };
    const mockMetadata = { songKey: 'Em', guitarTuning: 'Standard' };

    mockedGetMyChordSheetsAsSongs.mockReturnValue(mockSongs);
    mockedGetCachedChordSheet.mockReturnValue(mockCachedChordSheet);
    mockedExtractSongMetadata.mockReturnValue(mockMetadata);

    // Act
    const result = await findLocalSong('oasis', 'some-song');

    // Assert
    expect(result).toEqual({
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'chord content for oasis song...',
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
    const mockCachedChordSheet = { 
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: 'chord content with capo...',
      songKey: '',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 2
    };
    const mockMetadata = { guitarTuning: 'Capo 2nd fret' };

    mockedGetMyChordSheetsAsSongs.mockReturnValue(mockSongs);
    mockedGetCachedChordSheet.mockReturnValue(mockCachedChordSheet);
    mockedExtractSongMetadata.mockReturnValue(mockMetadata);

    // Act
    const result = await findLocalSong('test-artist', 'test-song');

    // Assert
    expect(result?.capo).toBe('Capo 2nd fret');
    expect(result?.tuning).toBe('Capo 2nd fret');
  });

  it('should return null when song not found in my chord sheets', async () => {
    // Arrange
    mockedGetMyChordSheetsAsSongs.mockReturnValue([]);

    // Act
    const result = await findLocalSong('unknown-artist', 'unknown-song');

    // Assert
    expect(result).toBeNull();
  });

  it('should return null when cached chord sheet not found', async () => {
    // Arrange
    const mockSongs = [
      { title: 'Test Song', artist: 'Test Artist', path: 'chord content...' }
    ];
    mockedGetMyChordSheetsAsSongs.mockReturnValue(mockSongs);
    mockedGetCachedChordSheet.mockReturnValue(null);

    // Act
    const result = await findLocalSong('test-artist', 'test-song');

    // Assert
    expect(result).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    mockedGetMyChordSheetsAsSongs.mockImplementation(() => {
      throw new Error('Storage failed');
    });

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
    const mockCachedChordSheet = { 
      title: 'Song With Spaces',
      artist: 'Artist With Spaces',
      songChords: 'content with spaces...',
      songKey: '',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };
    mockedGetMyChordSheetsAsSongs.mockReturnValue(mockSongs);
    mockedGetCachedChordSheet.mockReturnValue(mockCachedChordSheet);
    mockedExtractSongMetadata.mockReturnValue({});

    // Act
    const result = await findLocalSong('artist-with-spaces', 'song-with-spaces');

    // Assert
    expect(result).toBeTruthy();
    expect(result?.title).toBe('Song With Spaces');
  });
});
