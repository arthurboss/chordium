import { describe, it, expect, jest, beforeEach, afterAll } from "@jest/globals";
import { performSearch } from "../../../services/cifraclub/search-handler.js";

const originalFetch = global.fetch;
const mockFetch = jest.fn<(url: string) => Promise<unknown>>();

/** Wonderwall by Oasis: the title carries the query in most tests below. */
const SONG_DOC = { tipo: "2", txt: "Wonderwall", art: "Oasis", dns: "oasis", url: "wonderwall" };
const ARTIST_DOC = { art: "Oasis", dns: "oasis" };

const SONG_HIT = {
  type: "song",
  title: "Wonderwall",
  artist: "Oasis",
  path: "oasis/wonderwall",
  match: "title",
};
const ARTIST_HIT = { type: "artist", displayName: "Oasis", path: "oasis", songCount: null };

function json(body: unknown) {
  return { ok: true, text: async () => JSON.stringify(body) };
}

function jsonp(body: unknown) {
  return { ok: true, text: async () => `LetrasArtists(${JSON.stringify(body)})` };
}

/** Answers each index separately, the way the two live endpoints do. */
function respondWith({
  songs = [] as object[],
  artists = [] as object[],
  numFound,
}: { songs?: object[]; artists?: object[]; numFound?: number } = {}) {
  mockFetch.mockImplementation(async (url: string) => {
    if (url.includes("/cc/c7/")) {
      return json({ response: { numFound: numFound ?? songs.length, docs: songs } });
    }
    if (url.includes("/letras/artist/")) {
      return jsonp({ response: { numFound: artists.length, docs: artists } });
    }
    throw new Error(`unexpected request: ${url}`);
  });
}

function urlsFor(fragment: string): string[] {
  return mockFetch.mock.calls.map(([url]) => url).filter((url) => url.includes(fragment));
}

describe("unified search handler", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("puts the artists above the songs", async () => {
    respondWith({ songs: [SONG_DOC], artists: [ARTIST_DOC] });

    await expect(performSearch("wonderwall")).resolves.toEqual([ARTIST_HIT, SONG_HIT]);
  });

  it("leaves out a song reached only through its artist", async () => {
    // "oasis" names the act, not the song, and the act is already listed above.
    respondWith({ songs: [SONG_DOC], artists: [ARTIST_DOC] });

    await expect(performSearch("oasis")).resolves.toEqual([ARTIST_HIT]);
  });

  it("marks a song whose words carry the query, and puts it after the titles", async () => {
    const lyricsDoc = { tipo: "2", txt: "Hero", art: "Nickelback", dns: "nickelback", url: "hero" };
    respondWith({ songs: [lyricsDoc, SONG_DOC], artists: [] });

    const results = await performSearch("wonderwall");

    expect(results).toEqual([
      SONG_HIT,
      { type: "song", title: "Hero", artist: "Nickelback", path: "nickelback/hero", match: "lyrics" },
    ]);
  });

  it("counts an artist-and-title query as naming the song", async () => {
    respondWith({ songs: [SONG_DOC], artists: [] });

    const results = await performSearch("oasis wonderwall");

    expect(results).toEqual([SONG_HIT]);
  });

  it("reads a title through its accents and casing", async () => {
    const doc = { tipo: "2", txt: "Tempo Perdido", art: "Legião Urbana", dns: "legiao-urbana", url: "tempo-perdido" };
    respondWith({ songs: [doc], artists: [] });

    const results = await performSearch("legiao urbana tempo perdido");

    expect(results[0]).toMatchObject({ path: "legiao-urbana/tempo-perdido", match: "title" });
  });

  it("treats a near-miss on the title as naming the song", async () => {
    const doc = { tipo: "2", txt: "Eagle's Wings", art: "Integrity", dns: "integrity", url: "eagles-wings" };
    respondWith({ songs: [doc], artists: [] });

    const results = await performSearch("eagles");

    expect(results[0]).toMatchObject({ path: "integrity/eagles-wings", match: "title" });
  });

  it("asks again for the whole set when the first request did not return it all", async () => {
    respondWith({ songs: [SONG_DOC], artists: [], numFound: 621 });

    await performSearch("wonderwall");

    const songRequests = urlsFor("/cc/c7/");
    expect(songRequests).toHaveLength(2);
    expect(songRequests[0]).toContain("limit=500");
    expect(songRequests[1]).toContain("limit=621");
  });

  it("asks only once when the first request already returned everything", async () => {
    respondWith({ songs: [SONG_DOC], artists: [] });

    await performSearch("wonderwall");

    expect(urlsFor("/cc/c7/")).toHaveLength(1);
  });

  it("drops documents that cannot be turned into a link", async () => {
    respondWith({
      songs: [{ tipo: "2", txt: "Wonderwall", art: "Oasis", dns: "oasis" }, SONG_DOC],
      artists: [{ art: "No Slug" }],
    });

    await expect(performSearch("wonderwall")).resolves.toEqual([SONG_HIT]);
  });

  it("returns an empty list when the source has no matches", async () => {
    respondWith({ songs: [], artists: [] });

    await expect(performSearch("xyznonexistent")).resolves.toEqual([]);
  });

  it("reports a failure rather than an empty result when the source is unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("Network Error"));

    await expect(performSearch("wonderwall")).rejects.toThrow("Network Error");
  });

  it("still answers with the artists when only the song index is unreachable", async () => {
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("/cc/c7/")) throw new Error("song index down");
      return jsonp({ response: { numFound: 1, docs: [ARTIST_DOC] } });
    });

    await expect(performSearch("oasis")).resolves.toEqual([ARTIST_HIT]);
  });
});
