import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the dependencies before importing the module under test
const mockPuppeteerService = {
  withPage: jest.fn(),
};

const mockFilterResults = jest.fn();
const mockExtractSearchResults = jest.fn();

// Mock modules
jest.unstable_mockModule("../../../services/puppeteer.service.js", () => ({
  default: mockPuppeteerService,
}));

jest.unstable_mockModule("../../../utils/result-filters.js", () => ({
  filterResults: mockFilterResults,
}));

jest.unstable_mockModule("../../../utils/dom-extractors.js", () => ({
  extractSearchResults: mockExtractSearchResults,
}));

// Import the module after mocking
const { performSearch } = await import(
  "../../../services/cifraclub/search-handler.js"
);

const mockPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
};

describe("CifraClub Search Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPuppeteerService.withPage.mockImplementation(async (callback) => {
      return callback(mockPage);
    });
  });

  describe("performSearch", () => {
    it("should perform search and return filtered results", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const query = "oasis";
      const searchType = "ARTIST";

      const mockRawResults = [
        {
          title: "Oasis - Cifra Club",
          url: "https://www.cifraclub.com.br/oasis/",
        },
      ];
      const mockFilteredResults = [
        { displayName: "Oasis", path: "oasis", songCount: null },
      ];

      mockPage.evaluate.mockResolvedValue(mockRawResults);
      mockFilterResults.mockReturnValue(mockFilteredResults);

      const result = await performSearch(baseUrl, query, searchType);

      expect(mockPage.goto).toHaveBeenCalledWith(
        "https://www.cifraclub.com.br/?q=oasis",
        { waitUntil: "networkidle2" }
      );
      expect(mockPage.evaluate).toHaveBeenCalledWith(mockExtractSearchResults);
      expect(mockFilterResults).toHaveBeenCalledWith(
        mockRawResults,
        searchType
      );
      expect(result).toEqual(mockFilteredResults);
    });

    it("should encode special characters in query", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const query = "guns n' roses";
      const searchType = "ARTIST";

      mockPage.evaluate.mockResolvedValue([]);
      mockFilterResults.mockReturnValue([]);

      await performSearch(baseUrl, query, searchType);

      expect(mockPage.goto).toHaveBeenCalledWith(
        "https://www.cifraclub.com.br/?q=guns%20n'%20roses",
        { waitUntil: "networkidle2" }
      );
    });

    it("should handle empty search results", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const query = "nonexistent";
      const searchType = "ARTIST";

      mockPage.evaluate.mockResolvedValue([]);
      mockFilterResults.mockReturnValue([]);

      const result = await performSearch(baseUrl, query, searchType);

      expect(result).toEqual([]);
      expect(mockFilterResults).toHaveBeenCalledWith([], searchType);
    });

    it("should handle puppeteer errors", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const query = "test";
      const searchType = "ARTIST";

      mockPuppeteerService.withPage.mockRejectedValue(
        new Error("Navigation failed")
      );

      await expect(performSearch(baseUrl, query, searchType)).rejects.toThrow(
        "Navigation failed"
      );
    });
  });
});
