import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the dependencies before importing the module under test
const mockPuppeteerService = {
  withPage: jest.fn(),
};

const mockExtractChordSheet = jest.fn();

// Mock modules
jest.unstable_mockModule("../../services/puppeteer.service.js", () => ({
  default: mockPuppeteerService,
}));

jest.unstable_mockModule("../../utils/dom-extractors.js", () => ({
  extractChordSheet: mockExtractChordSheet,
}));

// Import the module after mocking
const { fetchChordSheet } = await import("../../utils/chord-sheet-fetcher.js");

const mockPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
};

describe("Chord Sheet Fetcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPuppeteerService.withPage.mockImplementation(async (callback) => {
      return callback(mockPage);
    });
  });

  describe("fetchChordSheet", () => {
    it("should fetch chord sheet content successfully", async () => {
      const songUrl = "https://www.cifraclub.com.br/oasis/wonderwall/";
      const expectedContent =
        "[C] Today is gonna be the [G] day that they're gonna [Am] throw it back to [F] you";

      mockPage.evaluate.mockResolvedValue(expectedContent);

      const result = await fetchChordSheet(songUrl);

      expect(mockPage.goto).toHaveBeenCalledWith(songUrl, {
        waitUntil: "networkidle2",
      });
      expect(mockPage.evaluate).toHaveBeenCalledWith(mockExtractChordSheet);
      expect(result).toBe(expectedContent);
    });

    it("should handle empty chord sheet", async () => {
      const songUrl = "https://www.cifraclub.com.br/empty/song/";

      mockPage.evaluate.mockResolvedValue("");

      const result = await fetchChordSheet(songUrl);

      expect(result).toBe("");
    });

    it("should handle URLs from different domains", async () => {
      const songUrl =
        "https://ultimate-guitar.com/tab/oasis/wonderwall-chords-1234";
      const expectedContent = "Chord sheet from different site";

      mockPage.evaluate.mockResolvedValue(expectedContent);

      const result = await fetchChordSheet(songUrl);

      expect(mockPage.goto).toHaveBeenCalledWith(songUrl, {
        waitUntil: "networkidle2",
      });
      expect(result).toBe(expectedContent);
    });

    it("should handle puppeteer errors", async () => {
      const songUrl = "https://www.cifraclub.com.br/oasis/wonderwall/";

      mockPuppeteerService.withPage.mockRejectedValue(
        new Error("Network timeout")
      );

      await expect(fetchChordSheet(songUrl)).rejects.toThrow("Network timeout");
    });

    it("should handle page evaluation errors", async () => {
      const songUrl = "https://www.cifraclub.com.br/oasis/wonderwall/";

      mockPage.evaluate.mockRejectedValue(new Error("Element not found"));

      await expect(fetchChordSheet(songUrl)).rejects.toThrow(
        "Element not found"
      );
    });

    it("should work with complex chord sheet content", async () => {
      const songUrl = "https://www.cifraclub.com.br/complex/song/";
      const complexContent = `
[Intro]
[C] [G] [Am] [F]

[Verse 1]
[C] Today is gonna be the [G] day
That they're gonna [Am] throw it back to [F] you
[C] By now you should've some[G]how
Realized what you [Am] gotta [F] do

[Chorus]
I don't believe that [C] anybody [G] feels
The way I [Am] do about you [F] now
      `.trim();

      mockPage.evaluate.mockResolvedValue(complexContent);

      const result = await fetchChordSheet(songUrl);

      expect(result).toBe(complexContent);
    });
  });
});
