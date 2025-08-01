// Setup mocks before any other imports
import {
  mockS3Send,
  mockLogger,
  resetAllMocks,
  setupDefaultMockResponses,
} from "../mocks/setup.js";

import { createDisabledEnvironment, setupTestEnvironment, restoreEnvironment } from "../helpers/environment.js";
import { resetS3ServiceState } from "../helpers/service-setup.js";

/**
 * Tests for S3 service when disabled (no credentials)
 */
describe("S3 Service Disabled State", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s3StorageService: any;
  let originalEnv: NodeJS.ProcessEnv | null;

  beforeAll(async () => {
    // Import after mocking
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

  test("should disable service when AWS credentials are missing", () => {
    originalEnv = setupTestEnvironment(createDisabledEnvironment());

    const result: boolean = s3StorageService._checkEnabled();

    expect(result).toBe(false);
    expect(s3StorageService.enabled).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "AWS credentials not found. S3 storage will be disabled."
    );
  });

  test("should return null when getting artist songs with disabled service", async () => {
    originalEnv = setupTestEnvironment(createDisabledEnvironment());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await s3StorageService.getArtistSongs("test-artist");

    expect(result).toBeNull();
    expect(mockS3Send).not.toHaveBeenCalled();
  });

  test("should return false when storing songs with disabled service", async () => {
    originalEnv = setupTestEnvironment(createDisabledEnvironment());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testSongs: any[] = [];
    const result: boolean = await s3StorageService.storeArtistSongs("test-artist", testSongs);

    expect(result).toBe(false);
    expect(mockS3Send).not.toHaveBeenCalled();
  });

  test("should return false when testing connection with disabled service", async () => {
    originalEnv = setupTestEnvironment(createDisabledEnvironment());

    const result: boolean = await s3StorageService.testConnection();

    expect(result).toBe(false);
    expect(mockS3Send).not.toHaveBeenCalled();
  });
});
