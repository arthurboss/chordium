import { normalizeArtistPath } from '../../utils/url-utils.js';
import logger from '../../utils/logger.js';
import { addSongToArtist } from '../../services/s3-artist-cache.service.js';

/**
 * Handles requests to add a song to an artist's cached song list.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
async function addSongToArtistHandler(req, res) {
  // Adds a song to the cached list for a given artist.
  try {
    const { artistName, song } = req.body;
    if (!artistName || !song) {
      return res.status(400).json({ error: 'Missing artistName or song data' });
    }
    if (!song.title || !song.path) {
      return res.status(400).json({ error: 'Song must have title and path properties' });
    }
    const normalizedArtistName = normalizeArtistPath(artistName);
    logger.info(`Adding song "${song.title}" to artist "${normalizedArtistName}"`);
    const success = await addSongToArtist(normalizedArtistName, song);
    if (success) {
      logger.info(`Successfully added song "${song.title}" to artist "${normalizedArtistName}"`);
      res.json({ success: true, message: 'Song added successfully' });
    } else {
      res.status(500).json({ error: 'Failed to add song to artist' });
    }
  } catch (error) {
    logger.error('Error adding song to artist:', error);
    res.status(500).json({ error: 'Failed to add song to artist', details: error.message });
  }
}

export { addSongToArtistHandler };
