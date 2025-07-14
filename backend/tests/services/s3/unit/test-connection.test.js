
// Setup mocks before any other imports
import {
  mockS3Send,
  mockHeadBucketCommand,
  mockLogger,
  resetAllMocks,
} from "../mocks/setup.js";

import { createTestEnvironment, createDisabledEnvironment, setupTestEnvironment, restoreEnvironment } from "../helpers/environment.js";
import { resetS3ServiceState, createMockS3Error } from "../helpers/service-setup.js";

/**
 * Tests for S3 testConnection operation
 */
describe("S3 Test Connection", () => {
  let s3StorageService;
  let originalEnv;

  beforeAll(async () => {
    // Import after mocking
    const module = await import("../../../../services/s3-storage.service.js");
    s3StorageService = module.s3StorageService;
  });

  beforeEach(() => {
    resetAllMocks();
    resetS3ServiceState(s3StorageService);
  });

  afterEach(() => {
    if (originalEnv) {
      restoreEnvironment(originalEnv);
    }
  });

  test("should successfully test S3 connection", async () => {
    originalEnv = setupTestEnvironment(createTestEnvironment());
    mockS3Send.mockResolvedValue({});

    const result = await s3StorageService.testConnection();

    expect(result).toBe(true);
    expect(mockHeadBucketCommand).toHaveBeenCalledWith({
      Bucket: "test-bucket",
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "S3 connection successful to bucket: test-bucket"
    );
  });

  test("should handle S3 connection failure", async () => {
    originalEnv = setupTestEnvironment(createTestEnvironment());
    const error = createMockS3Error("AccessDenied", "Bucket not accessible");
    mockS3Send.mockRejectedValue(error);

    const result = await s3StorageService.testConnection();

    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "S3 connection failed for bucket test-bucket: Bucket not accessible"
    );
  });

  test("should return false when S3 is disabled", async () => {
    originalEnv = setupTestEnvironment(createDisabledEnvironment());

    const result = await s3StorageService.testConnection();

    expect(result).toBe(false);
    expect(mockS3Send).not.toHaveBeenCalled();
  });
});
