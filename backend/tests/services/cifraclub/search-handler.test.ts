import { describe, it, expect, jest, beforeEach, afterAll } from "@jest/globals";
import { unifiedSearch } from "@chordium/scraping";
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

/** As many lyrics-matching songs as the first request needs to be satisfied. */
function lyricsDocs(count: number): object[] {
  return Array.from({ length: count }, (_, i) => ({
    tipo: "2",
    txt: `Unrelated Song ${i}`,
    art: `Some Band ${i}`,
    dns: `band-${i}`,
    url: `song-${i}`,
  }));
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
    respondWith({ songs: [SONG_DOC], artists: [ARTIST_DOC] });

    await expect(performSearch("oasis")).resolves.toEqual([ARTIST_HIT]);
  });

  it("marks a song whose words carry the query, and puts it after the titles", async () => {
    const lyricsDoc = { tipo: "2", txt: "Hero", art: "Nickelback", dns: "nickelback", url: "hero" };
    respondWith({ songs: [lyricsDoc, SONG_DOC], artists: [] });

    await expect(performSearch("wonderwall")).resolves.toEqual([
      SONG_HIT,
      { type: "song", title: "Hero", artist: "Nickelback", path: "nickelback/hero", match: "lyrics" },
    ]);
  });

  it("counts an artist-and-title query as naming the song", async () => {
    respondWith({ songs: [SONG_DOC], artists: [] });

    await expect(performSearch("oasis wonderwall")).resolves.toEqual([SONG_HIT]);
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

  describe("asking for as few rows as will do", () => {
    it("asks for a small window first", async () => {
      respondWith({ songs: [SONG_DOC], artists: [] });

      await performSearch("wonderwall");

      expect(urlsFor("/cc/c7/")).toHaveLength(1);
      expect(urlsFor("/cc/c7/")[0]).toContain("limit=50");
    });

    it("asks again, wider, when the small window came back mostly discarded", async () => {
      // A query naming an act: the source leads with that act's catalogue, which
      // is dropped, so the first window yields almost nothing to show.
      respondWith({ songs: [SONG_DOC], artists: [], numFound: 621 });

      await performSearch("wonderwall");

      const requests = urlsFor("/cc/c7/");
      expect(requests).toHaveLength(2);
      expect(requests[0]).toContain("limit=50");
      expect(requests[1]).toContain("limit=500");
    });

    it("never asks for more than the ceiling, whatever total is reported", async () => {
      respondWith({ songs: [SONG_DOC], artists: [], numFound: 100718 });

      await performSearch("love");

      expect(urlsFor("/cc/c7/")[1]).toContain("limit=500");
    });

    it("does not ask twice when the small window already found enough", async () => {
      respondWith({ songs: lyricsDocs(30), artists: [], numFound: 5000 });

      await performSearch("tonight");

      expect(urlsFor("/cc/c7/")).toHaveLength(1);
    });

    it("does not ask twice when the source has nothing more to give", async () => {
      respondWith({ songs: [SONG_DOC], artists: [], numFound: 1 });

      await performSearch("wonderwall");

      expect(urlsFor("/cc/c7/")).toHaveLength(1);
    });
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

  describe("merging with our own tables", () => {
    /** Stands in for the database, answering by which table is being read. */
    function stubSql(artists: object[], songs: object[] = []) {
      return ((strings: TemplateStringsArray) => {
        const text = strings.join("");
        if (text.includes("FROM artists")) return Promise.resolve({ rows: artists });
        if (text.includes("FROM songs")) return Promise.resolve({ rows: songs });
        return Promise.resolve({ rows: [] });
      }) as never;
    }

    it("adds artists the source did not have, and shows them after its ranked ones", async () => {
      respondWith({ songs: [], artists: [ARTIST_DOC] });
      const sql = stubSql([
        // Already ranked by the source, so it must not appear twice.
        { displayName: "Oasis", path: "oasis", songCount: 42 },
        // A mid-word match the source's index cannot make.
        { displayName: "Beagles", path: "beagles", songCount: null },
      ]);

      const results = await unifiedSearch({ query: "oasis", sql });

      expect(results).toEqual([
        ARTIST_HIT,
        { type: "artist", displayName: "Beagles", path: "beagles", songCount: null },
      ]);
    });

    it("keeps the source's ranking ahead of the database's alphabetical order", async () => {
      respondWith({ songs: [], artists: [{ art: "Eagles", dns: "the-eagles" }] });
      const sql = stubSql([
        { displayName: "Beagles", path: "beagles", songCount: null },
        { displayName: "Eagles", path: "eagles-2", songCount: null },
      ]);

      const results = await unifiedSearch({ query: "eagles", sql });

      expect(results.map((hit) => hit.path)).toEqual(["the-eagles", "beagles", "eagles-2"]);
    });
  });
});
