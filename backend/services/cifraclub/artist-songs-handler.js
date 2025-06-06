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
    await page.goto(pageUrl, { waitUntil: "networkidle2" });
    logger.debug("Artist page loaded, extracting songs...");

    return page.evaluate(extractArtistSongs);
  });
}
