import type { PageLike } from "./cascade";

export interface LyricsResult {
  original?: string;
  translated?: string;
}

/**
 * Lyric text plus its translation when the page carries one.
 */
interface ExtractedLyrics {
  original: string;
  translated?: string;
}

/**
 * Pulls lyrics out of a source page.
 *
 * On the regular route everything lives inside a single container the source
 * marks with data-chord-container, so the search is scoped to it rather than to
 * the whole document. That matters because the page also carries unrelated
 * paragraphs, such as the app store notice, which would otherwise be picked up
 * as the lyrics. Scoping also means the number of wrappers the lines happen to
 * be nested in does not matter.
 *
 * Within it, each line of a translated song is tagged with data-original and
 * data-translation, so both versions are read straight from those tags instead
 * of guessing at an alternating pattern. Songs without a translation carry
 * their lines as plain paragraphs, which is the second case below.
 *
 * Either way the lines are grouped by the paragraph holding them, which is what
 * separates one section of a song from the next, and the groups are rejoined
 * with a blank line so that structure survives.
 *
 * Without that container there is nothing to read, so extraction stops rather
 * than searching the page at large and mistaking interface text for lyrics.
 */
function extractLyrics(): ExtractedLyrics | null {
  const container = document.querySelector("[data-chord-container]");
  if (!container) return null;

  const join = (sections: string[][]) =>
    sections
      .map((lines) => lines.join("\n"))
      .filter((section) => section)
      .join("\n\n");

  const taggedLines = Array.from(container.querySelectorAll("span[data-original]"));
  if (taggedLines.length) {
    const originalSections: string[][] = [];
    const translatedSections: string[][] = [];
    let originalCount = 0;
    let translatedCount = 0;
    let currentParagraph: Element | null = null;

    for (const originalSpan of taggedLines) {
      const line = originalSpan.textContent?.trim();
      if (!line) continue;

      const paragraph = originalSpan.closest("p");
      if (paragraph !== currentParagraph) {
        currentParagraph = paragraph;
        originalSections.push([]);
        translatedSections.push([]);
      }

      originalSections[originalSections.length - 1].push(line);
      originalCount++;

      // The sibling carries the same line translated; absent on untranslated pages.
      const translatedSpan = originalSpan.parentElement?.querySelector("span[data-translation]");
      const translated = translatedSpan?.textContent?.trim();
      if (translated) {
        translatedSections[translatedSections.length - 1].push(translated);
        translatedCount++;
      }
    }

    const original = join(originalSections);
    if (original) {
      return {
        original,
        // Only offer a translation when every line has one, so a partially
        // translated page cannot silently drop verses.
        translated: translatedCount === originalCount ? join(translatedSections) : undefined,
      };
    }
  }

  // Untranslated songs: the lines sit in the container as plain paragraphs.
  const paragraphs = Array.from(container.querySelectorAll("p"))
    .map((paragraph) => (paragraph as HTMLElement).innerText ?? paragraph.textContent ?? "")
    .map((text) => text.split("\n").map((line) => line.trim()).filter((line) => line))
    .filter((lines) => lines.length);
  const fromParagraphs = join(paragraphs);
  if (fromParagraphs) return { original: fromParagraphs };

  return null;
}

/**
 * Loads a lyrics URL and returns its text, or null when the page redirected
 * away. A song with no lyrics page redirects to the artist or chord sheet
 * page, whose markup still yields paragraphs, so the redirect has to be
 * detected by URL or that content is mistaken for lyrics.
 */
async function tryLoadLyrics(
  page: PageLike,
  url: string,
  timeout: number,
  logger?: (msg: string) => void
): Promise<ExtractedLyrics | null> {
  try {
    page.setDefaultNavigationTimeout?.(timeout);
    // The source ships a script that trims content out of the DOM, which
    // silently truncates the lyrics.
    await page.setJavaScriptEnabled?.(false);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });

    if (!new URL(page.url()).pathname.includes("/letra")) {
      logger?.(`redirected from ${url} to ${page.url()} — no lyrics page`);
      return null;
    }

    const result = await page.evaluate(extractLyrics);
    if (!result?.original?.trim()) {
      logger?.(`${url} yielded no lyrics`);
      return null;
    }
    return result;
  } catch (error) {
    logger?.(`lyrics load failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Fetches a song's lyrics from the route that carries them. Only this route
 * wraps the song in the container the extraction relies on, and it is also the
 * only one offering a translation, so there is nothing to cascade to.
 */
export async function fetchLyrics(
  page: PageLike,
  baseUrl: string,
  logger?: (msg: string) => void
): Promise<LyricsResult> {
  const base = baseUrl.replace(/\/+$/, "");
  const found = await tryLoadLyrics(page, `${base}/letra/`, 15000, logger);
  if (!found) return {};

  return {
    original: found.original,
    ...(found.translated ? { translated: found.translated } : {}),
  };
}
