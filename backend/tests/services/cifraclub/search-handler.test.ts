import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import SEARCH_TYPES from "../../../constants/searchTypes.js";

const mockAxiosGet = jest.fn<() => Promise<unknown>>();

jest.unstable_mockModule("axios", () => ({
  default: { get: mockAxiosGet },
}));

const { performSearch } = await import(
  "../../../services/cifraclub/search-handler.js"
);

function makeJsonp(docs: object[]) {
  return {
    data: `x({"response":{"numFound":${docs.length},"start":0,"docs":${JSON.stringify(docs)}}})`,
  };
}

const ARTIST_DOC = { t: "1", m: "Oasis", a: "Oasis", d: "oasis" };
const SONG_DOC   = { t: "2", m: "Wonderwall", a: "Oasis", d: "oasis", u: "wonderwall" };

describe("CifraClub Search Handler", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("performSearch", () => {
    it("returns artists when searchType is ARTIST", async () => {
      mockAxiosGet.mockResolvedValue(makeJsonp([ARTIST_DOC, SONG_DOC]));

      const result = await performSearch("", "oasis", SEARCH_TYPES.ARTIST);

      expect(result).toEqual([
        { displayName: "Oasis", path: "oasis", songCount: null },
      ]);
    });

    it("returns songs when searchType is SONG", async () => {
      mockAxiosGet.mockResolvedValue(makeJsonp([ARTIST_DOC, SONG_DOC]));

      const result = await performSearch("", "oasis wonderwall", SEARCH_TYPES.SONG);

      expect(result).toEqual([
        { title: "Wonderwall", artist: "Oasis", path: "oasis/wonderwall" },
      ]);
    });

    it("returns songs when searchType is ARTIST_SONG", async () => {
      mockAxiosGet.mockResolvedValue(makeJsonp([SONG_DOC]));

      const result = await performSearch("", "oasis wonderwall", SEARCH_TYPES.ARTIST_SONG);

      expect(result).toEqual([
        { title: "Wonderwall", artist: "Oasis", path: "oasis/wonderwall" },
      ]);
    });

    it("returns empty array when no matching docs", async () => {
      mockAxiosGet.mockResolvedValue(makeJsonp([]));

      const result = await performSearch("", "xyznonexistent", SEARCH_TYPES.SONG);

      expect(result).toEqual([]);
    });

    it("passes query to JSONP endpoint", async () => {
      mockAxiosGet.mockResolvedValue(makeJsonp([]));

      await performSearch("", "guns n roses", SEARCH_TYPES.SONG);

      expect(mockAxiosGet).toHaveBeenCalledWith(
        "https://solr.sscdn.co/cc/h2/",
        { params: { q: "guns n roses", callback: "x" } }
      );
    });

    it("propagates network errors", async () => {
      mockAxiosGet.mockRejectedValue(new Error("Network Error"));

      await expect(
        performSearch("", "test", SEARCH_TYPES.ARTIST)
      ).rejects.toThrow("Network Error");
    });
  });
});
