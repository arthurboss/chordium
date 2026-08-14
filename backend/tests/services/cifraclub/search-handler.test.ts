import { describe, it, expect, jest, beforeEach, afterAll } from "@jest/globals";
import { performSearch } from "../../../services/cifraclub/search-handler.js";

const originalFetch = global.fetch;
const mockFetch = jest.fn<() => Promise<unknown>>();

function jsonpResponse(docs: object[]) {
  return {
    ok: true,
    text: async () =>
      `x({"response":{"numFound":${docs.length},"start":0,"docs":${JSON.stringify(docs)}}})`,
  };
}

const ARTIST_DOC = { t: "1", m: "Oasis", a: "Oasis", d: "oasis" };
const SONG_DOC = { t: "2", m: "Wonderwall", a: "Oasis", d: "oasis", u: "wonderwall" };

const ARTIST_HIT = { type: "artist", displayName: "Oasis", path: "oasis", songCount: null };
const SONG_HIT = { type: "song", title: "Wonderwall", artist: "Oasis", path: "oasis/wonderwall" };

describe("unified search handler", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("returns artists and songs together, in the order the source ranked them", async () => {
    mockFetch.mockResolvedValue(jsonpResponse([ARTIST_DOC, SONG_DOC]));

    await expect(performSearch("oasis")).resolves.toEqual([ARTIST_HIT, SONG_HIT]);
  });

  it("preserves a song-first ranking rather than grouping by kind", async () => {
    mockFetch.mockResolvedValue(jsonpResponse([SONG_DOC, ARTIST_DOC]));

    await expect(performSearch("wonderwall")).resolves.toEqual([SONG_HIT, ARTIST_HIT]);
  });

  it("drops documents that cannot be turned into a link", async () => {
    mockFetch.mockResolvedValue(
      jsonpResponse([
        { t: "1", m: "No Slug", a: "No Slug", d: "" },
        { t: "2", m: "No Song Slug", a: "Oasis", d: "oasis" },
        SONG_DOC,
      ])
    );

    await expect(performSearch("oasis")).resolves.toEqual([SONG_HIT]);
  });

  it("returns an empty list when the source has no matches", async () => {
    mockFetch.mockResolvedValue(jsonpResponse([]));

    await expect(performSearch("xyznonexistent")).resolves.toEqual([]);
  });

  it("sends the whole query as one string", async () => {
    mockFetch.mockResolvedValue(jsonpResponse([]));

    await performSearch("guns n roses paradise city");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://solr.sscdn.co/cc/h2/?q=guns%20n%20roses%20paradise%20city&callback=x"
    );
  });

  it("reports a failure rather than an empty result when the source is unreachable", async () => {
    mockFetch.mockRejectedValue(new Error("Network Error"));

    await expect(performSearch("oasis")).rejects.toThrow("Network Error");
  });
});
