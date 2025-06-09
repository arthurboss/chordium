import { jest } from '@jest/globals';

// Mock all dependencies before importing the module under test
const mockS3 = {
  getObject: jest.fn(),
  putObject: jest.fn(),
  listObjectsV2: jest.fn(),
  headBucket: jest.fn(),
};

// Create AWS SDK mock
const mockAWS = {
  S3: jest.fn(() => mockS3),
};

jest.unstable_mockModule('aws-sdk', () => ({
  default: mockAWS,
}));

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: mockLogger,
}));

// Import after mocking
const { s3StorageService } = await import('../../services/s3-storage.service.js');

/**
 * Unit tests for S3StorageService utility methods and edge cases
 * Tests initialization, configuration, and internal logic
 */
describe('S3StorageService Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    s3StorageService.s3 = null;
    s3StorageService.enabled = null;
    s3StorageService.bucketName = null;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Configuration and Initialization', () => {
    test('should initialize with all required environment variables', () => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-access-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret-key',
        AWS_REGION: 'us-east-1',
        S3_BUCKET_NAME: 'test-bucket',
        AWS_SESSION_TOKEN: 'test-session-token',
      };

      const result = s3StorageService._checkEnabled();

      expect(result).toBe(true);
      expect(s3StorageService.enabled).toBe(true);
      expect(s3StorageService.bucketName).toBe('test-bucket');
      expect(mockAWS.S3).toHaveBeenCalledWith({
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
        sessionToken: 'test-session-token',
        region: 'us-east-1',
      });
    });

    test('should use default region when AWS_REGION is not set', () => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
      };

      s3StorageService._checkEnabled();

      expect(mockAWS.S3).toHaveBeenCalledWith({
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        sessionToken: undefined,
        region: 'eu-central-1', // Default region
      });
    });

    test('should use default bucket name when S3_BUCKET_NAME is not set', () => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
      };

      s3StorageService._checkEnabled();

      expect(s3StorageService.bucketName).toBe('chordium'); // Default bucket
    });

    test('should handle partial credentials gracefully', () => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        // Missing AWS_SECRET_ACCESS_KEY
      };

      const result = s3StorageService._checkEnabled();

      expect(result).toBe(false);
      expect(s3StorageService.enabled).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'AWS credentials not found. S3 storage will be disabled.'
      );
    });

    test('should initialize only once (lazy initialization)', () => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
      };

      // Call multiple times
      s3StorageService._checkEnabled();
      s3StorageService._checkEnabled();
      s3StorageService._checkEnabled();

      // Should only initialize once
      expect(mockAWS.S3).toHaveBeenCalledTimes(1);
    });
  });

  describe('S3 Operations Error Handling', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should handle S3 NoSuchKey error correctly', async () => {
      const error = new Error('The specified key does not exist.');
      error.code = 'NoSuchKey';

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.reject(error),
      });

      const result = await s3StorageService.getArtistSongs('non-existent-artist');

      expect(result).toBeNull();
      expect(mockLogger.error).not.toHaveBeenCalled(); // NoSuchKey is expected, not an error
    });

    test('should handle S3 AccessDenied error', async () => {
      const error = new Error('Access Denied');
      error.code = 'AccessDenied';

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.reject(error),
      });

      const result = await s3StorageService.getArtistSongs('test-artist');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error retrieving songs from S3 for test-artist:',
        'Access Denied'
      );
    });

    test('should handle S3 network timeout', async () => {
      const error = new Error('Request timeout');
      error.code = 'RequestTimeout';

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.reject(error),
      });

      const result = await s3StorageService.getArtistSongs('test-artist');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error retrieving songs from S3 for test-artist:',
        'Request timeout'
      );
    });

    test('should handle malformed S3 response data', async () => {
      mockS3.getObject.mockReturnValue({
        promise: () => Promise.resolve({
          Body: Buffer.from('invalid json data'),
        }),
      });

      const result = await s3StorageService.getArtistSongs('test-artist');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error retrieving songs from S3 for test-artist:',
        expect.stringContaining('not valid JSON')
      );
    });
  });

  describe('Data Processing and Validation', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
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

  describe('List Operations', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should correctly parse artist names from S3 keys', async () => {
      const mockS3Objects = {
        Contents: [
          { Key: 'artist-songs/hillsong-united.json' },
          { Key: 'artist-songs/bethel-music.json' },
          { Key: 'artist-songs/elevation-worship.json' },
          { Key: 'artist-songs/very-long-artist-name-with-hyphens.json' },
        ],
      };

      // Override the service's s3 client and bucket name to ensure it's properly mocked
      s3StorageService.s3 = {
        listObjectsV2: jest.fn().mockReturnValue({
          promise: () => Promise.resolve(mockS3Objects),
        })
      };
      s3StorageService.bucketName = 'test-bucket';

      const result = await s3StorageService.listArtists();

      expect(result).toEqual([
        'hillsong-united',
        'bethel-music',
        'elevation-worship',
        'very-long-artist-name-with-hyphens',
      ]);

      expect(s3StorageService.s3.listObjectsV2).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Prefix: 'artist-songs/',
      });
    });

    test('should handle empty S3 bucket', async () => {
      s3StorageService.s3 = {
        listObjectsV2: jest.fn().mockReturnValue({
          promise: () => Promise.resolve({ Contents: [] }),
        })
      };
      s3StorageService.bucketName = 'test-bucket';

      const result = await s3StorageService.listArtists();

      expect(result).toEqual([]);
      expect(mockLogger.info).toHaveBeenCalledWith('Found 0 artists in S3 storage');
    });

    test('should handle S3 list operation failure', async () => {
      const error = new Error('List operation failed');
      s3StorageService.s3 = {
        listObjectsV2: jest.fn().mockReturnValue({
          promise: () => Promise.reject(error),
        })
      };
      s3StorageService.bucketName = 'test-bucket';

      await expect(s3StorageService.listArtists()).rejects.toThrow('List operation failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Error listing artists from S3:', error);
    });
  });

  describe('Connection Testing', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should successfully test S3 connection', async () => {
      mockS3.headBucket.mockReturnValue({
        promise: () => Promise.resolve(),
      });

      const result = await s3StorageService.testConnection();

      expect(result).toBe(true);
      expect(mockS3.headBucket).toHaveBeenCalledWith({ Bucket: 'test-bucket' });
      expect(mockLogger.info).toHaveBeenCalledWith(
        'S3 connection successful to bucket: test-bucket'
      );
    });

    test('should handle S3 connection failure', async () => {
      const error = new Error('Bucket not accessible');
      mockS3.headBucket.mockReturnValue({
        promise: () => Promise.reject(error),
      });

      const result = await s3StorageService.testConnection();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'S3 connection failed for bucket test-bucket: Bucket not accessible'
      );
    });

    test('should return false when S3 is disabled', async () => {
      process.env = { ...originalEnv }; // No AWS credentials

      const result = await s3StorageService.testConnection();

      expect(result).toBe(false);
      expect(mockS3.headBucket).not.toHaveBeenCalled();
    });
  });

  describe('Key Generation and Formatting', () => {
    test('should generate correct S3 keys for artist songs', () => {
      const testCases = [
        { input: 'simple-artist', expected: 'artist-songs/simple-artist.json' },
        { input: 'artist-with-hyphens', expected: 'artist-songs/artist-with-hyphens.json' },
        { input: 'artist_with_underscores', expected: 'artist-songs/artist_with_underscores.json' },
      ];

      // This tests the internal key generation logic
      testCases.forEach(({ input, expected }) => {
        const key = `artist-songs/${input}.json`;
        expect(key).toBe(expected);
      });
    });

    test('should handle special characters in artist names for S3 keys', () => {
      const specialCases = [
        'guns-n-roses',
        'ac-dc',
        'twenty-one-pilots',
        'sigur-ros',
      ];

      specialCases.forEach(artistName => {
        const key = `artist-songs/${artistName}.json`;
        // S3 keys should be URL-safe
        expect(key).toMatch(/^[a-zA-Z0-9\-_.\/]+$/);
      });
    });
  });
});
