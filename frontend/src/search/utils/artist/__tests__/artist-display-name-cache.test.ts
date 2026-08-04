import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/storage/services/search-cache/search-cache-service", () => ({
  searchCacheService: {
    get: vi.fn(),
    storeResults: vi.fn(),
  },
}));

import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import { getStoredArtistDisplayName, storeArtistDisplayName } from "../artist-display-name-cache";

const mockGet = vi.mocked(searchCacheService.get);
const mockStoreResults = vi.mocked(searchCacheService.storeResults);

describe("artist-display-name-cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStoredArtistDisplayName", () => {
    it("returns the cached displayName when present", async () => {
      mockGet.mockResolvedValue({
        searchKey: "acdc||artistsong",
        results: [],
        search: {
          query: { artist: "ac-dc", song: "", displayName: "AC/DC" },
          searchType: "artist-song",
          dataSource: "neon",
        },
        storage: { timestamp: 0, version: 1, expiresAt: 0 },
      } as any);

      const result = await getStoredArtistDisplayName("ac-dc");

      expect(result).toBe("AC/DC");
    });

    it("returns null when no cache entry exists", async () => {
      mockGet.mockResolvedValue(null);

      const result = await getStoredArtistDisplayName("unknown-artist");

      expect(result).toBeNull();
    });

    it("returns null when the cache entry has no displayName", async () => {
      mockGet.mockResolvedValue({
        searchKey: "oasis||artistsong",
        results: [],
        search: {
          query: { artist: "oasis", song: "" },
          searchType: "artist-song",
          dataSource: "neon",
        },
        storage: { timestamp: 0, version: 1, expiresAt: 0 },
      } as any);

      const result = await getStoredArtistDisplayName("oasis");

      expect(result).toBeNull();
    });

    it("returns null instead of throwing when the cache lookup fails", async () => {
      mockGet.mockRejectedValue(new Error("IndexedDB unavailable"));

      const result = await getStoredArtistDisplayName("ac-dc");

      expect(result).toBeNull();
    });
  });

  describe("storeArtistDisplayName", () => {
    it("stores the displayName keyed by artist path with empty results when nothing was cached yet", async () => {
      mockGet.mockResolvedValue(null);

      await storeArtistDisplayName("florianopolis-house-of-prayer", "Florianópolis House Of Prayer (fhop music)");

      expect(mockStoreResults).toHaveBeenCalledWith({
        searchKey: expect.any(String),
        results: [],
        search: {
          query: { artist: "florianopolis-house-of-prayer", song: "", displayName: "Florianópolis House Of Prayer (fhop music)" },
          searchType: "artist-song",
          dataSource: "neon",
        },
      });
    });

    it("preserves already-cached songs when updating just the displayName", async () => {
      const existingSongs = [{ title: "Sublime", path: "florianopolis-house-of-prayer/sublime", artist: "Florianopolis House Of Prayer" }];
      mockGet.mockResolvedValue({
        searchKey: "florianopolishouseofprayer||artistsong",
        results: existingSongs,
        search: {
          query: { artist: "florianopolis-house-of-prayer", song: "" },
          searchType: "artist-song",
          dataSource: "neon",
        },
        storage: { timestamp: 0, version: 1, expiresAt: 0 },
      } as any);

      await storeArtistDisplayName("florianopolis-house-of-prayer", "Florianópolis House Of Prayer (fhop music)");

      expect(mockStoreResults).toHaveBeenCalledWith({
        searchKey: expect.any(String),
        results: existingSongs,
        search: {
          query: { artist: "florianopolis-house-of-prayer", song: "", displayName: "Florianópolis House Of Prayer (fhop music)" },
          searchType: "artist-song",
          dataSource: "neon",
        },
      });
    });

    it("does not throw when the underlying store call fails", async () => {
      mockGet.mockResolvedValue(null);
      mockStoreResults.mockRejectedValue(new Error("IndexedDB unavailable"));

      await expect(storeArtistDisplayName("ac-dc", "AC/DC")).resolves.toBeUndefined();
    });
  });
});
