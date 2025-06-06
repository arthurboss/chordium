import puppeteerService from "../puppeteer.service.js";
import logger from "../../utils/logger.js";
import { filterResults } from "../../utils/result-filters.js";
import { extractSearchResults } from "../../utils/dom-extractors.js";

/**
 * Handles CifraClub search operations
 * @param {string} baseUrl - The CifraClub base URL
 * @param {string} query - Search query
 * @param {string} searchType - Type of search (ARTIST, SONG, etc.)
 * @returns {Promise<Array>} - Array of search results
 */
export async function performSearch(baseUrl, query, searchType) {
  const searchUrl = `${baseUrl}/?q=${encodeURIComponent(query)}`;
  logger.info(`Searching CifraClub for: ${query} (Type: ${searchType})`);

  return puppeteerService.withPage(async (page) => {
    await page.goto(searchUrl, { waitUntil: "networkidle2" });
    logger.debug("Search page loaded, extracting results...");

    const results = await page.evaluate(extractSearchResults);

    logger.debug(`Found ${results.length} total results`);
    return filterResults(results, searchType);
  });
}
