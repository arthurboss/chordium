import { Request, Response } from 'express';
import { searchArtistsInSupabase } from '../../services/supabase-artist.service.js';
import cifraClubService from '../../services/cifraclub.service.js';
import SEARCH_TYPES from '../../constants/searchTypes.js';
import logger from '../../utils/logger.js';
import { normalizeArtistResults } from '../../utils/response-normalizers.js';
import type { ErrorResponse } from '../../../shared/types/api/responses.js';
import type { Artist } from '../../../shared/types/domain/artist.js';
import type { Song } from '../../../shared/types/domain/song.js';

import type { GetArtistsQuery } from '../../types/controller.types.js';

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

    try {
      const { data: artists, error } = await searchArtistsInSupabase(artist);
      
      if (!error && artists && artists.length > 0) {
        logger.info(`Found ${artists.length} artists in Supabase`);
        const normalizedResults = normalizeArtistResults(artists, 'supabase');
        res.json(normalizedResults);
        return;
      }
      
      if (error) {
        logger.warn('Supabase query failed, falling back to CifraClub:', error);
      } else {
        logger.info('No artists found in Supabase, falling back to CifraClub');
      }
    } catch (dbError) {
      logger.warn('Error querying Supabase, falling back to CifraClub:', dbError);
    }

    logger.info('Fetching artists from CifraClub...');
    const results = await cifraClubService.search(artist, SEARCH_TYPES.ARTIST);
    res.json(results);
  } catch (error) {
    logger.error('Error in getArtists:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;
    
    res.status(500).json({ 
      error: 'Failed to fetch artists', 
      details: errorMessage, 
      stack: errorStack 
    });
  }
}

export { getArtistsHandler };
