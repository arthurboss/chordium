import puppeteerService from "../services/puppeteer.service.js";
import logger from "./logger.js";
import { extractChordSheet, extractSongMetadata } from "./dom-extractors.js";
import type { ChordSheet, SongMetadata } from "../../shared/types/index.js";
import type { Page } from "puppeteer";

import type { LoadStrategy } from "../types/cifraclub.types.js";

/**
 * Simple delay function to replace page.waitForTimeout
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempts to load a chord sheet page with multiple strategies and retry logic
 */
async function attemptChordSheetLoad(
  page: Page,
  songUrl: string
): Promise<ChordSheet> {
  const strategies: LoadStrategy[] = [
    {
      name: "fast",
      waitUntil: "domcontentloaded",
      timeout: 45000,
      waitAfter: 2000,
    },
    {
      name: "standard",
      waitUntil: "load",
      timeout: 60000,
      waitAfter: 3000,
    },
    {
      name: "patient",
      waitUntil: "networkidle0",
      timeout: 90000,
      waitAfter: 5000,
    },
  ];

  let lastError: Error = new Error("No strategies attempted");

  for (const [index, strategy] of strategies.entries()) {
    try {
      logger.info(
        `🌐 Flow Step 2b: Loading page with ${strategy.name} strategy (attempt ${index + 1}/${strategies.length})`
      );

      // Set timeout for this attempt
      page.setDefaultNavigationTimeout(strategy.timeout);

      // Navigate to page
      await page.goto(songUrl, {
        waitUntil: strategy.waitUntil,
        timeout: strategy.timeout,
      });

      // Wait for additional content to load
      await delay(strategy.waitAfter);

      // Try to wait for some content to ensure the page loaded properly
      try {
        await page.waitForSelector("body", { timeout: 5000 });
        logger.info(
          `✅ Flow Step 2c: Song page loaded successfully with ${strategy.name} strategy`
        );
      } catch (selectorError) {
        logger.warn(
          `Could not find body selector on ${songUrl} with ${strategy.name} strategy:`,
          selectorError
        );
        // Continue anyway, the page might still be usable
      }

      logger.debug("Extracting chord sheet data from DOM...");

      // Extract chord sheet
      const chordSheet = await page.evaluate(extractChordSheet);
      logger.info(
        `📝 Flow Step 2d: Chord sheet data extracted using ${strategy.name} strategy`
      );
      logger.info(
        `📏 Extracted chords length: ${chordSheet?.songChords ? chordSheet.songChords.length : 0} characters`
      );
      // Note: songKey, guitarCapo, guitarTuning are now in metadata, not chord sheet content
      // logger.info(
      //   `🎵 Key: ${chordSheet?.songKey || "not found"}, Capo: ${chordSheet?.guitarCapo || "not found"}, Tuning: ${chordSheet?.guitarTuning || "not found"}`
      // );

      if (!chordSheet?.songChords) {
        logger.warn(
          `⚠️  No chord sheet content found in page with ${strategy.name} strategy`
        );
      } else {
        logger.info(
          `✅ ChordSheet extraction successful with ${strategy.name} strategy - returning to controller`
        );
      }

      return chordSheet;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(
        `${strategy.name} strategy failed for chord sheet ${songUrl}:`,
        lastError.message
      );

      // If this isn't the last strategy, wait a bit before trying the next one
      if (index < strategies.length - 1) {
        const waitTime = Math.min(2000 * (index + 1), 5000); // Progressive backoff
        logger.info(`Waiting ${waitTime}ms before trying next strategy...`);
        await delay(waitTime);
      }
    }
  }

  // All strategies failed
  logger.error(
    `All loading strategies failed for chord sheet ${songUrl}. Last error:`,
    lastError.message
  );
  throw new Error(
    `Unable to load chord sheet page: ${lastError.message}. The page may be temporarily unavailable or blocked.`
  );
}

/**
 * Generic chord sheet fetcher that can work with any website
 */
export async function fetchChordSheet(songUrl: string): Promise<ChordSheet> {
  logger.info(`🔍 SCRAPING START: Fetching chord sheet from: ${songUrl}`);
  logger.info(
    `📊 Flow Step 2a: Puppeteer service called to scrape chord sheet`
  );

  return puppeteerService.withPage(async (page: Page) => {
    return await attemptChordSheetLoad(page, songUrl);
  });
}

/**
 * In-memory cache for progressive extraction
 * Key: songUrl, Value: { metadata, content, timestamp }
 */
interface ProgressiveCacheEntry {
  metadata: SongMetadata;
  content?: ChordSheet;
  timestamp: number;
}

const progressiveCache = new Map<string, ProgressiveCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Progressive extraction fetcher with in-memory caching
 * Loads page once, extracts metadata immediately, then content in background
 */
