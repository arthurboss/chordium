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

function cachedArtist(path: string, displayName: string | undefined, results: unknown[]) {
  return {
    searchKey: `${path}|artist-songs`,
    results,
    search: {
      query: path,
      kind: "artist-songs",
      displayName,
      dataSource: "cifraclub",
    },
    storage: { timestamp: 0, version: 1, expiresAt: 0 },
  } as any;
}

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
      .mockResolvedValueOnce(
        cachedArtist("florianopolis-house-of-prayer", "Florianópolis House Of Prayer (fhop music)", [])
      );

    await fetchArtistSongs("florianopolis-house-of-prayer");

    expect(mockStoreResults).toHaveBeenCalledWith({
      searchKey: expect.any(String),
      results: songs,
      search: {
        query: "florianopolis-house-of-prayer",
        kind: "artist-songs",
        displayName: "Florianópolis House Of Prayer (fhop music)",
        dataSource: "cifraclub",
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
        query: "ac-dc",
        kind: "artist-songs",
        displayName: undefined,
        dataSource: "cifraclub",
      },
    });
  });

  it("returns cached songs directly without re-fetching when a non-empty cache entry exists", async () => {
    mockGet.mockResolvedValue(cachedArtist("ac-dc", "AC/DC", songs));

    const result = await fetchArtistSongs("ac-dc");

    expect(result).toBe(songs);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fetches songs when the only cache entry is a displayName-only placeholder with empty results", async () => {
    mockGet
      .mockResolvedValueOnce(cachedArtist("ac-dc", "AC/DC", []))
      .mockResolvedValueOnce(cachedArtist("ac-dc", "AC/DC", []));

    const result = await fetchArtistSongs("ac-dc");

    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual(songs);
  });
});
