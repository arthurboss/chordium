/**
 * Test Environment Helpers
 * Utilities for creating test environments and configurations
 */

/**
 * Create a test environment with AWS credentials
 */
export function createTestEnvironment(customEnv = {}) {
  return {
    AWS_ACCESS_KEY_ID: "test-access-key",
    AWS_SECRET_ACCESS_KEY: "test-secret-key",
    AWS_REGION: "us-east-1",
    S3_BUCKET_NAME: "test-bucket",
    ...customEnv,
  };
}

/**
 * Create a disabled S3 environment (no credentials)
 */
export function createDisabledEnvironment() {
  return {
    AWS_ACCESS_KEY_ID: undefined,
    AWS_SECRET_ACCESS_KEY: undefined,
    AWS_REGION: undefined,
    S3_BUCKET_NAME: undefined,
  };
}

/**
 * Set up environment variables for test
 */
export function setupTestEnvironment(env) {
  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    ...env,
  };
  return originalEnv;
}

/**
 * Restore original environment
 */
export function restoreEnvironment(originalEnv) {
  process.env = originalEnv;
}
