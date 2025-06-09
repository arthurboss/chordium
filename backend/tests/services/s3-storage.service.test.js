import { jest } from '@jest/globals';
import { s3StorageService } from '../../services/s3-storage.service.js';

// Mock AWS SDK
const mockS3 = {
  getObject: jest.fn(),
  putObject: jest.fn(),
  listObjectsV2: jest.fn(),
  headBucket: jest.fn(),
};

jest.unstable_mockModule('aws-sdk', () => ({
  default: {
    S3: jest.fn(() => mockS3),
  },
}));

// Mock logger
jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('S3StorageService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service state
    s3StorageService.s3 = null;
    s3StorageService.enabled = null;
    s3StorageService.bucketName = null;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Initialization', () => {
    test('should disable S3 when AWS credentials are missing', () => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: undefined,
        AWS_SECRET_ACCESS_KEY: undefined,
      };

      const result = s3StorageService._checkEnabled();
      expect(result).toBe(false);
    });

    test('should enable S3 when AWS credentials are present', () => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        AWS_REGION: 'eu-central-1',
        S3_BUCKET_NAME: 'test-bucket',
      };

      const result = s3StorageService._checkEnabled();
      expect(result).toBe(true);
    });
  });

  describe('getArtistSongs', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should return cached songs when they exist', async () => {
      const mockSongs = [
        { title: 'Song 1', path: 'song-1', artist: 'Test Artist' },
        { title: 'Song 2', path: 'song-2', artist: 'Test Artist' },
      ];

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.resolve({
          Body: Buffer.from(JSON.stringify(mockSongs)),
        }),
      });

      const result = await s3StorageService.getArtistSongs('test-artist');

      expect(mockS3.getObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'artist-songs/test-artist.json',
      });
      expect(result).toEqual(mockSongs);
    });

    test('should return null when songs do not exist (NoSuchKey)', async () => {
      const error = new Error('Not found');
      error.code = 'NoSuchKey';
      
      mockS3.getObject.mockReturnValue({
        promise: () => Promise.reject(error),
      });

      const result = await s3StorageService.getArtistSongs('test-artist');
      expect(result).toBeNull();
    });

    test('should return null on other S3 errors', async () => {
      const error = new Error('Access denied');
      error.code = 'AccessDenied';
      
      mockS3.getObject.mockReturnValue({
        promise: () => Promise.reject(error),
      });

      const result = await s3StorageService.getArtistSongs('test-artist');
      expect(result).toBeNull();
    });

    test('should return null when S3 is disabled', async () => {
      process.env = { ...originalEnv };
      delete process.env.AWS_ACCESS_KEY_ID;

      const result = await s3StorageService.getArtistSongs('test-artist');
      expect(result).toBeNull();
      expect(mockS3.getObject).not.toHaveBeenCalled();
    });
  });

  describe('storeArtistSongs', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should store optimized songs (without URLs)', async () => {
      const inputSongs = [
        {
          title: 'Song 1',
          path: 'song-1',
          url: 'https://example.com/song-1',
          artist: 'Test Artist',
        },
        {
          title: 'Song 2',
          path: 'song-2',
          url: 'https://example.com/song-2',
          artist: 'Test Artist',
        },
      ];

      mockS3.putObject.mockReturnValue({
        promise: () => Promise.resolve(),
      });

      const result = await s3StorageService.storeArtistSongs('test-artist', inputSongs);

      expect(result).toBe(true);
      expect(mockS3.putObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'artist-songs/test-artist.json',
        Body: expect.stringContaining('"title": "Song 1"'),
        ContentType: 'application/json',
        Metadata: {
          artist: 'test-artist',
          'song-count': '2',
          'last-updated': expect.any(String),
        },
      });

      // Verify URLs were removed from stored data
      const storedBody = mockS3.putObject.mock.calls[0][0].Body;
      const storedSongs = JSON.parse(storedBody);
      expect(storedSongs[0]).not.toHaveProperty('url');
      expect(storedSongs[1]).not.toHaveProperty('url');
      expect(storedSongs[0]).toEqual({
        title: 'Song 1',
        path: 'song-1',
        artist: 'Test Artist',
      });
    });

    test('should return false on S3 error', async () => {
      mockS3.putObject.mockReturnValue({
        promise: () => Promise.reject(new Error('S3 error')),
      });

      const result = await s3StorageService.storeArtistSongs('test-artist', []);
      expect(result).toBe(false);
    });

    test('should return false when S3 is disabled', async () => {
      process.env = { ...originalEnv };
      delete process.env.AWS_ACCESS_KEY_ID;

      const result = await s3StorageService.storeArtistSongs('test-artist', []);
      expect(result).toBe(false);
      expect(mockS3.putObject).not.toHaveBeenCalled();
    });
  });

  describe('addSongToArtist', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should add song to existing list', async () => {
      const existingSongs = [
        { title: 'Existing Song', path: 'existing-song', artist: 'Test Artist' },
      ];
      const newSong = { title: 'New Song', path: 'new-song', artist: 'Test Artist' };

      // Mock getArtistSongs
      mockS3.getObject.mockReturnValue({
        promise: () => Promise.resolve({
          Body: Buffer.from(JSON.stringify(existingSongs)),
        }),
      });

      // Mock storeArtistSongs
      mockS3.putObject.mockReturnValue({
        promise: () => Promise.resolve(),
      });

      const result = await s3StorageService.addSongToArtist('test-artist', newSong);

      expect(result).toBe(true);
      expect(mockS3.putObject).toHaveBeenCalled();
      
      const storedBody = mockS3.putObject.mock.calls[0][0].Body;
      const storedSongs = JSON.parse(storedBody);
      expect(storedSongs).toHaveLength(2);
      expect(storedSongs[1]).toEqual(newSong);
    });

    test('should not add duplicate song (same path)', async () => {
      const existingSongs = [
        { title: 'Existing Song', path: 'existing-song', artist: 'Test Artist' },
      ];
      const duplicateSong = { title: 'Different Title', path: 'existing-song', artist: 'Test Artist' };

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.resolve({
          Body: Buffer.from(JSON.stringify(existingSongs)),
        }),
      });

      const result = await s3StorageService.addSongToArtist('test-artist', duplicateSong);

      expect(result).toBe(false);
      expect(mockS3.putObject).not.toHaveBeenCalled();
    });

    test('should not add duplicate song (same title)', async () => {
      const existingSongs = [
        { title: 'Existing Song', path: 'existing-song', artist: 'Test Artist' },
      ];
      const duplicateSong = { title: 'Existing Song', path: 'different-path', artist: 'Test Artist' };

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.resolve({
          Body: Buffer.from(JSON.stringify(existingSongs)),
        }),
      });

      const result = await s3StorageService.addSongToArtist('test-artist', duplicateSong);

      expect(result).toBe(false);
      expect(mockS3.putObject).not.toHaveBeenCalled();
    });
  });

  describe('removeSongFromArtist', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should remove song from existing list', async () => {
      const existingSongs = [
        { title: 'Song 1', path: 'song-1', artist: 'Test Artist' },
        { title: 'Song 2', path: 'song-2', artist: 'Test Artist' },
      ];

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.resolve({
          Body: Buffer.from(JSON.stringify(existingSongs)),
        }),
      });

      mockS3.putObject.mockReturnValue({
        promise: () => Promise.resolve(),
      });

      const result = await s3StorageService.removeSongFromArtist('test-artist', 'song-1');

      expect(result).toBe(true);
      expect(mockS3.putObject).toHaveBeenCalled();
      
      const storedBody = mockS3.putObject.mock.calls[0][0].Body;
      const storedSongs = JSON.parse(storedBody);
      expect(storedSongs).toHaveLength(1);
      expect(storedSongs[0].path).toBe('song-2');
    });

    test('should return false if song not found', async () => {
      const existingSongs = [
        { title: 'Song 1', path: 'song-1', artist: 'Test Artist' },
      ];

      mockS3.getObject.mockReturnValue({
        promise: () => Promise.resolve({
          Body: Buffer.from(JSON.stringify(existingSongs)),
        }),
      });

      const result = await s3StorageService.removeSongFromArtist('test-artist', 'non-existent');

      expect(result).toBe(false);
      expect(mockS3.putObject).not.toHaveBeenCalled();
    });

    test('should return false if no existing songs', async () => {
      const error = new Error('Not found');
      error.code = 'NoSuchKey';
      
      mockS3.getObject.mockReturnValue({
        promise: () => Promise.reject(error),
      });

      const result = await s3StorageService.removeSongFromArtist('test-artist', 'song-1');
      expect(result).toBe(false);
    });
  });

  describe('listArtists', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should return list of cached artists', async () => {
      mockS3.listObjectsV2.mockReturnValue({
        promise: () => Promise.resolve({
          Contents: [
            { Key: 'artist-songs/hillsong-united.json' },
            { Key: 'artist-songs/bethel-music.json' },
            { Key: 'artist-songs/elevation-worship.json' },
          ],
        }),
      });

      const result = await s3StorageService.listArtists();

      expect(mockS3.listObjectsV2).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Prefix: 'artist-songs/',
      });
      expect(result).toEqual(['hillsong-united', 'bethel-music', 'elevation-worship']);
    });

    test('should return empty array when no artists cached', async () => {
      mockS3.listObjectsV2.mockReturnValue({
        promise: () => Promise.resolve({ Contents: [] }),
      });

      const result = await s3StorageService.listArtists();
      expect(result).toEqual([]);
    });
  });

  describe('testConnection', () => {
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
      };
    });

    test('should return true when connection successful', async () => {
      mockS3.headBucket.mockReturnValue({
        promise: () => Promise.resolve(),
      });

      const result = await s3StorageService.testConnection();
      expect(result).toBe(true);
      expect(mockS3.headBucket).toHaveBeenCalledWith({ Bucket: 'test-bucket' });
    });

    test('should return false when connection fails', async () => {
      mockS3.headBucket.mockReturnValue({
        promise: () => Promise.reject(new Error('Connection failed')),
      });

      const result = await s3StorageService.testConnection();
      expect(result).toBe(false);
    });

    test('should return false when S3 is disabled', async () => {
      process.env = { ...originalEnv };
      delete process.env.AWS_ACCESS_KEY_ID;

      const result = await s3StorageService.testConnection();
      expect(result).toBe(false);
      expect(mockS3.headBucket).not.toHaveBeenCalled();
    });
  });
});
