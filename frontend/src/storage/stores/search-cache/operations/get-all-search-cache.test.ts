/**
 * Tests for getAllSearchCache function
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SearchCacheEntry } from "../../../types/search-cache";
import getAllSearchCache from "./get-all-search-cache";

// Import real fixture data
import hillsongArtists from "../../../../../../shared/fixtures/artists/hillsong.json";
import oceansSearch from "../../../../../../shared/fixtures/cifraclub-search/oceans.json";

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
import { Artist, Song } from "@chordium/types";

const mockGetDatabase = vi.mocked(getDatabase);
const mockExecuteTransaction = vi.mocked(executeSearchCacheReadTransaction);

describe("getAllSearchCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDatabase.mockResolvedValue({} as IDBDatabase);
  });

  const mockCacheEntries: SearchCacheEntry[] = [
    {
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
        expiresAt: Date.now() + 3600000,
      },
    },
    {
      path: "oceans", // Song search term (from search-types.md: /api/cifraclub-search)
      results: oceansSearch as Song[], // Real fixture data from cifraclub-search/oceans.json
      search: {
        query: {
          artist: null,
          song: "oceans",
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
    expect(result[0].results).toHaveLength(hillsongArtists.length); // Real fixture length
    expect(result[1].results).toHaveLength(oceansSearch.length); // Real fixture length
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
