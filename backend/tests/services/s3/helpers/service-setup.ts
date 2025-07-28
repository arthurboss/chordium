/**
 * S3 Service Test Helpers
 * Utilities for setting up and managing S3 service state in tests
 */

/**
 * Interface for S3 storage service (minimal interface for testing)
 */
interface S3StorageService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  s3: any;
  enabled: boolean | null;
  bucketName: string | null;
}

/**
 * Interface for S3 service configuration
 */
interface S3ServiceConfig {
  bucketName?: string;
  enabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockS3Client?: any;
}

/**
 * Reset S3 service state to initial conditions
 */
export function resetS3ServiceState(s3StorageService: S3StorageService): void {
  s3StorageService.s3 = null;
  s3StorageService.enabled = null;
  s3StorageService.bucketName = null;
}

/**
 * Set up S3 service with custom configuration
 */
export function setupS3Service(s3StorageService: S3StorageService, config: S3ServiceConfig = {}): void {
  const defaultConfig = {
    bucketName: "test-bucket",
    enabled: true,
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  s3StorageService.bucketName = finalConfig.bucketName;
  s3StorageService.enabled = finalConfig.enabled;
  
  if (finalConfig.mockS3Client) {
    s3StorageService.s3 = finalConfig.mockS3Client;
  }
}

/**
 * Create mock S3 response for successful operations
 */
export function createMockS3Response<T = Record<string, unknown>>(data: T = {} as T): Promise<T> {
  return Promise.resolve(data);
}

/**
 * Create mock S3 error
 */
export function createMockS3Error(errorType = "NoSuchKey", message = "Test error"): Error {
  const error = new Error(message);
  error.name = errorType;
  return error;
}
