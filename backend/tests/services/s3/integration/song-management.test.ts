/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from "@jest/globals";

// Setup mocks before any other imports
import {
  mockS3Send,
  mockLogger,
  resetAllMocks,
} from "../mocks/setup.js";

import { createTestEnvironment, setupTestEnvironment, restoreEnvironment } from "../helpers/environment.js";
import { resetS3ServiceState } from "../helpers/service-setup.js";

/**
 * Integration tests for S3 add/remove song operations
 */
describe("S3 Song Management Integration", () => {
  let s3StorageService: any;
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

  test("should add new song to existing artist", async () => {
    const existingSongs = [
      { title: "Existing Song", path: "existing-song", artist: "Test Artist" },
    ];

    // Mock getArtistSongs to return existing songs
    const mockGetResponse = {
      Body: {
        transformToString: jest.fn<() => Promise<string>>().mockResolvedValue(JSON.stringify(existingSongs)),
      },
    };

    // Mock storeArtistSongs to succeed
    (mockS3Send as any)
      .mockResolvedValueOnce(mockGetResponse) // First call for getArtistSongs
      .mockResolvedValueOnce({}); // Second call for storeArtistSongs

    const newSong = {
      title: "New Song",
      path: "new-song",
      artist: "Test Artist",
    };

    const result = await s3StorageService.addSongToArtist("test-artist", newSong);

    expect(result).toBe(true);
    expect(mockS3Send).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Added song "New Song" to test-artist'
    );
  });

  test("should not add duplicate song", async () => {
    const existingSongs = [
      { title: "Existing Song", path: "existing-song", artist: "Test Artist" },
    ];

    const mockGetResponse = {
      Body: {
        transformToString: jest.fn<() => Promise<string>>().mockResolvedValue(JSON.stringify(existingSongs)),
      },
    };

    (mockS3Send as any).mockResolvedValue(mockGetResponse);

    // Try to add the same song
    const duplicateSong = {
      title: "Existing Song",
      path: "existing-song",
      artist: "Test Artist",
    };

    const result = await s3StorageService.addSongToArtist("test-artist", duplicateSong);

    expect(result).toBe(false);
    expect(mockS3Send).toHaveBeenCalledTimes(1); // Only getArtistSongs, no store
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Song "Existing Song" already exists for test-artist'
    );
  });

  test("should remove song from artist", async () => {
    const existingSongs = [
      { title: "Song 1", path: "song-1", artist: "Test Artist" },
      { title: "Song 2", path: "song-2", artist: "Test Artist" },
    ];

    const mockGetResponse = {
      Body: {
        transformToString: jest.fn<() => Promise<string>>().mockResolvedValue(JSON.stringify(existingSongs)),
      },
    };

    (mockS3Send as any)
      .mockResolvedValueOnce(mockGetResponse) // getArtistSongs
      .mockResolvedValueOnce({}); // storeArtistSongs

    const result = await s3StorageService.removeSongFromArtist("test-artist", "song-1");

    expect(result).toBe(true);
    expect(mockS3Send).toHaveBeenCalledTimes(2);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Removed song with path "song-1" from test-artist'
    );
  });

  test("should handle removing non-existent song", async () => {
    const existingSongs = [
      { title: "Song 1", path: "song-1", artist: "Test Artist" },
    ];

    const mockGetResponse = {
      Body: {
        transformToString: jest.fn<() => Promise<string>>().mockResolvedValue(JSON.stringify(existingSongs)),
      },
    };

    (mockS3Send as any).mockResolvedValue(mockGetResponse);

    const result = await s3StorageService.removeSongFromArtist("test-artist", "non-existent");

    expect(result).toBe(false);
    expect(mockS3Send).toHaveBeenCalledTimes(1); // Only getArtistSongs
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Song with path "non-existent" not found in test-artist'
    );
  });
});
