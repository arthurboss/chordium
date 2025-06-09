import { jest } from '@jest/globals';
import { mockS3, mockLogger, createTestEnvironment, createDisabledEnvironment, resetMocks } from './setup.js';

// Import after mocking
const { s3StorageService } = await import('../../../services/s3-storage.service.js');

/**
 * S3 Connection Tests
 * Tests connection validation, bucket accessibility, and service availability
 */
describe('S3 Connection Testing', () => {
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
    process.env = { 
      ...originalEnv,
      ...createDisabledEnvironment(),
    };

    const result = await s3StorageService.testConnection();

    expect(result).toBe(false);
    expect(mockS3.headBucket).not.toHaveBeenCalled();
  });
});
