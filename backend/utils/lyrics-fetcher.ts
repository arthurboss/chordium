import type { Browser } from 'puppeteer';

interface LyricsFetchResult {
  original?: string;
  translated?: string;
}

/**
 * Pulls lyric text out of a CifraClub page. Print pages expose a <pre>;
 * the regular route renders paragraphs inside <article> under hashed class
 * names, so the paragraphs are joined rather than matched by selector.
 */
function extractLyricsInPage(): string | null {
  const pre = document.querySelector('pre');
  if (pre) {
    const text = (pre as HTMLElement).innerText?.trim();
    if (text) return text;
  }

  const article = document.querySelector('article');
  if (article) {
    const paragraphs = Array.from(article.querySelectorAll('p'))
      .map((p) => (p as HTMLElement).innerText?.trim())
      .filter((t): t is string => !!t && t.length > 20);
    if (paragraphs.length) return paragraphs.join('\n\n');
  }

  return null;
}

/**
 * The regular /letra/ route interleaves each translated line with its original
 * line. Splitting on that alternation recovers both versions; an odd or
 * unbalanced block means no translation exists, so it is left untouched.
 */
function splitInterleavedTranslation(text: string): { original: string; translated: string } | null {
  const blocks = text.split(/\n{2,}/);
  const originalBlocks: string[] = [];
  const translatedBlocks: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.trim());
    if (lines.length < 2 || lines.length % 2 !== 0) return null;
    const translated: string[] = [];
    const original: string[] = [];
    for (let i = 0; i < lines.length; i += 2) {
      translated.push(lines[i]);
      original.push(lines[i + 1]);
    }
    translatedBlocks.push(translated.join('\n'));
    originalBlocks.push(original.join('\n'));
  }

  if (!originalBlocks.length) return null;
  return { original: originalBlocks.join('\n\n'), translated: translatedBlocks.join('\n\n') };
}

/**
 * A song without a lyrics page redirects to the artist or chord sheet page,
 * whose markup still yields paragraphs (the song listing), so the redirect has
 * to be detected by URL or those links get stored as lyrics.
 */
function isLyricsPage(url: string): boolean {
  return url.includes('/letra');
}

async function fetchLyricsFromCifraClub(
  basePath: string,
  browser: Browser
): Promise<LyricsFetchResult> {
  const result: LyricsFetchResult = {};
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`;

  const routes = [
    { url: `https://www.cifraclub.com.br${base}letra/imprimir.html`, timeout: 8000 },
    { url: `https://www.cifraclub.com.br${base}letra/?translation=off`, timeout: 10000 },
  ];

  for (const route of routes) {
    let page;
    try {
      page = await browser.newPage();
      page.setDefaultTimeout(route.timeout);
      page.setDefaultNavigationTimeout(route.timeout);
      await page.goto(route.url, { waitUntil: 'domcontentloaded' });
      if (!isLyricsPage(page.url())) continue;
      const lyrics = await page.evaluate(extractLyricsInPage);
      if (lyrics) {
        result.original = lyrics;
        break;
      }
    } catch {
      // Try the next route in the cascade.
    } finally {
      await page?.close().catch(() => {});
    }
  }

  // The regular route carries the translation (interleaved with the original),
  // and doubles as the last-resort source when both routes above came up empty.
  let page;
  try {
    page = await browser.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    await page.goto(`https://www.cifraclub.com.br${base}letra/`, { waitUntil: 'domcontentloaded' });
    const combined = isLyricsPage(page.url()) ? await page.evaluate(extractLyricsInPage) : null;
    if (combined) {
      const split = splitInterleavedTranslation(combined);
      if (split) {
        result.translated = split.translated;
        if (!result.original) result.original = split.original;
      } else if (!result.original) {
        result.original = combined;
      }
    }
  } catch {
    // Translation is optional.
  } finally {
    await page?.close().catch(() => {});
  }

  return result;
}

export { fetchLyricsFromCifraClub, type LyricsFetchResult };
