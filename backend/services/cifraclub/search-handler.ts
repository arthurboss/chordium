import puppeteerService from "../puppeteer.service.js";
import logger from "../../utils/logger.js";
import { filterResults } from "../../utils/result-filters.js";
import { extractSearchResults } from "../../utils/dom-extractors.js";
import type { Artist, Song, SearchType } from '@chordium/types';
import type { Page } from 'puppeteer';

/**
 * Handles CifraClub search operations (simplified version without pagination)
 */
export async function performSearch(
  baseUrl: string, 
  query: string, 
  searchType: SearchType
): Promise<Artist[] | Song[]> {
  const searchUrl = `${baseUrl}/?q=${encodeURIComponent(query)}`;
  logger.info(`Searching CifraClub for: ${query} (Type: ${searchType})`);

  return puppeteerService.withPage(async (page: Page) => {
    await page.goto(searchUrl, { waitUntil: "networkidle2" });
    logger.debug("Search page loaded, extracting results...");

    const results = await page.evaluate(extractSearchResults);
    logger.info(`[DATA SOURCE] Scraping (CifraClub search)`);
    logger.info(`[SCRAPED ELEMENTS] ${JSON.stringify(results)}`);

    logger.debug(`Found ${results.length} total results`);
    // Filter twice: once before and once after transformation for absolute safety
    const filtered = filterResults(results as any, searchType);
    // If song, double-check all returned objects have valid paths (2 segments, not 'letra')
    // Defensive: check for song search type using backend enum/constants
    const searchTypeStr = String(searchType).toLowerCase();
    if (searchTypeStr === 'song') {
      // Defensive: filter Song objects by path segments and 'letra' exclusion
      return (filtered as Song[]).filter(song => {
        if (!song.path) return false;
        const segments = song.path.split('/').filter(Boolean);
        if (segments.length !== 2) return false;
        if (segments[1].toLowerCase() === 'letra') return false;
        return true;
      });
    }
    return filtered;
  });
}
