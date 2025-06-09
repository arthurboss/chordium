import { jest } from '@jest/globals';
import { mockS3, mockLogger, createTestEnvironment, resetMocks, setupS3Service } from './setup.js';

// Import after mocking
const { s3StorageService } = await import('../../../services/s3-storage.service.js');

/**
 * S3 List Operations Tests
 * Tests artist listing, bucket operations, and key parsing
 */
describe('S3 List Operations', () => {
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

  test('should correctly parse artist names from S3 keys', async () => {
    const mockS3Objects = {
      Contents: [
        { Key: 'artist-songs/hillsong-united.json' },
        { Key: 'artist-songs/bethel-music.json' },
        { Key: 'artist-songs/elevation-worship.json' },
        { Key: 'artist-songs/very-long-artist-name-with-hyphens.json' },
      ],
    };

    setupS3Service(s3StorageService, createTestEnvironment());
    s3StorageService.s3.listObjectsV2 = jest.fn().mockReturnValue({
      promise: () => Promise.resolve(mockS3Objects),
    });

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
    setupS3Service(s3StorageService, createTestEnvironment());
    s3StorageService.s3.listObjectsV2 = jest.fn().mockReturnValue({
      promise: () => Promise.resolve({ Contents: [] }),
    });

    const result = await s3StorageService.listArtists();

    expect(result).toEqual([]);
    expect(mockLogger.info).toHaveBeenCalledWith('Found 0 artists in S3 storage');
  });
});
