import puppeteerService from "../services/puppeteer.service.js";
import logger from "./logger.js";
import { extractChordSheet } from "./dom-extractors.js";
import type { ChordSheet } from "../../shared/types/domain/chord-sheet.js";
import type { Page } from 'puppeteer';

import type { LoadStrategy } from '../types/cifraclub.types.js';

/**
 * Simple delay function to replace page.waitForTimeout
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Attempts to load a chord sheet page with multiple strategies and retry logic
 */
async function attemptChordSheetLoad(page: Page, songUrl: string): Promise<ChordSheet> {
  const strategies: LoadStrategy[] = [
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

  let lastError: Error = new Error('No strategies attempted');

  for (const [index, strategy] of strategies.entries()) {
    try {
      logger.info(`🌐 Flow Step 2b: Loading page with ${strategy.name} strategy (attempt ${index + 1}/${strategies.length})`);
      
      // Set timeout for this attempt
      page.setDefaultNavigationTimeout(strategy.timeout);
      
      // Navigate to page
      await page.goto(songUrl, { 
        waitUntil: strategy.waitUntil,
        timeout: strategy.timeout 
      });
      
      // Wait for additional content to load
      await delay(strategy.waitAfter);
      
      // Try to wait for some content to ensure the page loaded properly
      try {
        await page.waitForSelector('body', { timeout: 5000 });
        logger.info(`✅ Flow Step 2c: Song page loaded successfully with ${strategy.name} strategy`);
      } catch (selectorError) {
        logger.warn(`Could not find body selector on ${songUrl} with ${strategy.name} strategy:`, selectorError);
        // Continue anyway, the page might still be usable
      }
      
      logger.debug("Extracting chord sheet data from DOM...");
      
      // Extract chord sheet
      const chordSheet = await page.evaluate(extractChordSheet);
      logger.info(`📝 Flow Step 2d: Chord sheet data extracted using ${strategy.name} strategy`);
      logger.info(`📏 Extracted chords length: ${chordSheet?.songChords ? chordSheet.songChords.length : 0} characters`);
      logger.info(`🎵 Key: ${chordSheet?.songKey || 'not found'}, Capo: ${chordSheet?.guitarCapo || 'not found'}, Tuning: ${chordSheet?.guitarTuning || 'not found'}`);
      
      if (!chordSheet?.songChords) {
        logger.warn(`⚠️  No chord sheet content found in page with ${strategy.name} strategy`);
      } else {
        logger.info(`✅ ChordSheet extraction successful with ${strategy.name} strategy - returning to controller`);
      }
      
      return chordSheet;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`${strategy.name} strategy failed for chord sheet ${songUrl}:`, lastError.message);
      
      // If this isn't the last strategy, wait a bit before trying the next one
      if (index < strategies.length - 1) {
        const waitTime = Math.min(2000 * (index + 1), 5000); // Progressive backoff
        logger.info(`Waiting ${waitTime}ms before trying next strategy...`);
        await delay(waitTime);
      }
    }
  }

  // All strategies failed
  logger.error(`All loading strategies failed for chord sheet ${songUrl}. Last error:`, lastError.message);
  throw new Error(`Unable to load chord sheet page: ${lastError.message}. The page may be temporarily unavailable or blocked.`);
}

/**
 * Generic chord sheet fetcher that can work with any website
 */
export async function fetchChordSheet(songUrl: string): Promise<ChordSheet> {
  logger.info(`🔍 SCRAPING START: Fetching chord sheet from: ${songUrl}`);
  logger.info(`📊 Flow Step 2a: Puppeteer service called to scrape chord sheet`);

  return puppeteerService.withPage(async (page: Page) => {
    return await attemptChordSheetLoad(page, songUrl);
  });
}
