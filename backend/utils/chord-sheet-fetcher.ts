import puppeteerService from "../services/puppeteer.service.js";
import logger from "./logger.js";
import { extractChordSheet } from "./dom-extractors.js";
import type { ChordSheet } from "../../shared/types/domain/chord-sheet.js";
import type { Page } from 'puppeteer';

interface LoadStrategy {
  name: string;
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout: number;
  waitAfter: number;
}

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
      timeout: 30000, // Reduced from 45000
      waitAfter: 1000  // Reduced from 2000
    },
    {
      name: 'standard',
      waitUntil: 'load',
      timeout: 45000,  // Reduced from 60000
      waitAfter: 2000  // Reduced from 3000
    },
    {
      name: 'patient',
      waitUntil: 'networkidle2', // Changed from networkidle0 to be less strict
      timeout: 60000,  // Reduced from 90000
      waitAfter: 3000  // Reduced from 5000
    }
  ];

  let lastError: Error = new Error('No strategies attempted');

  for (const [index, strategy] of strategies.entries()) {
    try {
      logger.info(`Attempting chord sheet load with ${strategy.name} strategy (${index + 1}/${strategies.length})`);
      
      // Navigate to the page with improved error handling
      let response;
      try {
        response = await page.goto(songUrl, { 
          waitUntil: strategy.waitUntil, 
          timeout: strategy.timeout 
        });
      } catch (gotoError) {
        const errorMsg = gotoError instanceof Error ? gotoError.message : String(gotoError);
        if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
          throw new Error(`Page load timeout after ${strategy.timeout}ms`);
        } else if (errorMsg.includes('net::ERR_')) {
          throw new Error(`Network error: ${errorMsg}`);
        } else {
          throw new Error(`Navigation failed: ${errorMsg}`);
        }
      }

      if (!response) {
        throw new Error('No response received from page.goto - page may be blocked or unavailable');
      }

      const status = response.status();
      logger.info(`Response status: ${status} for ${strategy.name} strategy`);

      if (status === 403) {
        throw new Error('Access forbidden - possible bot detection');
      } else if (status === 404) {
        throw new Error('Page not found - URL may be invalid');
      } else if (status >= 500) {
        throw new Error(`Server error: ${status}`);
      } else if (!response.ok()) {
        throw new Error(`HTTP ${status}: ${response.statusText()}`);
      }

      logger.info(`Page loaded with ${strategy.name} strategy, waiting ${strategy.waitAfter}ms for dynamic content...`);
      await delay(strategy.waitAfter);

      // Enable console logging from the browser
      page.on('console', msg => {
        logger.info(`[Browser Console] ${msg.text()}`);
      });

      logger.info(`Extracting chord sheet data...`);
      
      // Debug: Check what's actually on the page
      const pageInfo = await page.evaluate(() => {
        const preElements = document.querySelectorAll('pre');
        const h1Elements = document.querySelectorAll('h1');
        const h2Elements = document.querySelectorAll('h2');
        return {
          title: document.title,
          url: window.location.href,
          preCount: preElements.length,
          preTexts: Array.from(preElements).map(pre => ({
            text: pre.textContent?.substring(0, 100) || '',
            length: pre.textContent?.length || 0
          })),
          h1Count: h1Elements.length,
          h1Texts: Array.from(h1Elements).map(h1 => h1.textContent?.trim() || ''),
          h2Count: h2Elements.length,
          h2Texts: Array.from(h2Elements).map(h2 => h2.textContent?.trim() || ''),
          hasChordElements: document.querySelector('.cifra') !== null
        };
      });
      
      logger.info(`Page debug info:`, pageInfo);
      
      const chordSheet = await page.evaluate(extractChordSheet) as ChordSheet;
      
      if (!chordSheet?.songChords) {
        throw new Error('No chord sheet data extracted from page');
      }

      if (chordSheet.songChords.length < 50) {
        logger.warn(`⚠️  Warning: Chord sheet seems too short (${chordSheet.songChords.length} chars). Might be incomplete.`);
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
