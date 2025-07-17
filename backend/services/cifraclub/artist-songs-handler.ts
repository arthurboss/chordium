import puppeteerService from "../puppeteer.service.js";
import logger from "../../utils/logger.js";
import { extractArtistSlug } from "../../utils/url-utils.js";
import { extractArtistSongs } from "../../utils/dom-extractors.js";
import type { Song } from '@chordium/types';
import type { Page } from 'puppeteer';

import type { LoadStrategy } from '../../types/cifraclub.types.js';

/**
 * Handles fetching songs for a specific artist from CifraClub
 */
export async function fetchArtistSongs(baseUrl: string, artistUrl: string): Promise<Song[]> {
  const artistSlug = extractArtistSlug(artistUrl);
  if (!artistSlug) {
    throw new Error("Invalid artist URL");
  }

  const pageUrl = `${baseUrl}/${artistSlug}/`;
  logger.info(`Fetching songs for artist: ${artistSlug}`);

  return puppeteerService.withPage(async (page: Page) => {
    return await attemptPageLoad(page, pageUrl, artistSlug);
  });
}

/**
 * Simple delay function to replace page.waitForTimeout
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Attempts to load an artist page with multiple strategies and retry logic
 */
async function attemptPageLoad(page: Page, pageUrl: string, artistSlug: string): Promise<Song[]> {
  const strategies: LoadStrategy[] = [
    {
      name: 'fast',
      waitUntil: 'domcontentloaded',
      timeout: 30000,
      waitAfter: 2000
    },
    {
      name: 'standard',
      waitUntil: 'load',
      timeout: 45000,
      waitAfter: 3000
    },
    {
      name: 'patient',
      waitUntil: 'networkidle0',
      timeout: 60000,
      waitAfter: 5000
    }
  ];

  let lastError: Error = new Error('No strategies attempted');

  for (const [index, strategy] of strategies.entries()) {
    try {
      logger.info(`Attempting artist page load with ${strategy.name} strategy (${index + 1}/${strategies.length})`);
      
      const response = await page.goto(pageUrl, { 
        waitUntil: strategy.waitUntil, 
        timeout: strategy.timeout 
      });

      if (!response) {
        throw new Error('No response received from page.goto');
      }

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }

      logger.info(`Artist page loaded with ${strategy.name} strategy, waiting ${strategy.waitAfter}ms for dynamic content...`);
      await delay(strategy.waitAfter);
      
      // Try to wait for some content to ensure the page loaded properly
      try {
        await page.waitForSelector('body', { timeout: 5000 });
        logger.debug(`Artist page loaded successfully with ${strategy.name} strategy`);
      } catch (selectorError) {
        const errorMessage = selectorError instanceof Error ? selectorError.message : String(selectorError);
        logger.warn(`Could not find body selector on ${pageUrl} with ${strategy.name} strategy:`, errorMessage);
        // Continue anyway, the page might still be usable
      }
      
      // Extract songs
      const songs = await page.evaluate(extractArtistSongs) as Song[];
      logger.info(`Successfully extracted ${songs.length} songs for ${artistSlug} using ${strategy.name} strategy`);
      return songs;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`${strategy.name} strategy failed for ${artistSlug}:`, lastError.message);
      
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
