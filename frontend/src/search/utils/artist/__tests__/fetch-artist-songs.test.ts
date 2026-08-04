import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/storage/services/search-cache/search-cache-service", () => ({
  searchCacheService: {
    get: vi.fn(),
    storeResults: vi.fn(),
  },
}));

import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import { fetchArtistSongs } from "../fetch-artist-songs";

const mockGet = vi.mocked(searchCacheService.get);
const mockStoreResults = vi.mocked(searchCacheService.storeResults);

const songs = [{ title: "Sublime", path: "florianopolis-house-of-prayer/sublime", artist: "" }];

describe("fetchArtistSongs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => songs,
    }) as any;
  });

  it("preserves a displayName written to the cache after the initial read but before the fetch resolves", async () => {
    // First read (before the network call): nothing cached yet.
    // Second read (right before the write): storeArtistDisplayName has since
    // written the displayName - simulates the real race between
    // navigateToArtist's storeArtistDisplayName call and this fetch.
    mockGet
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        searchKey: "florianopolishouseofprayer||artistsong",
        results: [],
        search: {
          query: { artist: "florianopolis-house-of-prayer", song: "", displayName: "Florianópolis House Of Prayer (fhop music)" },
          searchType: "artist-song",
          dataSource: "neon",
        },
        storage: { timestamp: 0, version: 1, expiresAt: 0 },
      } as any);

    await fetchArtistSongs("florianopolis-house-of-prayer");

    expect(mockStoreResults).toHaveBeenCalledWith({
      searchKey: expect.any(String),
      results: songs,
      search: {
        query: { artist: "florianopolis-house-of-prayer", song: "", displayName: "Florianópolis House Of Prayer (fhop music)" },
        searchType: "artist-song",
        dataSource: "neon",
      },
    });
  });

  it("stores results with an undefined displayName when nothing was ever cached", async () => {
    mockGet.mockResolvedValue(null);

    await fetchArtistSongs("ac-dc");

    expect(mockStoreResults).toHaveBeenCalledWith({
      searchKey: expect.any(String),
      results: songs,
      search: {
        query: { artist: "ac-dc", song: "", displayName: undefined },
        searchType: "artist-song",
        dataSource: "neon",
      },
    });
  });

  it("returns cached songs directly without re-fetching when a non-empty cache entry exists", async () => {
    mockGet.mockResolvedValue({
      searchKey: "acdc||artistsong",
      results: songs,
      search: {
        query: { artist: "ac-dc", song: "", displayName: "AC/DC" },
        searchType: "artist-song",
        dataSource: "neon",
      },
      storage: { timestamp: 0, version: 1, expiresAt: 0 },
    } as any);

    const result = await fetchArtistSongs("ac-dc");

    expect(result).toBe(songs);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches songs when the only cache entry is a displayName-only placeholder with empty results", async () => {
    mockGet
      .mockResolvedValueOnce({
        searchKey: "acdc||artistsong",
        results: [],
        search: {
          query: { artist: "ac-dc", song: "", displayName: "AC/DC" },
          searchType: "artist-song",
          dataSource: "neon",
        },
        storage: { timestamp: 0, version: 1, expiresAt: 0 },
      } as any)
      .mockResolvedValueOnce({
        searchKey: "acdc||artistsong",
        results: [],
        search: {
          query: { artist: "ac-dc", song: "", displayName: "AC/DC" },
          searchType: "artist-song",
          dataSource: "neon",
        },
        storage: { timestamp: 0, version: 1, expiresAt: 0 },
      } as any);

    const result = await fetchArtistSongs("ac-dc");

    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual(songs);
  });
});
