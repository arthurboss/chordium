import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { ChordSheet } from "../../../shared/types/index.js";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockPuppeteerService.withPage as any).mockImplementation(async (callback: any) => {
      return callback(mockPage);
    });
  });

  describe("fetchChordSheet", () => {
    it.skip("should fetch chord sheet content successfully", async () => {
      const songUrl = "https://www.cifraclub.com.br/oasis/wonderwall/";
      const expectedChordSheet: ChordSheet = {
        title: "Wonderwall",
        artist: "Oasis",
        songChords: "[C] Today is gonna be the [G] day that they're gonna [Am] throw it back to [F] you",
        songKey: "",
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPage.evaluate as any).mockResolvedValue(expectedChordSheet);

      const result = await fetchChordSheet(songUrl);

      expect(mockPage.goto).toHaveBeenCalledWith(songUrl, {
        waitUntil: "networkidle2",
      });
      expect(mockPage.evaluate).toHaveBeenCalledWith(mockExtractChordSheet);
      expect(result).toEqual(expectedChordSheet);
      expect(result).toHaveProperty('songChords');
      expect(result).toHaveProperty('songKey');
      expect(result).toHaveProperty('guitarTuning');
      expect(result).toHaveProperty('guitarCapo');
    });

    it.skip("should handle empty chord sheet", async () => {
      const songUrl = "https://www.cifraclub.com.br/empty/song/";
      const emptyChordSheet: ChordSheet = {
        title: "Empty Song",
        artist: "Unknown Artist",
        songChords: "",
        songKey: "",
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPage.evaluate as any).mockResolvedValue(emptyChordSheet);

      const result = await fetchChordSheet(songUrl);

      expect(result).toEqual(emptyChordSheet);
    });

    it.skip("should handle URLs from different domains", async () => {
      const songUrl =
        "https://ultimate-guitar.com/tab/oasis/wonderwall-chords-1234";
      const expectedChordSheet: ChordSheet = {
        title: "Wonderwall",
        artist: "Oasis",
        songChords: "Chord sheet from different site",
        songKey: "",
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPage.evaluate as any).mockResolvedValue(expectedChordSheet);

      const result = await fetchChordSheet(songUrl);

      expect(mockPage.goto).toHaveBeenCalledWith(songUrl, {
        waitUntil: "networkidle2",
      });
      expect(result).toEqual(expectedChordSheet);
    });

    it("should handle puppeteer errors", async () => {
      const songUrl = "https://www.cifraclub.com.br/oasis/wonderwall/";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPuppeteerService.withPage as any).mockRejectedValue(
        new Error("Network timeout")
      );

      await expect(fetchChordSheet(songUrl)).rejects.toThrow("Network timeout");
    });

    it.skip("should handle page evaluation errors", async () => {
      const songUrl = "https://www.cifraclub.com.br/oasis/wonderwall/";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPage.evaluate as any).mockRejectedValue(new Error("Element not found"));

      await expect(fetchChordSheet(songUrl)).rejects.toThrow(
        "Element not found"
      );
    });

    it.skip("should work with complex chord sheet content", async () => {
      const songUrl = "https://www.cifraclub.com.br/complex/song/";
      const complexChordSheet: ChordSheet = {
        title: "Complex Song",
        artist: "Test Artist",
        songChords: `[Intro]
[C] [G] [Am] [F]

[Verse 1]
[C] Today is gonna be the [G] day
That they're gonna [Am] throw it back to [F] you
[C] By now you should've some[G]how
Realized what you [Am] gotta [F] do

[Chorus]
I don't believe that [C] anybody [G] feels
The way I [Am] do about you [F] now`,
        songKey: "",
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockPage.evaluate as any).mockResolvedValue(complexChordSheet);

      const result = await fetchChordSheet(songUrl);

      expect(result).toEqual(complexChordSheet);
    });
  });
});
