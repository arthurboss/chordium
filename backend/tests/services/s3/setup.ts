import { jest } from "@jest/globals";

/**
 * Shared S3 test setup utilities
 * Provides common mocks, utilities, and test environment configuration
 */

// Mock S3 operations for AWS SDK v3
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockS3Send: any = jest.fn();

// Mock AWS SDK v3 Client  
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockS3Client: any = jest.fn(() => ({
  send: mockS3Send,
}));

// Mock AWS SDK v3 Commands
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockGetObjectCommand: any = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockPutObjectCommand: any = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockListObjectsV2Command: any = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockHeadBucketCommand: any = jest.fn();

// Backward compatibility mock for AWS SDK v2 style tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockS3: any = {
  send: mockS3Send,
  getObject: jest.fn(),
  putObject: jest.fn(),
  listObjectsV2: jest.fn(),
  headBucket: jest.fn(),
};

// Mock AWS for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockAWS: any = {
  S3: jest.fn(() => mockS3),
};

// Mock logger
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockLogger: any = {
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

jest.unstable_mockModule("../../../utils/logger.js", () => ({
  default: mockLogger,
}));

/**
 * Interface for test environment configuration
 */
interface TestEnvironment {
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  S3_BUCKET_NAME?: string;
  AWS_SESSION_TOKEN?: string;
}

/**
 * Interface for S3 storage service (minimal interface for testing)
 * Uses any for private property access in tests
 */
interface S3StorageService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Create a clean test environment with AWS credentials
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
 * Reset all mocks and service state
 */
export function resetMocks(s3StorageService: S3StorageService): void {
  jest.clearAllMocks();
  s3StorageService.s3 = null;
  s3StorageService.enabled = null;
  s3StorageService.bucketName = null;
}

/**
 * Set up S3 service with custom environment
 */
export function setupS3Service(s3StorageService: S3StorageService, env: TestEnvironment): void {
  s3StorageService.s3 = {
    send: mockS3Send,
  };
  s3StorageService.bucketName = env.S3_BUCKET_NAME || "test-bucket";
  s3StorageService.enabled = true;
}
