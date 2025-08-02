/**
 * Tests for getAllSearchCache function
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SearchCacheEntry } from "../../../types/search-cache";
import getAllSearchCache from "./get-all-search-cache";

// Mock the database utilities
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

describe("getAllSearchCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockResolvedValue({} as IDBDatabase);
  });

  const mockCacheEntries: SearchCacheEntry[] = [
    {
      path: "metallica", // Artist search term
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
        dataSource: "supabase" as const,
      },
      storage: {
        timestamp: Date.now(),
        version: 1,
        expiresAt: Date.now() + 3600000,
      },
    },
    {
      path: "hello", // Song search term
      results: [
        {
          path: "adele/hello",
          title: "Hello",
          artist: "Adele",
        },
      ],
      search: {
        query: {
          artist: null,
          song: "hello",
        },
        searchType: "song" as const,
        dataSource: "cifraclub" as const,
      },
      storage: {
        timestamp: Date.now(),
        version: 1,
        expiresAt: Date.now() + 3600000,
      },
    },
  ];

  it("should return all cache entries when they exist", async () => {
    mockExecuteTransaction.mockResolvedValue(mockCacheEntries);

    const result = await getAllSearchCache();

    expect(result).toEqual(mockCacheEntries);
    expect(result).toHaveLength(2);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should return empty array when no cache entries exist", async () => {
    mockExecuteTransaction.mockResolvedValue([]);

    const result = await getAllSearchCache();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should handle database initialization", async () => {
    mockExecuteTransaction.mockResolvedValue([]);

    await getAllSearchCache();

    expect(mockGetDatabase).toHaveBeenCalledOnce();
  });

  it("should propagate database operation errors", async () => {
    const dbError = new Error("Database read failed");
    mockExecuteTransaction.mockRejectedValue(dbError);

    await expect(getAllSearchCache()).rejects.toThrow("Database read failed");
    
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });

  it("should handle large number of cache entries", async () => {
    const largeCacheArray = Array.from({ length: 1000 }, (_, i) => ({
      ...mockCacheEntries[0],
      path: `artist-${i}`, // Realistic search term paths
    }));

    mockExecuteTransaction.mockResolvedValue(largeCacheArray);

    const result = await getAllSearchCache();

    expect(result).toHaveLength(1000);
    expect(mockGetDatabase).toHaveBeenCalledOnce();
    expect(mockExecuteTransaction).toHaveBeenCalledOnce();
  });
});
