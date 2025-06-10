import { jest } from "@jest/globals";

/**
 * AWS SDK v3 Mocks
 * Provides comprehensive mocking for all AWS SDK v3 components
 */

// Create a mock S3 client instance with send method
const createMockS3Client = () => {
  const mockSend = jest.fn();
  const mockInstance = {
    send: mockSend,
  };
  return { mockInstance, mockSend };
};

// Global mock instances that will be reused
let globalMockS3Send;
let globalMockS3Instance;

// Mock AWS SDK v3 Commands
export const mockGetObjectCommand = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));
export const mockPutObjectCommand = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));
export const mockListObjectsV2Command = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));
export const mockHeadBucketCommand = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));

// Mock S3 Client constructor
export const mockS3Client = jest.fn((config) => {
  if (!globalMockS3Instance || !globalMockS3Send) {
    const { mockInstance, mockSend } = createMockS3Client();
    globalMockS3Instance = mockInstance;
    globalMockS3Send = mockSend;
  }
  return globalMockS3Instance;
});

// Export the send method for test access
export const getMockS3Send = () => globalMockS3Send;

/**
 * Reset all AWS SDK mocks
 */
export function resetAwsMocks() {
  if (globalMockS3Send) {
    globalMockS3Send.mockReset();
  }
  mockS3Client.mockClear();
  mockGetObjectCommand.mockClear();
  mockPutObjectCommand.mockClear();
  mockListObjectsV2Command.mockClear();
  mockHeadBucketCommand.mockClear();
}

/**
 * Configure mock responses for common AWS operations
 */
export function configureMockResponses() {
  if (globalMockS3Send) {
    // Default successful responses
    globalMockS3Send.mockImplementation((command) => {
      if (command.input?.Key?.includes('artist-songs/')) {
        if (command.constructor.name === 'GetObjectCommand') {
          return Promise.resolve({
            Body: {
              transformToString: () => Promise.resolve(JSON.stringify([
                { title: "Test Song", path: "test-path", artist: "Test Artist" }
              ])),
            },
          });
        }
        if (command.constructor.name === 'PutObjectCommand') {
          return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
        }
      }
      if (command.constructor.name === 'ListObjectsV2Command') {
        return Promise.resolve({
          Contents: [
            { Key: 'artist-songs/test-artist.json', LastModified: new Date() }
          ],
        });
      }
      if (command.constructor.name === 'HeadBucketCommand') {
        return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
      }
      return Promise.resolve({});
    });
  }
}
