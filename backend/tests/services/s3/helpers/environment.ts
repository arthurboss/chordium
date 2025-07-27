/**
 * Test Environment Helpers
 * Utilities for creating test environments and configurations
 */

/**
 * Interface for test environment configuration
 * Extends ProcessEnv to be compatible with Node.js environment variables
 */
interface TestEnvironment extends NodeJS.ProcessEnv {
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  S3_BUCKET_NAME?: string;
  AWS_SESSION_TOKEN?: string;
}

/**
 * Create a test environment with AWS credentials
 */
export function createTestEnvironment(customEnv: Partial<TestEnvironment> = {}): TestEnvironment {
  return {
    AWS_ACCESS_KEY_ID: "test-access-key",
    AWS_SECRET_ACCESS_KEY: "test-secret-key",
    AWS_REGION: "eu-central-1",
    S3_BUCKET_NAME: "test-bucket",
    ...customEnv,
  };
}

/**
 * Create a disabled S3 environment (no credentials)
 */
export function createDisabledEnvironment(): TestEnvironment {
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
export function setupTestEnvironment(env: TestEnvironment): NodeJS.ProcessEnv {
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
export function restoreEnvironment(originalEnv: NodeJS.ProcessEnv): void {
  process.env = originalEnv;
}
