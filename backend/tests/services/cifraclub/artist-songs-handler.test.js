import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the dependencies before importing the module under test
const mockPuppeteerService = {
  withPage: jest.fn(),
};

const mockExtractArtistSlug = jest.fn();
const mockExtractArtistSongs = jest.fn();

// Mock modules
jest.unstable_mockModule("../../../services/puppeteer.service.js", () => ({
  default: mockPuppeteerService,
}));

jest.unstable_mockModule("../../../utils/url-utils.js", () => ({
  extractArtistSlug: mockExtractArtistSlug,
}));

jest.unstable_mockModule("../../../utils/dom-extractors.js", () => ({
  extractArtistSongs: mockExtractArtistSongs,
}));

// Import the module after mocking
const { fetchArtistSongs } = await import(
  "../../../services/cifraclub/artist-songs-handler.js"
);

const mockPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
};

describe("CifraClub Artist Songs Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPuppeteerService.withPage.mockImplementation(async (callback) => {
      return callback(mockPage);
    });
  });

  describe("fetchArtistSongs", () => {
    it("should fetch artist songs successfully", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const artistUrl = "https://www.cifraclub.com.br/oasis/";
      const expectedSongs = [
        {
          title: "Wonderwall",
          path: "oasis/wonderwall",
          artist: "Oasis",
        },
        {
          title: "Don't Look Back in Anger",
          path: "oasis/dont-look-back-in-anger",
          artist: "Oasis",
        },
      ];

      mockExtractArtistSlug.mockReturnValue("oasis");
      mockPage.evaluate.mockResolvedValue(expectedSongs);

      const result = await fetchArtistSongs(baseUrl, artistUrl);

      expect(mockExtractArtistSlug).toHaveBeenCalledWith(artistUrl);
      expect(mockPage.goto).toHaveBeenCalledWith(
        "https://www.cifraclub.com.br/oasis/",
        { waitUntil: "networkidle2" }
      );
      expect(mockPage.evaluate).toHaveBeenCalledWith(mockExtractArtistSongs);
      expect(result).toEqual(expectedSongs);
    });

    it("should throw error for invalid artist URL", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const artistUrl = "invalid-url";

      mockExtractArtistSlug.mockReturnValue(null);

      await expect(fetchArtistSongs(baseUrl, artistUrl)).rejects.toThrow(
        "Invalid artist URL"
      );

      expect(mockPage.goto).not.toHaveBeenCalled();
      expect(mockPage.evaluate).not.toHaveBeenCalled();
    });

    it("should handle empty artist songs", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const artistUrl = "https://www.cifraclub.com.br/empty-artist/";

      mockExtractArtistSlug.mockReturnValue("empty-artist");
      mockPage.evaluate.mockResolvedValue([]);

      const result = await fetchArtistSongs(baseUrl, artistUrl);

      expect(result).toEqual([]);
    });

    it("should handle puppeteer errors", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const artistUrl = "https://www.cifraclub.com.br/oasis/";

      mockExtractArtistSlug.mockReturnValue("oasis");
      mockPuppeteerService.withPage.mockRejectedValue(
        new Error("Page load failed")
      );

      await expect(fetchArtistSongs(baseUrl, artistUrl)).rejects.toThrow(
        "Page load failed"
      );
    });

    it("should construct correct page URL with trailing slash", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const artistUrl = "https://www.cifraclub.com.br/radiohead/";

      mockExtractArtistSlug.mockReturnValue("radiohead");
      mockPage.evaluate.mockResolvedValue([]);

      await fetchArtistSongs(baseUrl, artistUrl);

      expect(mockPage.goto).toHaveBeenCalledWith(
        "https://www.cifraclub.com.br/radiohead/",
        { waitUntil: "networkidle2" }
      );
    });
  });
});
