import { normalizeArtistPath } from '../../utils/url-utils.js';
import logger from '../../utils/logger.js';
import cifraClubService from '../../services/cifraclub.service.js';
import { getCachedArtistSongs, storeArtistSongs } from '../../services/s3-artist-cache.service.js';

/**
 * Handles requests to fetch all songs for a given artist, using cache if available.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
async function getArtistSongsHandler(req, res) {
  // Fetches all songs for a given artist, using S3 cache if available, otherwise fetches from CifraClub.
  try {
    const { artistPath } = req.query;
    if (!artistPath) {
      logger.error('Missing artist path parameter');
      return res.status(400).json({ error: 'Missing artist path' });
    }
    const normalizedArtistPath = normalizeArtistPath(artistPath);
    logger.info(`Fetching songs for artist with path: ${artistPath}`);
    try {
      const cachedSongs = await getCachedArtistSongs(normalizedArtistPath);
      if (cachedSongs && cachedSongs.length > 0) {
        logger.info(`Found ${cachedSongs.length} cached songs for artist ${normalizedArtistPath} in S3`);
        return res.json(cachedSongs);
      }
    } catch (cacheError) {
      logger.warn(`Failed to retrieve cached songs for ${normalizedArtistPath} from S3:`, cacheError.message);
    }
    logger.info(`No cached data for ${normalizedArtistPath}, fetching from CifraClub...`);
    const artistUrl = `${cifraClubService.baseUrl}/${normalizedArtistPath}/`;
    const songs = await cifraClubService.getArtistSongs(artistUrl);
    logger.info(`Found ${songs.length} songs for artist ${normalizedArtistPath} from CifraClub`);
    if (songs && songs.length > 0) {
      try {
        await storeArtistSongs(normalizedArtistPath, songs);
        logger.info(`Cached ${songs.length} songs for artist ${normalizedArtistPath} in S3`);
      } catch (cacheError) {
        logger.warn(`Failed to cache songs for ${normalizedArtistPath} in S3:`, cacheError.message);
      }
    }
    return res.json(songs);
  } catch (error) {
    logger.error('Error fetching artist songs:', error);
    res.status(500).json({ error: 'Failed to fetch artist songs', details: error.message });
  }
}

export { getArtistSongsHandler };
