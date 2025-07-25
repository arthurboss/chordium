// Setup mocks before any other imports
import {
  mockS3Client,
  resetAllMocks,
  setupDefaultMockResponses,
} from "../mocks/setup.js";

import { createTestEnvironment, setupTestEnvironment, restoreEnvironment } from "../helpers/environment.js";
import { resetS3ServiceState } from "../helpers/service-setup.js";

/**
 * Tests for S3 service initialization and configuration
 */
describe("S3 Service Initialization", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s3StorageService: any;
  let originalEnv: NodeJS.ProcessEnv | null;

  beforeAll(async () => {
    // Import after mocking is set up
    const module = await import("../../../../services/s3-storage.service.js");
    s3StorageService = module.s3StorageService;
  });

  beforeEach(() => {
    resetAllMocks();
    setupDefaultMockResponses();
    resetS3ServiceState(s3StorageService);
  });

  afterEach(() => {
    if (originalEnv) {
      restoreEnvironment(originalEnv);
    }
  });

  test("should initialize with valid AWS credentials", () => {
    originalEnv = setupTestEnvironment(createTestEnvironment());

    const result: boolean = s3StorageService._checkEnabled();

    expect(result).toBe(true);
    expect(s3StorageService.enabled).toBe(true);
    expect(s3StorageService.bucketName).toBe("test-bucket");
    expect(mockS3Client).toHaveBeenCalledWith({
      credentials: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
      },
      region: "eu-central-1",
    });
  });

  test("should use default region when AWS_REGION is not set", () => {
    const env: NodeJS.ProcessEnv = createTestEnvironment();
    delete env.AWS_REGION;
    originalEnv = setupTestEnvironment(env);

    s3StorageService._checkEnabled();

    expect(mockS3Client).toHaveBeenCalledWith({
      credentials: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
      },
      region: "eu-central-1", // default region
    });
  });

  test("should handle session token when provided", () => {
    originalEnv = setupTestEnvironment(createTestEnvironment({
      AWS_SESSION_TOKEN: "test-session-token",
    }));

    s3StorageService._checkEnabled();

    expect(mockS3Client).toHaveBeenCalledWith({
      credentials: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        sessionToken: "test-session-token",
      },
      region: "eu-central-1",
    });
  });

  test("should initialize only once (lazy initialization)", () => {
    originalEnv = setupTestEnvironment(createTestEnvironment());

    // Call multiple times
    s3StorageService._checkEnabled();
    s3StorageService._checkEnabled();
    s3StorageService._checkEnabled();

    // Should only initialize once
    expect(mockS3Client).toHaveBeenCalledTimes(1);
  });
});
