import { describe, it, expect } from "@jest/globals";
import { extractArtistSongs } from "../../../utils/dom-extractors.js";
import type { Song } from "../../../../shared/types/index.js";
import { mockDocument, cleanupDOM } from "./shared-setup.js";

/**
 * Tests for extractArtistSongs function
 * Validates extraction of artist songs from DOM with deduplication and proper artist information
 */

describe("extractArtistSongs", () => {
  cleanupDOM();

  it("should extract artist songs and deduplicate with artist information", () => {
    const mockLinks = [
      {
        textContent: "  Wonderwall  ",
        href: "https://www.cifraclub.com.br/oasis/wonderwall/",
      },
      {
        textContent: "Don't Look Back in Anger",
        href: "https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/",
      },
      {
        textContent: "  Wonderwall  ", // Duplicate
        href: "https://www.cifraclub.com.br/oasis/wonderwall/",
      },
    ];

    mockDocument((selector: string) => {
      if (selector === "a.art_music-link") {
        return mockLinks;
      }
      return [];
    }, "Oasis - Cifra Club");

    const results: Song[] = extractArtistSongs();

    expect(results).toEqual([
      { title: "Wonderwall", path: "oasis/wonderwall", artist: "Oasis" },
      {
        title: "Don't Look Back in Anger",
        path: "oasis/dont-look-back-in-anger",
        artist: "Oasis",
      },
    ]);
  });

  it("should handle songs with multiple spaces in title", () => {
    const mockLinks = [
      {
        textContent: "Don't   Look    Back   in   Anger",
        href: "https://www.cifraclub.com.br/oasis/dont-look-back-in-anger/",
      },
    ];

    mockDocument((selector: string) => {
      if (selector === "a.art_music-link") {
        return mockLinks;
      }
      return [];
    }, "Oasis - Cifra Club");

    const results: Song[] = extractArtistSongs();

    expect(results).toEqual([
      {
        title: "Don't Look Back in Anger",
        path: "oasis/dont-look-back-in-anger",
        artist: "Oasis",
      },
    ]);
  });

  it("should extract artist from URL pathname when title is not available", () => {
    const mockLinks = [
      {
        textContent: "Song Title",
        href: "https://www.cifraclub.com.br/ac-dc/song-title/",
      },
    ];

    // Mock with no title, so it should fallback to URL extraction
    mockDocument((selector: string) => {
      if (selector === "a.art_music-link") {
        return mockLinks;
      }
      return [];
    }, "");

    // Update the pathname for this test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window.location.pathname = "/ac-dc/";

    const results: Song[] = extractArtistSongs();

    expect(results).toEqual([
      { title: "Song Title", path: "ac-dc/song-title", artist: "Ac Dc" },
    ]);
  });
});
