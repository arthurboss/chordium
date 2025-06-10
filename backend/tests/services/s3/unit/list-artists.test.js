
// Setup mocks before any other imports
import {
  mockS3Send,
  mockListObjectsV2Command,
  mockLogger,
  resetAllMocks,
} from "../mocks/setup.js";

import { createTestEnvironment, setupTestEnvironment, restoreEnvironment } from "../helpers/environment.js";
import { resetS3ServiceState, createMockS3Error } from "../helpers/service-setup.js";

/**
 * Tests for S3 listArtists operation
 */
describe("S3 List Artists", () => {
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
    originalEnv = setupTestEnvironment(createTestEnvironment());
  });

  afterEach(() => {
    restoreEnvironment(originalEnv);
  });

  test("should successfully list artists from S3", async () => {
    const mockS3Objects = {
      Contents: [
        { Key: "artist-songs/artist-1.json" },
        { Key: "artist-songs/artist-2.json" },
        { Key: "artist-songs/hillsong-united.json" },
      ],
    };

    mockS3Send.mockResolvedValue(mockS3Objects);

    const result = await s3StorageService.listArtists();

    expect(result).toEqual(["artist-1", "artist-2", "hillsong-united"]);
    expect(mockListObjectsV2Command).toHaveBeenCalledWith({
      Bucket: "test-bucket",
      Prefix: "artist-songs/",
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Found 3 artists in S3 storage"
    );
  });

  test("should handle empty S3 bucket", async () => {
    const mockS3Objects = { Contents: [] };
    mockS3Send.mockResolvedValue(mockS3Objects);

    const result = await s3StorageService.listArtists();

    expect(result).toEqual([]);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Found 0 artists in S3 storage"
    );
  });

  test("should handle missing Contents property", async () => {
    const mockS3Objects = {}; // No Contents property
    mockS3Send.mockResolvedValue(mockS3Objects);

    const result = await s3StorageService.listArtists();

    expect(result).toEqual([]);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Found 0 artists in S3 storage"
    );
  });

  test("should handle S3 list operation failure", async () => {
    const error = createMockS3Error("AccessDenied", "List operation failed");
    mockS3Send.mockRejectedValue(error);

    await expect(s3StorageService.listArtists()).rejects.toThrow("List operation failed");
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Error listing artists from S3:",
      error
    );
  });
});
