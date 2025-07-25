// Setup mocks before any other imports
import {
  mockS3Send,
  mockPutObjectCommand,
  mockLogger,
  resetAllMocks,
} from "../mocks/setup.js";

import { createTestEnvironment, setupTestEnvironment, restoreEnvironment } from "../helpers/environment.js";
import { resetS3ServiceState } from "../helpers/service-setup.js";

/**
 * Tests for S3 storeArtistSongs operation
 */
describe("S3 Store Artist Songs", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s3StorageService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let originalEnv: any;

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

  test("should successfully store artist songs with optimization", async () => {
    const inputSongs = [
      {
        title: "Song 1",
        path: "song-1",
        url: "https://example.com/song-1",
        extraField: "should-be-removed",
        artist: "Test Artist",
      },
      {
        title: "Song 2",
        path: "song-2",
        url: "https://example.com/song-2",
        extraField: "should-be-removed",
        artist: "Test Artist",
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockS3Send as any).mockResolvedValue({});

    const result = await s3StorageService.storeArtistSongs("test-artist", inputSongs);

    expect(result).toBe(true);
    expect(mockPutObjectCommand).toHaveBeenCalledWith({
      Bucket: "test-bucket",
      Key: "artist-songs/test-artist.json",
      Body: expect.any(String),
      ContentType: "application/json",
      Metadata: {
        artist: "test-artist",
        "song-count": "2",
        "last-updated": expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      },
    });

    // Verify the stored data is optimized (URLs and extra fields removed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgs = (mockPutObjectCommand as any).mock.calls[0][0];
    const storedData = JSON.parse(callArgs.Body);
    
    expect(storedData).toEqual([
      { title: "Song 1", path: "song-1", artist: "Test Artist" },
      { title: "Song 2", path: "song-2", artist: "Test Artist" },
    ]);

    // Verify URLs and extra fields were removed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storedData.forEach((song: any) => {
      expect(song).not.toHaveProperty("url");
      expect(song).not.toHaveProperty("extraField");
    });

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Stored 2 songs for test-artist in S3 (optimized schema)"
    );
  });

  test("should handle empty song arrays", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockS3Send as any).mockResolvedValue({});

    const result = await s3StorageService.storeArtistSongs("empty-artist", []);

    expect(result).toBe(true);
    expect(mockPutObjectCommand).toHaveBeenCalledWith({
      Bucket: "test-bucket",
      Key: "artist-songs/empty-artist.json",
      Body: "[]",
      ContentType: "application/json",
      Metadata: {
        artist: "empty-artist",
        "song-count": "0",
        "last-updated": expect.any(String),
      },
    });
  });

  test("should handle S3 storage errors gracefully", async () => {
    const songs = [{ title: "Song 1", path: "song-1", artist: "Test Artist" }];
    const error = new Error("S3 storage failed");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockS3Send as any).mockRejectedValue(error);

    const result = await s3StorageService.storeArtistSongs("test-artist", songs);

    expect(result).toBe(false);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Error storing songs to S3 for test-artist:",
      "S3 storage failed"
    );
  });
});
