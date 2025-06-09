import { jest } from '@jest/globals';
import { mockS3, mockLogger, createTestEnvironment, resetMocks } from './setup.js';

// Import after mocking
const { s3StorageService } = await import('../../../services/s3-storage.service.js');

/**
 * S3 Error Handling Tests
 * Tests various S3 operation failures and error scenarios
 */
describe('S3 Error Handling', () => {
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
