import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the dependencies before importing the module under test
const mockPuppeteerService = {
  withPage: jest.fn(),
};

const mockExtractArtistSlug = jest.fn();
const mockExtractArtistSongs = jest.fn();

// Mock modules
jest.unstable_mockModule("../../../services/puppeteer.service", () => ({
  default: mockPuppeteerService,
}));

jest.unstable_mockModule("../../../utils/url-utils", () => ({
  extractArtistSlug: mockExtractArtistSlug,
}));

jest.unstable_mockModule("../../../utils/dom-extractors", () => ({
  extractArtistSongs: mockExtractArtistSongs,
}));

// Import the module after mocking
const { fetchArtistSongs } = await import(
  "../../../services/cifraclub/artist-songs-handler.js"
);

interface MockPage {
  goto: jest.Mock;
  evaluate: jest.Mock;
}

const mockPage: MockPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
};

describe("CifraClub Artist Songs Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPuppeteerService.withPage.mockImplementation(async (callback: unknown) => {
      return (callback as (page: MockPage) => Promise<unknown>)(mockPage);
    });
  });

  describe("fetchArtistSongs", () => {
    // Puppeteer integration tests moved to tests/integration/cifraclub-puppeteer.integration.test.js
    it('integration tests have been moved to separate file', () => {
      // The actual Puppeteer integration tests that were skipped here
      // have been moved to tests/integration/cifraclub-puppeteer.integration.test.js
      // for better organization and to avoid timeout issues
      expect(true).toBe(true);
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

    it.skip("should handle empty artist songs", async () => {
      // Moved to tests/integration/cifraclub-puppeteer.integration.test.js
    });

    it("should handle puppeteer errors", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const artistUrl = "https://www.cifraclub.com.br/oasis/";

      mockExtractArtistSlug.mockReturnValue("oasis");
      // Use eslint-disable to bypass TypeScript strictness for this mock
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPuppeteerService.withPage as any).mockRejectedValue(
        new Error("Page load failed")
      );

      await expect(fetchArtistSongs(baseUrl, artistUrl)).rejects.toThrow(
        "Page load failed"
      );
    });

    it.skip("should construct correct page URL with trailing slash", async () => {
      // Moved to tests/integration/cifraclub-puppeteer.integration.test.js
    });
  });
});
