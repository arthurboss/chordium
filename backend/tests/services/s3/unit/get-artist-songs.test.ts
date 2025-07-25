import { jest } from "@jest/globals";

// Setup mocks before any other imports
import {
  mockS3Send,
  mockGetObjectCommand,
  mockLogger,
  resetAllMocks,
} from "../mocks/setup.js";

import { createTestEnvironment, setupTestEnvironment, restoreEnvironment } from "../helpers/environment.js";
import { resetS3ServiceState, createMockS3Error } from "../helpers/service-setup.js";

/**
 * Tests for S3 getArtistSongs operation
 */
describe("S3 Get Artist Songs", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s3StorageService: any;
  let originalEnv: NodeJS.ProcessEnv;

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

  test("should successfully retrieve artist songs", async () => {
    const mockSongs = [
      { title: "Song 1", path: "song-1", artist: "Test Artist" },
      { title: "Song 2", path: "song-2", artist: "Test Artist" },
    ];

    const mockResponse = {
      Body: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformToString: (jest.fn() as any).mockResolvedValue(JSON.stringify(mockSongs)),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockS3Send as any).mockResolvedValue(mockResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await s3StorageService.getArtistSongs("test-artist");

    expect(result).toEqual(mockSongs);
    expect(mockGetObjectCommand).toHaveBeenCalledWith({
      Bucket: "test-bucket",
      Key: "artist-songs/test-artist.json",
    });
    expect(mockS3Send).toHaveBeenCalledWith(expect.any(Object));
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Retrieved 2 songs for test-artist from S3"
    );
  });

  test("should return null when artist songs not found", async () => {
    const error: Error = createMockS3Error("NoSuchKey", "The specified key does not exist.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockS3Send as any).mockRejectedValue(error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await s3StorageService.getArtistSongs("nonexistent-artist");

    expect(result).toBeNull();
    expect(mockLogger.info).toHaveBeenCalledWith(
      "No cached songs found for nonexistent-artist in S3"
    );
  });

  test("should handle malformed JSON data gracefully", async () => {
    const mockResponse = {
      Body: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformToString: (jest.fn() as any).mockResolvedValue("invalid json"),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockS3Send as any).mockResolvedValue(mockResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await s3StorageService.getArtistSongs("test-artist");

    expect(result).toBeNull();
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Error retrieving songs from S3 for test-artist:",
      expect.any(String)
    );
  });

  test("should handle other S3 errors gracefully", async () => {
    const error: Error = createMockS3Error("AccessDenied", "Access denied");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockS3Send as any).mockRejectedValue(error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await s3StorageService.getArtistSongs("test-artist");

    expect(result).toBeNull();
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Error retrieving songs from S3 for test-artist:",
      "Access denied"
    );
  });
});
