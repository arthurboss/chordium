import { describe, it, expect, beforeEach, vi } from "vitest";
import type { DataSource, SearchType } from "@chordium/types";
import type { SearchCacheEntry } from "../../types/search-cache";
import type { SearchCacheService } from "./search-cache-service.types";
import { createSearchCacheService } from "./search-cache-service";

// Mock the store operations
vi.mock("../../stores/search-cache/operations", () => ({
  getSearchCache: vi.fn(),
  storeSearchCache: vi.fn(),
  deleteSearchCache: vi.fn(),
  getAllSearchCache: vi.fn(),
}));

// Mock the store-results operation
vi.mock("../../stores/search-cache/operations/store-results", () => ({
  default: vi.fn(),
}));

describe("SearchCacheService", () => {
  let service: SearchCacheService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    service = createSearchCacheService();
  });

  describe("get", () => {
    it("should retrieve cached search results by path", async () => {
      const mockEntry: SearchCacheEntry = {
        searchKey: "hillsong",
        search: {
          query: {
            artist: "hillsong",
            song: null,
          },
          searchType: "artist" as SearchType,
          dataSource: "supabase" as DataSource,
        },
        results: [{ 
          path: "hillsong-united", 
          displayName: "Hillsong United",
          songCount: 150,
        }],
        storage: {
          timestamp: Date.now(),
          version: 1,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        },
      };

      const { getSearchCache } = await import("../../stores/search-cache/operations");
      vi.mocked(getSearchCache).mockResolvedValue(mockEntry);

      const result = await service.get("hillsong");

      expect(getSearchCache).toHaveBeenCalledWith("hillsong", true);
      expect(result).toEqual(mockEntry);
    });

    it("should return null for non-existent cache entries", async () => {
      const { getSearchCache } = await import("../../stores/search-cache/operations");
      vi.mocked(getSearchCache).mockResolvedValue(null);

      const result = await service.get("non-existent");

      expect(result).toBeNull();
    });

    it("should respect validateTTL option", async () => {
      const { getSearchCache } = await import("../../stores/search-cache/operations");
      vi.mocked(getSearchCache).mockResolvedValue(null);

      await service.get("test-path", { validateTTL: false });

      expect(getSearchCache).toHaveBeenCalledWith("test-path", false);
    });
  });

  describe("storeResults", () => {
    it("should store search results with correct parameters", async () => {
      const mockResults = [{ path: "hillsong-united", displayName: "Hillsong United", songCount: 10 }];
      const storeResults = await import("../../stores/search-cache/operations/store-results");
      vi.mocked(storeResults.default).mockResolvedValue();

      await service.storeResults({
        searchKey: "hillsong",
        results: mockResults,
        search: {
          query: { artist: "hillsong", song: null },
          searchType: "artist" as SearchType,
          dataSource: "supabase" as DataSource,
        }
      });

      expect(storeResults.default).toHaveBeenCalledWith(
        "hillsong",
        mockResults,
        { artist: "hillsong", song: null },
        "artist",
        "supabase",
        {}
      );
    });

    it("should pass through custom TTL options", async () => {
      const mockResults = [{ path: "test", title: "Test Song", artist: "Artist", tags: [] }];
      const customTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
      const storeResults = await import("../../stores/search-cache/operations/store-results");
      vi.mocked(storeResults.default).mockResolvedValue();

      await service.storeResults({
        searchKey: "test-path",
        results: mockResults,
        search: {
          query: { artist: null, song: "test query" },
          searchType: "song" as SearchType,
          dataSource: "cifraclub" as DataSource,
        }
      }, { ttl: customTTL });

      expect(storeResults.default).toHaveBeenCalledWith(
        "test-path",
        mockResults,
        { artist: null, song: "test query" },
        "song",
        "cifraclub",
        { ttl: customTTL }
      );
    });
  });

  describe("delete", () => {
    it("should delete cache entry and return true when found", async () => {
      const { deleteSearchCache } = await import("../../stores/search-cache/operations");
      vi.mocked(deleteSearchCache).mockResolvedValue(true);

      const result = await service.delete("test-path");

      expect(deleteSearchCache).toHaveBeenCalledWith("test-path");
      expect(result).toBe(true);
    });

    it("should return false when entry not found", async () => {
      const { deleteSearchCache } = await import("../../stores/search-cache/operations");
      vi.mocked(deleteSearchCache).mockResolvedValue(false);

      const result = await service.delete("non-existent");

      expect(result).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all cache entries", async () => {
      const { getAllSearchCache, deleteSearchCache } = await import("../../stores/search-cache/operations");
      const mockEntries: SearchCacheEntry[] = [
        {
          searchKey: "entry1",
          search: { 
            query: { artist: "test1", song: null }, 
            searchType: "artist" as SearchType, 
            dataSource: "supabase" as DataSource 
          },
          results: [],
          storage: { timestamp: Date.now(), version: 1, expiresAt: null },
        },
        {
          searchKey: "entry2", 
          search: { 
            query: { artist: null, song: "test2" }, 
            searchType: "song" as SearchType, 
            dataSource: "cifraclub" as DataSource 
          },
          results: [],
          storage: { timestamp: Date.now(), version: 1, expiresAt: null },
        },
      ];

      vi.mocked(getAllSearchCache).mockResolvedValue(mockEntries);
      vi.mocked(deleteSearchCache).mockResolvedValue(true);

      await service.clear();

      expect(getAllSearchCache).toHaveBeenCalled();
      expect(deleteSearchCache).toHaveBeenCalledWith("entry1");
      expect(deleteSearchCache).toHaveBeenCalledWith("entry2");
    });
  });

  describe("getAll", () => {
    it("should return all cached entries", async () => {
      const mockEntries: SearchCacheEntry[] = [
        {
          searchKey: "test1",
          search: { 
            query: { artist: "test1", song: null }, 
            searchType: "artist" as SearchType, 
            dataSource: "supabase" as DataSource 
          },
          results: [],
          storage: { timestamp: Date.now(), version: 1, expiresAt: null },
        },
      ];

      const { getAllSearchCache } = await import("../../stores/search-cache/operations");
      vi.mocked(getAllSearchCache).mockResolvedValue(mockEntries);

      const result = await service.getAll();

      expect(getAllSearchCache).toHaveBeenCalled();
      expect(result).toEqual(mockEntries);
    });
  });
});
