import puppeteerService from "../puppeteer.service.js";
import logger from "../../utils/logger.js";
import { filterResults } from "../../utils/result-filters.js";
import { extractSearchResults } from "../../utils/dom-extractors.js";
import type { Artist } from "../../../shared/types/domain/artist.js";
import type { Song } from "../../../shared/types/domain/song.js";
import type { SearchType } from "../../../shared/types/search.js";
import type { Page } from 'puppeteer';

/**
 * Handles CifraClub search operations with pagination support
 */
export async function performSearch(
  baseUrl: string, 
  query: string, 
  searchType: SearchType
): Promise<Artist[] | Song[]> {
  const searchUrl = `${baseUrl}/?q=${encodeURIComponent(query)}`;
  logger.info(`Searching CifraClub for: ${query} (Type: ${searchType})`);

  return puppeteerService.withPage(async (page: Page) => {
    let allResults: any[] = [];
    let currentPage = 1;
    const maxPages = 3; // Limit to first 3 pages to avoid infinite loops
    
    // Load initial search page
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
    
    while (currentPage <= maxPages) {
      logger.debug(`Extracting results from page ${currentPage}`);
      
      try {
        // Wait a moment for the search results to load
        await page.waitForSelector('.gsc-result', { timeout: 10000 });
        
        const pageResults = await page.evaluate(extractSearchResults);
        logger.debug(`Found ${pageResults.length} results on page ${currentPage}`);
        
        if (pageResults.length === 0) {
          logger.debug(`No results on page ${currentPage}, stopping pagination`);
          break;
        }
        
        allResults = allResults.concat(pageResults);
        
        // Check if we have good results for songs (2-segment paths)
        if (searchType === 'song') {
          const validSongResults = pageResults.filter(result => {
            const pathSegments = result.path.split('/').filter(Boolean);
            return pathSegments.length === 2;
          });
          
          if (validSongResults.length > 0) {
            logger.info(`Found ${validSongResults.length} valid chord sheet URLs on page ${currentPage}, using these results`);
            break; // We found chord sheets, no need to continue
          }
        }
        
        // Check if there's a next page using Google Custom Search pagination
        const hasNextPage = await page.evaluate((pageNum) => {
          const cursor = document.querySelector('.gsc-cursor');
          if (!cursor) return false;
          
          // Look for the next page number
          const nextPageSelector = `.gsc-cursor-page[aria-label="Page ${pageNum + 1}"]`;
          const nextPageButton = cursor.querySelector(nextPageSelector);
          
          return nextPageButton !== null;
        }, currentPage);
        
        if (!hasNextPage) {
          logger.debug(`No page ${currentPage + 1} found, stopping pagination`);
          break;
        }
        
        // Click on the next page
        logger.debug(`Clicking to page ${currentPage + 1}`);
        await page.evaluate((pageNum) => {
          const cursor = document.querySelector('.gsc-cursor');
          if (cursor) {
            const nextPageSelector = `.gsc-cursor-page[aria-label="Page ${pageNum + 1}"]`;
            const nextPageButton = cursor.querySelector(nextPageSelector) as HTMLElement;
            if (nextPageButton) {
              nextPageButton.click();
            }
          }
        }, currentPage);
        
        // Wait for the new page to load
        await page.waitForFunction(
          (pageNum) => {
            const currentPageElement = document.querySelector('.gsc-cursor-current-page');
            return currentPageElement && currentPageElement.textContent?.trim() === String(pageNum + 1);
          },
          { timeout: 10000 },
          currentPage
        );
        
        currentPage++;
        
        // Small delay between pages to be respectful
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        logger.warn(`Error on page ${currentPage}:`, error);
        break;
      }
    }

    logger.info(`Scraped ${currentPage} pages, found ${allResults.length} total results`);
    return filterResults(allResults, searchType);
  });
}
