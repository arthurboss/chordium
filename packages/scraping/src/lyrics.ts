import type { PageLike } from "./cascade";

export interface LyricsResult {
  original?: string;
  translated?: string;
}

/**
 * Pulls lyric text out of a source page. Print pages expose a <pre>; the
 * regular route renders paragraphs inside <article> under hashed class names,
 * so the paragraphs are joined rather than matched by selector.
 */
function extractLyrics(): string | null {
  const pre = document.querySelector("pre");
  if (pre) {
    const text = (pre as HTMLElement).textContent?.trim();
    if (text) return text;
  }

  const article = document.querySelector("article");
  if (article) {
    const paragraphs = Array.from(article.querySelectorAll("p"))
      .map((p) => (p as HTMLElement).textContent?.trim())
      .filter((t): t is string => !!t && t.length > 20);
    if (paragraphs.length) return paragraphs.join("\n\n");
  }

  return null;
}

/**
 * The regular route interleaves each translated line with its original line.
 * Splitting on that alternation recovers both versions; an odd or unbalanced
 * block means there is no translation, so it is left untouched.
 */
function splitInterleavedTranslation(
  text: string
): { original: string; translated: string } | null {
  const blocks = text.split(/\n{2,}/);
  const originalBlocks: string[] = [];
  const translatedBlocks: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length < 2 || lines.length % 2 !== 0) return null;
    const translated: string[] = [];
    const original: string[] = [];
    for (let i = 0; i < lines.length; i += 2) {
      translated.push(lines[i]);
      original.push(lines[i + 1]);
    }
    translatedBlocks.push(translated.join("\n"));
    originalBlocks.push(original.join("\n"));
  }

  if (!originalBlocks.length) return null;
  return {
    original: originalBlocks.join("\n\n"),
    translated: translatedBlocks.join("\n\n"),
  };
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
): Promise<string | null> {
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

    const text = await page.evaluate(extractLyrics);
    if (!text?.trim()) {
      logger?.(`${url} yielded no lyrics`);
      return null;
    }
    return text;
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
  const result: LyricsResult = {};

  const routes = [
    { url: `${base}/letra/imprimir.html`, timeout: 8000 },
    { url: `${base}/letra/?translation=off`, timeout: 10000 },
  ];

  for (const route of routes) {
    const text = await tryLoadLyrics(page, route.url, route.timeout, logger);
    if (text) {
      result.original = text;
      break;
    }
  }

  const combined = await tryLoadLyrics(page, `${base}/letra/`, 15000, logger);
  if (combined) {
    const split = splitInterleavedTranslation(combined);
    if (split) {
      result.translated = split.translated;
      if (!result.original) result.original = split.original;
    } else if (!result.original) {
      result.original = combined;
    }
  }

  return result;
}
