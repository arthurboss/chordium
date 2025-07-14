/**
 * S3 Service Test Helpers
 * Utilities for setting up and managing S3 service state in tests
 */

/**
 * Reset S3 service state to initial conditions
 */
export function resetS3ServiceState(s3StorageService) {
  s3StorageService.s3 = null;
  s3StorageService.enabled = null;
  s3StorageService.bucketName = null;
}

/**
 * Set up S3 service with custom configuration
 */
export function setupS3Service(s3StorageService, config = {}) {
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
export function createMockS3Response(data = {}) {
  return Promise.resolve(data);
}

/**
 * Create mock S3 error
 */
export function createMockS3Error(errorType = "NoSuchKey", message = "Test error") {
  const error = new Error(message);
  error.name = errorType;
  return error;
}
