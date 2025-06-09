import { jest } from '@jest/globals';
import { mockS3, mockLogger, createTestEnvironment, resetMocks } from './setup.js';

// Import after mocking
const { s3StorageService } = await import('../../../services/s3-storage.service.js');

/**
 * S3 Data Processing Tests
 * Tests data transformation, validation, and metadata handling
 */
describe('S3 Data Processing', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetMocks(s3StorageService);
    process.env = {
      ...originalEnv,
      ...createTestEnvironment(),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should correctly remove URLs from songs before storage', async () => {
    const inputSongs = [
      {
        title: 'Song 1',
        path: 'song-1',
        url: 'https://example.com/song-1',
        artist: 'Artist',
        extraField: 'should-be-preserved',
      },
      {
        title: 'Song 2',
        path: 'song-2',
        url: 'https://example.com/song-2',
        artist: 'Artist',
      },
    ];

    mockS3.putObject.mockReturnValue({
      promise: () => Promise.resolve(),
    });

    await s3StorageService.storeArtistSongs('test-artist', inputSongs);

    const putObjectCall = mockS3.putObject.mock.calls[0][0];
    const storedData = JSON.parse(putObjectCall.Body);

    // Verify URLs were removed
    storedData.forEach(song => {
      expect(song).not.toHaveProperty('url');
    });

    // Verify other fields were preserved (only title, path, artist are kept by the service)
    expect(storedData[0]).toEqual({
      title: 'Song 1',
      path: 'song-1',
      artist: 'Artist',
      // Note: extraField is NOT preserved - service only keeps title, path, artist
    });
  });

  test('should generate correct S3 metadata', async () => {
    const songs = [
      { title: 'Song 1', path: 'song-1', artist: 'Artist' },
      { title: 'Song 2', path: 'song-2', artist: 'Artist' },
    ];

    mockS3.putObject.mockReturnValue({
      promise: () => Promise.resolve(),
    });

    await s3StorageService.storeArtistSongs('metadata-test', songs);

    const putObjectCall = mockS3.putObject.mock.calls[0][0];

    expect(putObjectCall.Metadata).toEqual({
      artist: 'metadata-test',
      'song-count': '2',
      'last-updated': expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/), // ISO date
    });
  });

  test('should handle empty song arrays', async () => {
    mockS3.putObject.mockReturnValue({
      promise: () => Promise.resolve(),
    });

    const result = await s3StorageService.storeArtistSongs('empty-artist', []);

    expect(result).toBe(true);

    const putObjectCall = mockS3.putObject.mock.calls[0][0];
    expect(JSON.parse(putObjectCall.Body)).toEqual([]);
    expect(putObjectCall.Metadata['song-count']).toBe('0');
  });

  test('should validate song structure before adding', async () => {
    const validSong = { title: 'Valid Song', path: 'valid-song', artist: 'Artist' };
    const existingSongs = [validSong];

    mockS3.getObject.mockReturnValue({
      promise: () => Promise.resolve({
        Body: Buffer.from(JSON.stringify(existingSongs)),
      }),
    });

    mockS3.putObject.mockReturnValue({
      promise: () => Promise.resolve(),
    });

    // Test adding valid song
    const newValidSong = { title: 'New Song', path: 'new-song', artist: 'Artist' };
    const result = await s3StorageService.addSongToArtist('test-artist', newValidSong);

    expect(result).toBe(true);
    expect(mockS3.putObject).toHaveBeenCalled();
  });
});