export async function fetchWithProgressiveExtraction(songUrl: string): Promise<{
  getMetadata: () => Promise<SongMetadata>;
  getContent: () => Promise<ChordSheet>;
}> {
  logger.info(`🔍 PROGRESSIVE SCRAPING START: Fetching from: ${songUrl}`);

  // Check cache first
  const cached = progressiveCache.get(songUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info(`📦 Using cached data for: ${songUrl}`);
    return {
      getMetadata: async () => cached.metadata,
      getContent: async () => {
        if (cached.content) {
          return cached.content;
        }
        // If content not cached, fetch it
        return await fetchContentOnly(songUrl);
      }
    };
  }

  // Load page and extract metadata immediately
  const metadata = await puppeteerService.withPage(async (page: Page) => {
    return await attemptMetadataLoad(page, songUrl);
  });

  // Cache metadata
  progressiveCache.set(songUrl, {
    metadata,
    timestamp: Date.now()
  });

  logger.info(`✅ Metadata extracted and cached for: ${songUrl}`);

  // Return functions that can fetch metadata immediately and content on demand
  return {
    getMetadata: async () => metadata,
    getContent: async () => {
      // Check if content is already cached
      const cached = progressiveCache.get(songUrl);
      if (cached?.content) {
        return cached.content;
      }

      // Fetch content and cache it
      const content = await fetchContentOnly(songUrl);
      progressiveCache.set(songUrl, {
        ...cached!,
        content,
        timestamp: Date.now()
      });

      logger.info(`✅ Content extracted and cached for: ${songUrl}`);
      return content;
    }
  };
}

/**
 * Attempts to load a page and extract only metadata (fast)
 */
async function attemptMetadataLoad(
  page: Page,
  songUrl: string
): Promise<SongMetadata> {
  const strategies: LoadStrategy[] = [
    {
      name: "fast",
      waitUntil: "domcontentloaded",
      timeout: 30000, // Shorter timeout for metadata
      waitAfter: 1000, // Shorter wait for metadata
    },
    {
      name: "standard",
      waitUntil: "load",
      timeout: 45000,
      waitAfter: 2000,
    },
  ];

  let lastError: Error = new Error("No strategies attempted");

  for (const [index, strategy] of strategies.entries()) {
    try {
      logger.info(
        `🌐 Loading page for metadata with ${strategy.name} strategy (attempt ${index + 1}/${strategies.length})`
      );

      page.setDefaultNavigationTimeout(strategy.timeout);
      await page.goto(songUrl, {
        waitUntil: strategy.waitUntil,
        timeout: strategy.timeout,
      });

      await delay(strategy.waitAfter);

      // Extract metadata only (no pre element reading)
      const metadata = await page.evaluate(extractSongMetadata);
      logger.info(`📝 Metadata extracted using ${strategy.name} strategy`);

      return metadata;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(
        `${strategy.name} strategy failed for metadata ${songUrl}:`,
        lastError.message
      );

      if (index < strategies.length - 1) {
        const waitTime = Math.min(1000 * (index + 1), 3000);
        logger.info(`Waiting ${waitTime}ms before trying next strategy...`);
        await delay(waitTime);
      }
    }
  }

  throw new Error(
    `Unable to load metadata from page: ${lastError.message}`
  );
}

/**
 * Fetches only content from a cached page or loads page for content only
 */
async function fetchContentOnly(songUrl: string): Promise<ChordSheet> {
  logger.info(`🔍 Fetching content only for: ${songUrl}`);

  return puppeteerService.withPage(async (page: Page) => {
    const strategies: LoadStrategy[] = [
      {
        name: "fast",
        waitUntil: "domcontentloaded",
        timeout: 30000,
        waitAfter: 2000,
      },
      {
        name: "standard",
        waitUntil: "load",
        timeout: 45000,
        waitAfter: 3000,
      },
    ];

    let lastError: Error = new Error("No strategies attempted");

    for (const [index, strategy] of strategies.entries()) {
      try {
        logger.info(
          `🌐 Loading page for content with ${strategy.name} strategy (attempt ${index + 1}/${strategies.length})`
        );

        page.setDefaultNavigationTimeout(strategy.timeout);
        await page.goto(songUrl, {
          waitUntil: strategy.waitUntil,
          timeout: strategy.timeout,
        });

        await delay(strategy.waitAfter);

        // Extract content only
        const content = await page.evaluate(extractChordSheet);
        logger.info(`📝 Content extracted using ${strategy.name} strategy`);

        return content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(
          `${strategy.name} strategy failed for content ${songUrl}:`,
          lastError.message
        );

        if (index < strategies.length - 1) {
          const waitTime = Math.min(1000 * (index + 1), 3000);
          logger.info(`Waiting ${waitTime}ms before trying next strategy...`);
          await delay(waitTime);
        }
      }
    }

    throw new Error(
      `Unable to load content from page: ${lastError.message}`
    );
  });
}
