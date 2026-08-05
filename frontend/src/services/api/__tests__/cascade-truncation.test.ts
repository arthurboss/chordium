import { describe, it, expect, vi } from "vitest";
import { fetchPreferredChordSheet, type PageLike } from "@chordium/scraping";

/**
 * Regression tests for the silent song-truncation bug.
 *
 * The source's print pages are fully server-rendered, but they also load a
 * script that paginates the sheet to the paper size and deletes the overflow
 * from the DOM. The cascade used to wait 1s after `domcontentloaded`, giving
 * that script time to run, so extraction read the already-trimmed DOM and
 * returned a truncated song with no error anywhere.
 *
 * It was environment-dependent: extraction raced the script, so slower
 * networks happened to win and fast ones (serverless) lost.
 */

const BASE = "https://www.cifraclub.com.br/oficina-g3/incondicional";
const SIMPLIFIED_URL = `${BASE}/simplificada/imprimir.html`;

const COMPLETE = "[Intro] D  C9\nfull song body\nRefrão 2x:";
const TRIMMED = "[Intro] D  C9\nfull so";

/**
 * Fake page that mimics the source: content is complete on load, but a
 * "pagination script" trims it once scripts are allowed to run.
 */
function createFakePage() {
  let currentUrl = "";
  let jsEnabled = true;
  const page: PageLike = {
    async goto(url: string) {
      currentUrl = url;
      return null;
    },
    url: () => currentUrl,
    setDefaultNavigationTimeout: vi.fn(),
    async setJavaScriptEnabled(enabled: boolean) {
      jsEnabled = enabled;
    },
    async evaluate() {
      return {
        // With scripts running, the source trims the sheet.
        songChords: jsEnabled ? TRIMMED : COMPLETE,
        title: "Incondicional",
        artist: "Oficina G3",
        songKey: "C",
        guitarTuning: ["E", "A", "D", "G", "B", "E"],
        guitarCapo: 0,
      } as never;
    },
  };
  return page;
}

describe("fetchPreferredChordSheet — source pagination script", () => {
  it("disables JavaScript so the source cannot trim the sheet", async () => {
    const page = createFakePage();
    const spy = vi.spyOn(page, "setJavaScriptEnabled");

    await fetchPreferredChordSheet(page, BASE);

    expect(spy).toHaveBeenCalledWith(false);
  });

  it("returns the complete song rather than the paginated excerpt", async () => {
    const page = createFakePage();

    const result = await fetchPreferredChordSheet(page, BASE);

    expect(result.data.songChords).toBe(COMPLETE);
    expect(result.data.songChords).not.toBe(TRIMMED);
  });

  it("disables scripts before navigating, not after", async () => {
    const page = createFakePage();
    const order: string[] = [];
    vi.spyOn(page, "setJavaScriptEnabled").mockImplementation(async () => {
      order.push("setJavaScriptEnabled");
    });
    vi.spyOn(page, "goto").mockImplementation(async (url: string) => {
      order.push("goto");
      vi.spyOn(page, "url").mockReturnValue(url);
      return null;
    });

    await fetchPreferredChordSheet(page, BASE);

    expect(order.indexOf("setJavaScriptEnabled")).toBeLessThan(order.indexOf("goto"));
  });

  it("still extracts when the page cannot toggle JavaScript", async () => {
    const page = createFakePage();
    delete (page as Partial<PageLike>).setJavaScriptEnabled;

    const result = await fetchPreferredChordSheet(page, BASE);

    expect(result.data.songChords.length).toBeGreaterThan(0);
  });

  it("resolves the simplified variant for a reachable song", async () => {
    const page = createFakePage();
    vi.spyOn(page, "url").mockReturnValue(SIMPLIFIED_URL);

    const result = await fetchPreferredChordSheet(page, BASE);

    expect(result.variant).toBe("simplified");
    expect(result.hasTabs).toBe(false);
  });
});
