import puppeteerService from "../services/puppeteer.service.js";
import logger from "./logger.js";
import { extractChordSheet } from "./dom-extractors.js";

/**
 * Generic chord sheet fetcher that can work with any website
 * @param {string} songUrl - URL of the song page
 * @returns {Promise<Object>} - The ChordSheet object with chords, key, tuning, capo
 */
export async function fetchChordSheet(songUrl) {
  logger.info(`🔍 SCRAPING START: Fetching chord sheet from: ${songUrl}`);
  logger.info(`📊 Flow Step 2a: Puppeteer service called to scrape chord sheet`);

  return puppeteerService.withPage(async (page) => {
    logger.info(`🌐 Flow Step 2b: Loading page with Puppeteer...`);
    await page.goto(songUrl, { waitUntil: "networkidle2" });
    logger.info(`✅ Flow Step 2c: Song page loaded successfully`);
    logger.debug("Extracting chord sheet data from DOM...");

    const chordSheet = await page.evaluate(extractChordSheet);
    logger.info(`📝 Flow Step 2d: Chord sheet data extracted`);
    logger.info(`📏 Extracted chords length: ${chordSheet?.songChords ? chordSheet.songChords.length : 0} characters`);
    logger.info(`🎵 Key: ${chordSheet?.songKey || 'not found'}, Capo: ${chordSheet?.guitarCapo || 'not found'}, Tuning: ${chordSheet?.guitarTuning || 'not found'}`);
    
    if (!chordSheet?.songChords) {
      logger.warn(`⚠️  No chord sheet content found in page`);
    } else {
      logger.info(`✅ ChordSheet extraction successful - returning to controller`);
    }

    return chordSheet;
  });
}
