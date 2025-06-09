import { jest } from '@jest/globals';

/**
 * Shared S3 test setup utilities
 * Provides common mocks, utilities, and test environment configuration
 */

// Mock S3 operations
export const mockS3 = {
  getObject: jest.fn(),
  putObject: jest.fn(),
  listObjectsV2: jest.fn(),
  headBucket: jest.fn(),
};

// Mock AWS SDK
export const mockAWS = {
  S3: jest.fn(() => mockS3),
};

// Mock logger
export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up module mocks
jest.unstable_mockModule('aws-sdk', () => ({
  default: mockAWS,
}));

jest.unstable_mockModule('../../../utils/logger.js', () => ({
  default: mockLogger,
}));

/**
 * Create a clean test environment with AWS credentials
 */
export function createTestEnvironment(customEnv = {}) {
  return {
    AWS_ACCESS_KEY_ID: 'test-access-key',
    AWS_SECRET_ACCESS_KEY: 'test-secret-key',
    AWS_REGION: 'us-east-1',
    S3_BUCKET_NAME: 'test-bucket',
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
 * Reset all mocks and service state
 */
export function resetMocks(s3StorageService) {
  jest.clearAllMocks();
  s3StorageService.s3 = null;
  s3StorageService.enabled = null;
  s3StorageService.bucketName = null;
}

/**
 * Set up S3 service with custom environment
 */
export function setupS3Service(s3StorageService, env) {
  s3StorageService.s3 = {
    ...mockS3,
  };
  s3StorageService.bucketName = env.S3_BUCKET_NAME || 'test-bucket';
  s3StorageService.enabled = true;
}
