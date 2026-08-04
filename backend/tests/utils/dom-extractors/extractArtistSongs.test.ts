import { describe, it, expect } from "@jest/globals";
import { extractArtistSongs } from "../../../utils/dom-extractors.js";
import type { Song } from "../../../../shared/types/index.js";
import { cleanupDOM } from "./shared-setup.js";

/**
 * Tests for extractArtistSongs function
 * Validates extraction of artist songs from DOM (ol > li > a[href] on
 * /musicas.html) and the artist-name fallback chain: h2.t3 a -> page title
 * (both "Artist - Cifra Club" and "Artist | Todas as músicas" formats) -> URL slug.
 */

interface MockLink {
  href: string;
  primaryLabel?: string;
}

function mockLink({ href, primaryLabel }: MockLink) {
  return {
    getAttribute: (name: string) => (name === "href" ? href : null),
    querySelector: (selector: string) =>
      primaryLabel && selector === "p[class*='primaryLabel']"
        ? { textContent: primaryLabel }
        : null,
  };
}

function setupDOM(links: ReturnType<typeof mockLink>[], { artistElement = null as { textContent: string } | null, title = "", pathname = "/oasis/" } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).document = {
    querySelectorAll: (selector: string) => (selector === "ol li a[href]" ? links : []),
    querySelector: (selector: string) => (selector === "h2.t3 a" ? artistElement : null),
    title,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).window = {
    location: {
      origin: "https://www.cifraclub.com.br",
      pathname,
    },
  };
}

describe("extractArtistSongs", () => {
  cleanupDOM();

  it("extracts songs with title from the primaryLabel element and artist from h2.t3 a", () => {
    setupDOM(
      [
        mockLink({ href: "/oasis/wonderwall/", primaryLabel: "Wonderwall" }),
        mockLink({ href: "/oasis/dont-look-back-in-anger/", primaryLabel: "Don't Look Back in Anger" }),
      ],
      { artistElement: { textContent: "  Oasis  " } }
    );

    const results: Song[] = extractArtistSongs();

    expect(results).toEqual([
      { title: "Wonderwall", path: "oasis/wonderwall", artist: "Oasis" },
      { title: "Don't Look Back in Anger", path: "oasis/dont-look-back-in-anger", artist: "Oasis" },
    ]);
  });

  it("falls back to a slug-derived title when the primaryLabel element is missing", () => {
    setupDOM(
      [mockLink({ href: "/oasis/dont-look-back-in-anger/" })],
      { artistElement: { textContent: "Oasis" } }
    );

    const results: Song[] = extractArtistSongs();

    expect(results).toEqual([
      { title: "Dont Look Back In Anger", path: "oasis/dont-look-back-in-anger", artist: "Oasis" },
    ]);
  });

  it("skips entries whose path is not exactly two segments, is a /letra page, or ends in a numeric id", () => {
    setupDOM(
      [
        mockLink({ href: "/oasis/", primaryLabel: "Just the artist page" }),
        mockLink({ href: "/oasis/wonderwall/letra/", primaryLabel: "Wonderwall Lyrics" }),
        mockLink({ href: "/oasis/12345/", primaryLabel: "Numeric id" }),
        mockLink({ href: "/oasis/wonderwall/", primaryLabel: "Wonderwall" }),
      ],
      { artistElement: { textContent: "Oasis" } }
    );

    const results: Song[] = extractArtistSongs();

    expect(results).toEqual([{ title: "Wonderwall", path: "oasis/wonderwall", artist: "Oasis" }]);
  });

  it("falls back to page title in the 'Artist - Cifra Club' format when h2.t3 a is absent", () => {
    setupDOM([mockLink({ href: "/oasis/wonderwall/", primaryLabel: "Wonderwall" })], {
      title: "Oasis - Cifra Club",
    });

    const results: Song[] = extractArtistSongs();

    expect(results[0].artist).toBe("Oasis");
  });

  it("falls back to page title in the /musicas.html 'Artist | Todas as músicas' format when h2.t3 a is absent", () => {
    setupDOM([mockLink({ href: "/ac-dc/back-in-black/", primaryLabel: "Back In Black" })], {
      title: "AC/DC | Todas as músicas",
    });

    const results: Song[] = extractArtistSongs();

    expect(results[0].artist).toBe("AC/DC");
  });

  it("falls back to a title-cased URL slug when neither h2.t3 a nor the page title match", () => {
    setupDOM([mockLink({ href: "/ac-dc/back-in-black/", primaryLabel: "Back In Black" })], {
      title: "",
      pathname: "/ac-dc/",
    });

    const results: Song[] = extractArtistSongs();

    expect(results[0].artist).toBe("Ac Dc");
  });
});
