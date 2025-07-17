import { Request, Response } from 'express';
import { normalizeArtistPath } from '../../utils/url-utils.js';
import logger from '../../utils/logger.js';
import { addSongToArtist } from '../../services/s3-artist-cache.service.js';
import type { ErrorResponse } from '../../../shared/types/api/responses.js';
import type { AddSongToArtistBody, SuccessResponse } from '../../../shared/types/api/requests.js';

/**
 * Handles requests to add a song to an artist's cached song list.
 */
async function addSongToArtistHandler(
  req: Request<{}, SuccessResponse | ErrorResponse, AddSongToArtistBody>,
  res: Response<SuccessResponse | ErrorResponse>
): Promise<void> {
  // Adds a song to the cached list for a given artist.
  try {
    const { artistName, song } = req.body;
    if (!artistName || !song) {
      res.status(400).json({ error: 'Missing artistName or song data' });
      return;
    }
    
    if (!song.title || !song.path) {
      res.status(400).json({ error: 'Song must have title and path properties' });
      return;
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to add song to artist', details: errorMessage });
  }
}

export { addSongToArtistHandler };
