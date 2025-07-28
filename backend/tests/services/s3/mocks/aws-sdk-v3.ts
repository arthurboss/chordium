import { jest } from "@jest/globals";

/**
 * AWS SDK v3 Mocks
 * Provides comprehensive mocking for all AWS SDK v3 components
 */

/**
 * Interface for mock S3 client instance
 */
interface MockS3ClientInstance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: any;
}

/**
 * Create a mock S3 client instance with send method
 */
const createMockS3Client = (): { 
  mockInstance: MockS3ClientInstance; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockSend: any 
} => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSend: any = jest.fn();
  const mockInstance: MockS3ClientInstance = {
    send: mockSend,
  };
  return { mockInstance, mockSend };
};

// Global mock instances that will be reused
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globalMockS3Send: any;
let globalMockS3Instance: MockS3ClientInstance | undefined;

// Mock AWS SDK v3 Commands
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockGetObjectCommand: any = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockPutObjectCommand: any = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockListObjectsV2Command: any = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockHeadBucketCommand: any = jest.fn((params) => ({ 
  input: params,
  $metadata: {},
}));

// Mock S3 Client constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockS3Client: any = jest.fn((config) => {
  if (!globalMockS3Instance || !globalMockS3Send) {
    const { mockInstance, mockSend } = createMockS3Client();
    globalMockS3Instance = mockInstance;
    globalMockS3Send = mockSend;
  }
  return globalMockS3Instance;
});

// Export the send method for test access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMockS3Send = (): any => globalMockS3Send;

/**
 * Reset all AWS SDK mocks
 */
export function resetAwsMocks(): void {
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
export function configureMockResponses(): void {
  if (globalMockS3Send) {
    // Default successful responses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalMockS3Send.mockImplementation((command: any) => {
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
