import { Request, Response } from 'express';
import { normalizeArtistPath } from '../../utils/url-utils.js';
import logger from '../../utils/logger.js';
import { removeSongFromArtist } from '../../services/s3-artist-cache.service.js';
import type { ErrorResponse, RemoveSongFromArtistBody, SuccessResponse } from '@chordium/types';

/**
 * Handles requests to remove a song from an artist's cached song list.
 */
async function removeSongFromArtistHandler(
  req: Request<Record<string, never>, SuccessResponse | ErrorResponse, RemoveSongFromArtistBody>,
  res: Response<SuccessResponse | ErrorResponse>
): Promise<void> {
  // Removes a song from the cached list for a given artist.
  try {
    const { artistName, songPath } = req.body;
    if (!artistName || !songPath) {
      res.status(400).json({ error: 'Missing artistName or songPath' });
      return;
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to remove song from artist', details: errorMessage });
  }
}

export { removeSongFromArtistHandler };
