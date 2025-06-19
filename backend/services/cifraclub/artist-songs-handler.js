import puppeteerService from "../puppeteer.service.js";
import logger from "../../utils/logger.js";
import { extractArtistSlug } from "../../utils/url-utils.js";
import { extractArtistSongs } from "../../utils/dom-extractors.js";

/**
 * Handles fetching songs for a specific artist from CifraClub
 * @param {string} baseUrl - The CifraClub base URL
 * @param {string} artistUrl - The artist URL
 * @returns {Promise<Array>} - Array of artist songs
 */
export async function fetchArtistSongs(baseUrl, artistUrl) {
  const artistSlug = extractArtistSlug(artistUrl);
  if (!artistSlug) {
    throw new Error("Invalid artist URL");
  }

  const pageUrl = `${baseUrl}/${artistSlug}/`;
  logger.info(`Fetching songs for artist: ${artistSlug}`);

  return puppeteerService.withPage(async (page) => {
    return await attemptPageLoad(page, pageUrl, artistSlug);
  });
}

/**
 * Simple delay function to replace page.waitForTimeout
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Attempts to load a page with multiple strategies and retry logic
 * @param {Object} page - Puppeteer page object
 * @param {string} pageUrl - URL to load
 * @param {string} artistSlug - Artist slug for logging
 * @returns {Promise<Array>} - Array of extracted songs
 */
async function attemptPageLoad(page, pageUrl, artistSlug) {
  const strategies = [
    {
      name: 'fast',
      waitUntil: 'domcontentloaded',
      timeout: 45000,
      waitAfter: 2000
    },
    {
      name: 'standard',
      waitUntil: 'load',
      timeout: 60000,
      waitAfter: 3000
    },
    {
      name: 'patient',
      waitUntil: 'networkidle0',
      timeout: 90000,
      waitAfter: 5000
    }
  ];

  let lastError;

  for (const [index, strategy] of strategies.entries()) {
    try {
      logger.info(`Attempting to load ${pageUrl} with ${strategy.name} strategy (attempt ${index + 1}/${strategies.length})`);
      
      // Set timeout for this attempt
      await page.setDefaultNavigationTimeout(strategy.timeout);
      
      // Navigate to page
      await page.goto(pageUrl, { 
        waitUntil: strategy.waitUntil,
        timeout: strategy.timeout 
      });
      
      // Wait for additional content to load
      await delay(strategy.waitAfter);
      
      // Try to wait for some content to ensure the page loaded properly
      try {
        await page.waitForSelector('body', { timeout: 5000 });
        logger.debug(`Artist page loaded successfully with ${strategy.name} strategy`);
      } catch (selectorError) {
        logger.warn(`Could not find body selector on ${pageUrl} with ${strategy.name} strategy:`, selectorError.message);
        // Continue anyway, the page might still be usable
      }
      
      // Extract songs
      const songs = await page.evaluate(extractArtistSongs);
      logger.info(`Successfully extracted ${songs.length} songs for ${artistSlug} using ${strategy.name} strategy`);
      return songs;
      
    } catch (error) {
      lastError = error;
      logger.warn(`${strategy.name} strategy failed for ${artistSlug}:`, error.message);
      
      // If this isn't the last strategy, wait a bit before trying the next one
      if (index < strategies.length - 1) {
        const waitTime = Math.min(2000 * (index + 1), 5000); // Progressive backoff
        logger.info(`Waiting ${waitTime}ms before trying next strategy...`);
        await delay(waitTime);
      }
    }
  }

  // All strategies failed
  logger.error(`All loading strategies failed for ${artistSlug}. Last error:`, lastError.message);
  throw new Error(`Unable to load artist page for ${artistSlug}: ${lastError.message}. The page may be temporarily unavailable or blocked.`);
}
