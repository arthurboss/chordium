import { jest } from "@jest/globals";

/**
 * Centralized Mock Setup for S3 Tests
 * This file sets up all necessary mocks before any modules are imported
 */

// Mock implementations
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const mockS3Send = jest.fn();
const mockS3Client = jest.fn(() => ({ send: mockS3Send }));

const mockGetObjectCommand = jest.fn((params) => ({ input: params }));
const mockPutObjectCommand = jest.fn((params) => ({ input: params }));
const mockListObjectsV2Command = jest.fn((params) => ({ input: params }));
const mockHeadBucketCommand = jest.fn((params) => ({ input: params }));

// Set up the mocks at module level
jest.unstable_mockModule("../../../../utils/logger.ts", () => ({ default: mockLogger }));

jest.unstable_mockModule("@aws-sdk/client-s3", () => ({
  S3Client: mockS3Client,
  GetObjectCommand: mockGetObjectCommand,
  PutObjectCommand: mockPutObjectCommand,
  ListObjectsV2Command: mockListObjectsV2Command,
  HeadBucketCommand: mockHeadBucketCommand,
}));

// Export mocks for test access
export {
  mockLogger,
  mockS3Send,
  mockS3Client,
  mockGetObjectCommand,
  mockPutObjectCommand,
  mockListObjectsV2Command,
  mockHeadBucketCommand,
};

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  Object.values(mockLogger).forEach(mock => mock.mockReset());
  mockS3Send.mockReset();
  mockS3Client.mockClear();
  mockGetObjectCommand.mockClear();
  mockPutObjectCommand.mockClear();
  mockListObjectsV2Command.mockClear();
  mockHeadBucketCommand.mockClear();
}

/**
 * Configure default mock responses
 */
export function setupDefaultMockResponses() {
  // Setup default S3 responses
  mockS3Send.mockImplementation((command) => {
    const commandName = command.constructor.name;
    
    switch (commandName) {
      case 'GetObjectCommand':
        if (command.input.Key.includes('nonexistent') || command.input.Key.includes('not-found')) {
          const error = new Error('NoSuchKey');
          error.name = 'NoSuchKey';
          return Promise.reject(error);
        }
        return Promise.resolve({
          Body: {
            transformToString: () => Promise.resolve(JSON.stringify([
              { title: "Test Song", path: "test-path", artist: "Test Artist" }
            ])),
          },
        });
        
      case 'PutObjectCommand':
        return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
        
      case 'ListObjectsV2Command':
        return Promise.resolve({
          Contents: [
            { Key: 'artist-songs/test-artist.json', LastModified: new Date() }
          ],
        });
        
      case 'HeadBucketCommand':
        return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
        
      default:
        return Promise.resolve({});
    }
  });
}
