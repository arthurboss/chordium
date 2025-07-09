import { normalizeArtistPath } from '../../utils/url-utils.js';
import logger from '../../utils/logger.js';
import { removeSongFromArtist } from '../../services/s3-artist-cache.service.js';

/**
 * Handles requests to remove a song from an artist's cached song list.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
async function removeSongFromArtistHandler(req, res) {
  // Removes a song from the cached list for a given artist.
  try {
    const { artistName, songPath } = req.body;
    if (!artistName || !songPath) {
      return res.status(400).json({ error: 'Missing artistName or songPath' });
    }
    const normalizedArtistName = normalizeArtistPath(artistName);
    logger.info(`Removing song with path "${songPath}" from artist "${normalizedArtistName}"`);
    const success = await removeSongFromArtist(normalizedArtistName, songPath);
    if (success) {
      logger.info(`Successfully removed song with path "${songPath}" from artist "${normalizedArtistName}"`);
      res.json({ success: true, message: 'Song removed successfully' });
    } else {
      res.status(404).json({ error: 'Song not found in artist list' });
    }
  } catch (error) {
    logger.error('Error removing song from artist:', error);
    res.status(500).json({ error: 'Failed to remove song from artist', details: error.message });
  }
}

export { removeSongFromArtistHandler };
