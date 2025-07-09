import puppeteerService from "../puppeteer.service.js";
import logger from "../../utils/logger.js";
import { filterResults } from "../../utils/result-filters.js";
import { extractSearchResults } from "../../utils/dom-extractors.js";
import type { Artist } from "../../../shared/types/domain/artist.js";
import type { Song } from "../../../shared/types/domain/song.js";
import type { SearchType } from "../../../shared/types/search.js";
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

    logger.debug(`Found ${results.length} total results`);
    return filterResults(results as any, searchType);
  });
}
