/**
 * Tests for storeSearchCache function
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SearchCacheEntry } from "../../../types/search-cache";
import storeSearchCache from "./store-search-cache";

// Import real fixture data
import hillsongArtists from "../../../../../../shared/fixtures/artists/hillsong.json";

// Mock the database utilities
vi.mock("../../chord-sheets/database/connection", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("../utils/transactions/write-transaction", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Import mocked functions
import { getDatabase } from "../../chord-sheets/database/connection";
import executeSearchCacheWriteTransaction from "../utils/transactions/write-transaction";
import { Artist } from "@chordium/types";

const mockGetDatabase = vi.mocked(getDatabase);
const mockExecuteTransaction = vi.mocked(executeSearchCacheWriteTransaction);

describe("storeSearchCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockResolvedValue({} as IDBDatabase);
  });

  const validCacheEntry: SearchCacheEntry = {
    path: "hillsong", // Artist search term (from search-types.md: /api/artists)
    results: hillsongArtists as Artist[], // Real fixture data from artists/hillsong.json
    search: {
      query: {
        artist: "hillsong",
        song: null,
      },
      searchType: "artist" as const,
      dataSource: "supabase" as const,
    },
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: Date.now() + 3600000, // 1 hour from now
    },
  };

  it("should store cache entry successfully", async () => {
    mockExecuteTransaction.mockResolvedValue(undefined);

    await storeSearchCache(validCacheEntry);

    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should replace existing entry with same path", async () => {
    const updatedEntry: SearchCacheEntry = {
      ...validCacheEntry,
      results: [
        {
          path: "hillsong-en-espaol",
          displayName: "Hillsong en Español (Updated)",
          songCount: 130,
        },
      ],
      storage: {
        ...validCacheEntry.storage,
        timestamp: Date.now() + 1000, // Newer timestamp
      },
    };

    mockExecuteTransaction.mockResolvedValue(undefined);

    await storeSearchCache(updatedEntry);

    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should handle database initialization", async () => {
    mockExecuteTransaction.mockResolvedValue(undefined);

    await storeSearchCache(validCacheEntry);

    expect(mockGetDatabase).toHaveBeenCalledOnce();
  });

  it("should propagate database operation errors", async () => {
    const dbError = new Error("Database write failed");
    mockExecuteTransaction.mockRejectedValue(dbError);

    await expect(storeSearchCache(validCacheEntry)).rejects.toThrow(
      "Database write failed"
    );

    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should handle large cache entries", async () => {
    const largeCacheEntry: SearchCacheEntry = {
      ...validCacheEntry,
      results: Array.from({ length: 1000 }, (_, i) => ({
        path: `hillsong-song-${i}`,
        displayName: `Hillsong Song ${i}`,
        songCount: i,
      })),
    };

    mockExecuteTransaction.mockResolvedValue(undefined);

    await storeSearchCache(largeCacheEntry);

    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });
});
