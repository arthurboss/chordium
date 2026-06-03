import { Request, Response } from "express";
import { normalizeArtistPath } from "../../utils/url-utils.js";
import logger from "../../utils/logger.js";
import cifraClubService from "../../services/cifraclub.service.js";
import { ErrorResponse, GetArtistSongsQuery, Song } from "../../../shared/types/index.js";

async function getArtistSongsHandler(
  req: Request<{}, Song[] | ErrorResponse, {}, GetArtistSongsQuery>,
  res: Response<Song[] | ErrorResponse>
): Promise<void> {
  try {
    const { artistPath } = req.query;
    if (!artistPath) {
      logger.error("Missing artist path parameter");
      res.status(400).json({ error: "Missing artist path" });
      return;
    }

    const normalizedArtistPath = normalizeArtistPath(artistPath);
    logger.info(`Fetching songs for artist: ${normalizedArtistPath}`);

    const artistUrl = `${cifraClubService.baseUrl}/${normalizedArtistPath}/`;
    try {
      const songs = await cifraClubService.getArtistSongs(artistUrl);
      logger.info(`[DATA SOURCE] Scraping (CifraClub)`);
      logger.info(`Found ${songs.length} songs for ${normalizedArtistPath}`);
      res.json(songs);
    } catch (scrapeError) {
      const errMsg = scrapeError instanceof Error ? scrapeError.message : String(scrapeError);
      logger.warn(`Scraping failed for ${normalizedArtistPath}: ${errMsg}`);

      if (
        errMsg.includes("Protocol error: Connection closed.") ||
        errMsg.includes("Connection closed") ||
        errMsg.includes("Target closed") ||
        errMsg.includes("Session closed")
      ) {
        logger.error(`Puppeteer browser error for ${normalizedArtistPath} — attempting recovery`);
        try {
          const puppeteerService = (await import("../../services/puppeteer.service.js")).default;
          await puppeteerService.forceRestart();
        } catch (restartError) {
          logger.error("Failed to restart browser:", restartError);
        }
        res.status(502).json({ error: "Bad Gateway", details: "Browser error — please retry." });
        return;
      }

      if (errMsg.toLowerCase().includes("timeout")) {
        res.status(504).json({ error: "Gateway Timeout", details: errMsg });
      } else {
        res.status(502).json({ error: "Bad Gateway", details: errMsg });
      }
    }
  } catch (error) {
    logger.error("Error fetching artist songs:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Failed to fetch artist songs", details: errorMessage });
  }
}

export { getArtistSongsHandler };
