import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import SEARCH_TYPES from "../../../constants/searchTypes.js";

// Mock interfaces for TypeScript typing
interface MockPage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goto: jest.MockedFunction<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evaluate: jest.MockedFunction<any>;
}

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

const mockPage: MockPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
};

describe("CifraClub Search Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockPuppeteerService.withPage.mockImplementation(async (callback: any) => {
      return callback(mockPage);
    });
  });

  describe("performSearch", () => {
    it("should perform search and return filtered results", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const query = "oasis";
      const searchType = SEARCH_TYPES.ARTIST;

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
      const searchType = SEARCH_TYPES.ARTIST;

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
      const searchType = SEARCH_TYPES.ARTIST;

      mockPage.evaluate.mockResolvedValue([]);
      mockFilterResults.mockReturnValue([]);

      const result = await performSearch(baseUrl, query, searchType);

      expect(result).toEqual([]);
      expect(mockFilterResults).toHaveBeenCalledWith([], searchType);
    });

    it("should handle puppeteer errors", async () => {
      const baseUrl = "https://www.cifraclub.com.br";
      const query = "test";
      const searchType = SEARCH_TYPES.ARTIST;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPuppeteerService.withPage as any).mockRejectedValue(
        new Error("Navigation failed")
      );

      await expect(performSearch(baseUrl, query, searchType)).rejects.toThrow(
        "Navigation failed"
      );
    });
  });
});
