import { jest } from "@jest/globals";

/**
 * Shared S3 test setup utilities
 * Provides common mocks, utilities, and test environment configuration
 */

// Mock S3 operations for AWS SDK v3
export const mockS3Send = jest.fn();

// Mock AWS SDK v3 Client
export const mockS3Client = jest.fn(() => ({
  send: mockS3Send,
}));

// Mock AWS SDK v3 Commands
export const mockGetObjectCommand = jest.fn();
export const mockPutObjectCommand = jest.fn();
export const mockListObjectsV2Command = jest.fn();
export const mockHeadBucketCommand = jest.fn();

// Backward compatibility mock for AWS SDK v2 style tests
export const mockS3 = {
  send: mockS3Send,
  getObject: jest.fn(),
  putObject: jest.fn(),
  listObjectsV2: jest.fn(),
  headBucket: jest.fn(),
};

// Mock AWS for backward compatibility
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
jest.unstable_mockModule("@aws-sdk/client-s3", () => ({
  S3Client: mockS3Client,
  GetObjectCommand: mockGetObjectCommand,
  PutObjectCommand: mockPutObjectCommand,
  ListObjectsV2Command: mockListObjectsV2Command,
  HeadBucketCommand: mockHeadBucketCommand,
}));

jest.unstable_mockModule("../../../utils/logger.ts", () => ({
  default: mockLogger,
}));

/**
 * Create a clean test environment with AWS credentials
 */
export function createTestEnvironment(customEnv = {}) {
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
    send: mockS3Send,
  };
  s3StorageService.bucketName = env.S3_BUCKET_NAME || "test-bucket";
  s3StorageService.enabled = true;
}
