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
 * The regular route tags every line with data-original and data-translation,
 * so both versions are read straight from those attributes. Doing it by
 * attribute rather than by reading the rendered text matters because the lines
 * are laid out across more than one container, and it removes the need to guess
 * at an alternating pattern.
 *
 * Print pages carry no translation and expose the lyrics in a <pre>, which is
 * the fallback when no tagged lines are present.
 */
function extractLyrics(): ExtractedLyrics | null {
  const pairs = Array.from(document.querySelectorAll("span[data-original]"));
  if (pairs.length) {
    const originals: string[] = [];
    const translations: string[] = [];

    for (const originalSpan of pairs) {
      const line = originalSpan.textContent?.trim();
      if (!line) continue;
      originals.push(line);
      // The sibling carries the same line translated; absent on untranslated pages.
      const translatedSpan = originalSpan.parentElement?.querySelector("span[data-translation]");
      const translated = translatedSpan?.textContent?.trim();
      if (translated) translations.push(translated);
    }

    if (originals.length) {
      return {
        original: originals.join("\n"),
        // Only offer a translation when every line has one, so a partially
        // translated page cannot silently drop verses.
        translated: translations.length === originals.length ? translations.join("\n") : undefined,
      };
    }
  }

  const pre = document.querySelector("pre");
  const text = (pre as HTMLElement | null)?.innerText?.trim();
  return text ? { original: text } : null;
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
    // Print pages ship a pagination script that deletes overflow content from
    // the DOM, which silently truncates the lyrics.
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
 * Fetches a song's lyrics, cascading: print page, then the no-translation
 * route. The regular route is always visited last because it is the only one
 * carrying the translation, and it doubles as the fallback for the original
 * when the earlier routes yield nothing.
 */
export async function fetchLyrics(
  page: PageLike,
  baseUrl: string,
  logger?: (msg: string) => void
): Promise<LyricsResult> {
  const base = baseUrl.replace(/\/+$/, "");

  // The regular route is tried first because it is the only one carrying the
  // translation; the print page is a lighter fallback for the original alone.
  const routes = [
    { url: `${base}/letra/`, timeout: 15000 },
    { url: `${base}/letra/imprimir.html`, timeout: 8000 },
  ];

  const result: LyricsResult = {};
  for (const route of routes) {
    const found = await tryLoadLyrics(page, route.url, route.timeout, logger);
    if (found) {
      result.original = found.original;
      if (found.translated) result.translated = found.translated;
      break;
    }
  }

  return result;
}
