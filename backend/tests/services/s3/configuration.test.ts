import {
  mockS3Client,
  mockLogger,
  createTestEnvironment,
  resetMocks,
} from "./setup.js";

// Import after mocking
const { s3StorageService } = await import(
  "../../../services/s3-storage.service.js"
);

// Type assertion for testing private methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s3Service = s3StorageService as any;

/**
 * S3 Configuration and Initialization Tests
 * Tests service setup, environment validation, and lazy initialization
 */
describe("S3 Configuration and Initialization", () => {
  const originalEnv: NodeJS.ProcessEnv = process.env;

  beforeEach(() => {
    resetMocks(s3StorageService);
    s3Service.enabled = null; // Ensure re-initialization for each test
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("should initialize with all required environment variables", () => {
    process.env = {
      ...originalEnv,
      ...createTestEnvironment({
        AWS_SESSION_TOKEN: "test-session-token",
      }),
    };

    const result = s3Service._checkEnabled();

    expect(result).toBe(true);
    expect(s3Service.enabled).toBe(true);
    expect(s3Service.bucketName).toBe("test-bucket");
    expect(mockS3Client).toHaveBeenCalledWith({
      credentials: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        sessionToken: "test-session-token",
      },
      region: "eu-central-1",
    });
  });

  test("should use default region when AWS_REGION is not set", () => {
    process.env = {
      ...originalEnv,
      AWS_ACCESS_KEY_ID: "test-key",
      AWS_SECRET_ACCESS_KEY: "test-secret",
      AWS_REGION: undefined, // Explicitly unset
    };

    s3Service._checkEnabled();

    expect(mockS3Client).toHaveBeenCalledWith({
      credentials: {
        accessKeyId: "test-key",
        secretAccessKey: "test-secret",
        sessionToken: undefined,
      },
      region: "eu-central-1", // Default region from service
    });
  });

  test("should use default bucket name when S3_BUCKET_NAME is not set", () => {
    process.env = {
      ...originalEnv,
      AWS_ACCESS_KEY_ID: "test-key",
      AWS_SECRET_ACCESS_KEY: "test-secret",
      S3_BUCKET_NAME: undefined, // Explicitly unset
    };

    s3Service._checkEnabled();

    expect(s3Service.bucketName).toBe("chordium"); // Default bucket from service
  });

  test("should handle partial credentials gracefully", () => {
    // Reset service state to force re-initialization
    resetMocks(s3StorageService);
    s3Service.enabled = null;

    process.env = {
      ...originalEnv,
      AWS_ACCESS_KEY_ID: "test-key",
      AWS_SECRET_ACCESS_KEY: undefined, // Explicitly unset
    };
    delete process.env.AWS_SECRET_ACCESS_KEY; // Ensure it's truly missing

    const result = s3Service._checkEnabled();

    expect(result).toBe(false);
    expect(s3Service.enabled).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "AWS credentials not found. S3 storage will be disabled."
    );
  });

  test("should initialize only once (lazy initialization)", () => {
    process.env = {
      ...originalEnv,
      ...createTestEnvironment(),
    };

    // Call multiple times
    s3Service._checkEnabled();
    s3Service._checkEnabled();
    s3Service._checkEnabled();

    // Should only initialize once
    expect(mockS3Client).toHaveBeenCalledTimes(1);
  });
});
