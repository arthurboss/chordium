import { describe, it, expect, vi } from "vitest";
import { fetchPreferredChordSheet, type PageLike } from "@chordium/scraping";

/**
 * Regression tests for the production truncation bug: in Vercel's serverless
 * network environment, `domcontentloaded` fired after only the first TCP
 * segment of the gzip-encoded response had been processed, leaving the chord
 * <pre> truncated mid-song. The extractor read that partial DOM and returned
 * it as if complete, so users saw songs cut off with no error anywhere.
 */

const BASE = "https://www.cifraclub.com.br/extreme/more-than-words";
const SIMPLIFIED_URL = `${BASE}/simplificada/imprimir.html`;
const FULL_URL = `${BASE}/imprimir.html`;

interface FakePageOptions {
  /** Per-URL: whether the response arrives complete, and what content to yield. */
  responses: Record<string, { complete: boolean; songChords: string }>;
}

function createFakePage({ responses }: FakePageOptions) {
  let currentUrl = "";
  const page: PageLike & { visited: string[] } = {
    visited: [],
    async goto(url: string) {
      currentUrl = url;
      page.visited.push(url);
      return null;
    },
    url: () => currentUrl,
    setDefaultNavigationTimeout: vi.fn(),
    async waitForFunction() {
      // Mirrors Puppeteer: rejects on timeout when the predicate never passes.
      if (!responses[currentUrl]?.complete) {
        throw new Error("Waiting failed: timeout exceeded");
      }
      return null;
    },
    async evaluate() {
      const res = responses[currentUrl];
      return {
        songChords: res?.songChords ?? "",
        title: "More Than Words",
        artist: "Extreme",
        songKey: "G",
        guitarTuning: ["E", "A", "D", "G", "B", "E"],
        guitarCapo: 0,
      } as never;
    },
  };
  return page;
}

describe("fetchPreferredChordSheet — partial response handling", () => {
  it("rejects a partially received response instead of returning truncated content", async () => {
    // Simplified route arrives truncated (the production failure); full route is intact.
    const page = createFakePage({
      responses: {
        [SIMPLIFIED_URL]: { complete: false, songChords: "[Intro] G  C9\nThat you love me\n" },
        [FULL_URL]: { complete: true, songChords: "[Intro] G  C9\n...full song...\n[Final]\nDone" },
      },
    });

    const result = await fetchPreferredChordSheet(page, BASE);

    // Must NOT return the truncated simplified content.
    expect(result.data.songChords).not.toContain("That you love me\n");
    // Should have cascaded onward to the intact route.
    expect(result.variant).toBe("full");
    expect(result.data.songChords).toContain("[Final]");
  });

  it("accepts content once the response is fully received", async () => {
    const page = createFakePage({
      responses: {
        [SIMPLIFIED_URL]: { complete: true, songChords: "[Intro] G  C9\n...whole simplified song..." },
      },
    });

    const result = await fetchPreferredChordSheet(page, BASE);

    expect(result.variant).toBe("simplified");
    expect(result.data.songChords).toContain("whole simplified song");
  });

  it("waits for completeness before extracting, not just for navigation", async () => {
    const page = createFakePage({
      responses: {
        [SIMPLIFIED_URL]: { complete: true, songChords: "[Intro] C\ncontent" },
      },
    });
    const waitSpy = vi.spyOn(page, "waitForFunction");

    await fetchPreferredChordSheet(page, BASE);

    expect(waitSpy).toHaveBeenCalled();
  });

  it("throws NOT_FOUND when every route yields only partial responses", async () => {
    const page = createFakePage({
      responses: {
        [SIMPLIFIED_URL]: { complete: false, songChords: "truncated" },
        [FULL_URL]: { complete: false, songChords: "truncated" },
        [`${BASE}/`]: { complete: false, songChords: "truncated" },
      },
    });

    await expect(fetchPreferredChordSheet(page, BASE)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("still works against a page object with no waitForFunction support", async () => {
    const page = createFakePage({
      responses: { [SIMPLIFIED_URL]: { complete: true, songChords: "[Intro] C\ncontent" } },
    });
    delete (page as Partial<PageLike>).waitForFunction;

    const result = await fetchPreferredChordSheet(page, BASE);

    expect(result.data.songChords).toContain("content");
  });
});
