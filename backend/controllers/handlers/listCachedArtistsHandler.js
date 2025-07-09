import logger from '../../utils/logger.js';
import { listArtists } from '../../services/s3-artist-cache.service.js';

/**
 * Handles requests to list all cached artists from S3.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
async function listCachedArtistsHandler(req, res) {
  // Lists all cached artists from S3.
  try {
    logger.info('Listing all cached artists from S3');
    const artists = await listArtists();
    logger.info(`Found ${artists.length} cached artists in S3`);
    res.json({ artists });
  } catch (error) {
    logger.error('Error listing cached artists:', error);
    res.status(500).json({ error: 'Failed to list cached artists', details: error.message });
  }
}

export { listCachedArtistsHandler };
