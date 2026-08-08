import puppeteer from 'puppeteer';

interface LyricsFetchResult {
  original?: string;
  translated?: string;
}

/**
 * Fetches lyrics from CifraClub with cascade:
 * 1. Print page (letra/imprimir.html) - lighter, cleaner markup
 * 2. Regular page with ?translation=off - original lyrics only
 * 3. Regular page - may include translation
 */
async function fetchLyricsFromCifraClub(
  basePath: string,
  browser: puppeteer.Browser
): Promise<LyricsFetchResult> {
  const result: LyricsFetchResult = {};

  const routes = [
    { url: `https://www.cifraclub.com.br${basePath}letra/imprimir.html`, type: 'original', timeout: 8000 },
    { url: `https://www.cifraclub.com.br${basePath}letra/?translation=off`, type: 'original', timeout: 10000 },
    { url: `https://www.cifraclub.com.br${basePath}letra/`, type: 'both', timeout: 15000 },
  ];

  for (const route of routes) {
    try {
      const page = await browser.newPage();
      page.setDefaultTimeout(route.timeout);
      page.setDefaultNavigationTimeout(route.timeout);

      await page.goto(route.url, { waitUntil: 'domcontentloaded' });
      
      // Extract lyrics - look for common CifraClub selectors
      const lyrics = await page.evaluate(() => {
        const lyricElement = 
          document.querySelector('.lyric') ||
          document.querySelector('[data-component="Lyrics"]') ||
          document.querySelector('.cnb-lyric') ||
          document.querySelector('pre');

        if (!lyricElement) return null;
        
        return lyricElement.innerText?.trim() || null;
      });

      await page.close();

      if (lyrics) {
        if (route.type === 'original') {
          result.original = lyrics;
        } else if (route.type === 'both' && !result.original) {
          result.original = lyrics;
        }
        // If we have the original, stop cascading
        if (result.original) break;
      }
    } catch (error) {
      // Continue to next route on error
      continue;
    }
  }

  // If we got lyrics and the last successful route included translation parameter off, try translated version
  if (result.original && !result.translated) {
    try {
      const page = await browser.newPage();
      page.setDefaultTimeout(10000);

      await page.goto(`https://www.cifraclub.com.br${basePath}letra/`, { waitUntil: 'domcontentloaded' });
      
      const translated = await page.evaluate(() => {
        // CifraClub may have a separate translated lyrics section or toggle
        const translatedElement = 
          document.querySelector('[data-translated="true"]') ||
          document.querySelector('.translated-lyric');

        return translatedElement?.innerText?.trim() || null;
      });

      if (translated) {
        result.translated = translated;
      }

      await page.close();
    } catch (error) {
      // Translated fetch is optional, don't fail on it
    }
  }

  return result;
}

export { fetchLyricsFromCifraClub, type LyricsFetchResult };
