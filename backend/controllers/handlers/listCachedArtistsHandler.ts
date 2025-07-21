import { Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { listArtists } from '../../services/s3-artist-cache.service.js';
import type { ErrorResponse, CachedArtistsResponse } from '../../../packages/types/dist';

/**
 * Handles requests to list all cached artists from S3.
 */
async function listCachedArtistsHandler(
  req: Request,
  res: Response<CachedArtistsResponse | ErrorResponse>
): Promise<void> {
  // Lists all cached artists from S3.
  try {
    logger.info('Listing all cached artists from S3');
    const artists = await listArtists();
    logger.info(`Found ${artists.length} cached artists in S3`);
    res.json({ artists: artists as any });
  } catch (error) {
    logger.error('Error listing cached artists:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to list cached artists', details: errorMessage });
  }
}

export { listCachedArtistsHandler };
