/**
 * Tests for getSearchCache function
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SearchCacheEntry } from "../../../types/search-cache";
import getSearchCache from "./get-search-cache";

// Mock the database utilities to avoid initialization issues in tests
vi.mock("../../chord-sheets/database/connection", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("../utils/transactions/read-transaction", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Import mocked functions
import { getDatabase } from "../../chord-sheets/database/connection";
import executeSearchCacheReadTransaction from "../utils/transactions/read-transaction";

const mockGetDatabase = vi.mocked(getDatabase);
const mockExecuteTransaction = vi.mocked(executeSearchCacheReadTransaction);

describe("getSearchCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockResolvedValue({} as IDBDatabase);
  });

  const validCacheEntry: SearchCacheEntry = {
    path: "search:artist:metallica:cifraclub",
    results: [
      {
        path: "metallica",
        displayName: "Metallica",
        songCount: 125,
      },
    ],
    search: {
      query: {
        artist: "metallica",
        song: null,
      },
      searchType: "artist" as const,
      dataSource: "cifraclub" as const,
    },
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: Date.now() + 3600000, // 1 hour from now
    },
  };

  const expiredCacheEntry: SearchCacheEntry = {
    ...validCacheEntry,
    storage: {
      ...validCacheEntry.storage,
      expiresAt: Date.now() - 3600000, // 1 hour ago (expired)
    },
  };

  it("should return null when entry does not exist", async () => {
    mockExecuteTransaction.mockResolvedValue(undefined);

    const result = await getSearchCache("non-existent-path");

    expect(result).toBeNull();
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should return cached entry when it exists and is not expired", async () => {
    mockExecuteTransaction.mockResolvedValue(validCacheEntry);

    const result = await getSearchCache("search:artist:metallica:cifraclub");

    expect(result).toEqual(validCacheEntry);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should return expired entry when checkExpiration is false", async () => {
    mockExecuteTransaction.mockResolvedValue(expiredCacheEntry);

    const result = await getSearchCache("search:artist:metallica:cifraclub", false);

    expect(result).toEqual(expiredCacheEntry);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should return null for expired entry when checkExpiration is true", async () => {
    mockExecuteTransaction.mockResolvedValue(expiredCacheEntry);

    const result = await getSearchCache("search:artist:metallica:cifraclub", true);

    expect(result).toBeNull();
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should default to checking expiration when checkExpiration not provided", async () => {
    mockExecuteTransaction.mockResolvedValue(expiredCacheEntry);

    const result = await getSearchCache("search:artist:metallica:cifraclub");

    expect(result).toBeNull(); // Should be null due to expiration check
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });
});
