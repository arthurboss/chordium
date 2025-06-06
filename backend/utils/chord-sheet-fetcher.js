import puppeteerService from "../services/puppeteer.service.js";
import logger from "./logger.js";
import { extractChordSheet } from "./dom-extractors.js";

/**
 * Generic chord sheet fetcher that can work with any website
 * @param {string} songUrl - URL of the song page
 * @returns {Promise<string>} - The chord sheet content
 */
export async function fetchChordSheet(songUrl) {
  logger.info(`Fetching chord sheet from: ${songUrl}`);

  return puppeteerService.withPage(async (page) => {
    await page.goto(songUrl, { waitUntil: "networkidle2" });
    logger.debug("Song page loaded, extracting chord sheet...");

    return page.evaluate(extractChordSheet);
  });
}
