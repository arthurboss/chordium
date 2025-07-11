import { Request, Response } from 'express';
import { normalizeArtistPath } from '../../utils/url-utils.js';
import logger from '../../utils/logger.js';
import cifraClubService from '../../services/cifraclub.service.js';
import { getCachedArtistSongs, storeArtistSongs } from '../../services/s3-artist-cache.service.js';
import type { ErrorResponse } from '../../../shared/types/api/responses.js';
import type { Song } from '../../../shared/types/domain/song.js';

import type { GetArtistSongsQuery } from '../../types/controller.types.js';

/**
 * Handles requests to fetch all songs for a given artist, using cache if available.
 */
async function getArtistSongsHandler(
  req: Request<{}, Song[] | ErrorResponse, {}, GetArtistSongsQuery>,
  res: Response<Song[] | ErrorResponse>
): Promise<void> {
  // Fetches all songs for a given artist, using S3 cache if available, otherwise fetches from CifraClub.
  try {
    const { artistPath } = req.query;
    if (!artistPath) {
      logger.error('Missing artist path parameter');
      res.status(400).json({ error: 'Missing artist path' });
      return;
    }

    const normalizedArtistPath = normalizeArtistPath(artistPath);
    logger.info(`Fetching songs for artist with path: ${artistPath}`);

    try {
      const cachedSongs = await getCachedArtistSongs(normalizedArtistPath);
      if (cachedSongs && cachedSongs.length > 0) {
        logger.info(`Found ${cachedSongs.length} cached songs for artist ${normalizedArtistPath} in S3`);
        logger.info(`[DATA SOURCE] S3`);
        res.json(cachedSongs);
        return;
      }
    } catch (cacheError) {
      const errorMessage = cacheError instanceof Error ? cacheError.message : 'Unknown cache error';
      logger.warn(`Failed to retrieve cached songs for ${normalizedArtistPath} from S3:`, errorMessage);
    }

    logger.info(`[DATA SOURCE] Scraping (CifraClub)`);
    logger.info(`No cached data for ${normalizedArtistPath}, fetching from CifraClub...`);
    const artistUrl = `${cifraClubService.baseUrl}/${normalizedArtistPath}/`;
    let songs: Song[] = [];
    try {
      songs = await cifraClubService.getArtistSongs(artistUrl);
      logger.info(`[SCRAPED ELEMENTS] ${JSON.stringify(songs)}`);
      logger.info(`Found ${songs.length} songs for artist ${normalizedArtistPath} from CifraClub`);

      if (songs && songs.length > 0) {
        try {
          await storeArtistSongs(normalizedArtistPath, songs);
          logger.info(`Cached ${songs.length} songs for artist ${normalizedArtistPath} in S3`);
        } catch (cacheError) {
          const errorMessage = cacheError instanceof Error ? cacheError.message : 'Unknown cache error';
          logger.warn(`Failed to cache songs for ${normalizedArtistPath} in S3:`, errorMessage);
        }
      }
      res.json(songs);
    } catch (scrapeError) {
      // If Puppeteer navigation failed, return empty array with 200
      const errMsg = scrapeError instanceof Error ? scrapeError.message : String(scrapeError);
      logger.warn(`Scraping failed for ${normalizedArtistPath}: ${errMsg}`);
      res.json([]);
    }
  } catch (error) {
    logger.error('Error fetching artist songs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch artist songs', details: errorMessage });
  }
}

export { getArtistSongsHandler };
