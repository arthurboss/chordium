import { Request, Response } from 'express';
import cifraClubService from '../../services/cifraclub.service.js';
import SEARCH_TYPES from '../../constants/searchTypes.js';
import logger from '../../utils/logger.js';
import { Artist, Song, ErrorResponse, GetArtistsQuery } from "../../../shared/types/index.js";

async function getArtistsHandler(
  req: Request<{}, Artist[] | Song[] | ErrorResponse, {}, GetArtistsQuery>,
  res: Response<Artist[] | Song[] | ErrorResponse>
): Promise<void> {
  try {
    const { artist } = req.query;
    logger.info(`Searching for artists matching: "${artist}"`);

    if (!artist) {
      res.status(400).json({ error: 'Missing artist query parameter' });
      return;
    }

    const results = await cifraClubService.search(artist, SEARCH_TYPES.ARTIST);
    res.json(results);
  } catch (error) {
    logger.error('Error in getArtists:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;
    res.status(500).json({ error: 'Failed to fetch artists', details: errorMessage, stack: errorStack });
  }
}

export { getArtistsHandler };
