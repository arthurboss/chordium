import type { Request, Response } from 'express';
import { buildSearchQuery, determineSearchType } from '../../utils/search.utils.js';
import { searchArtistsInSupabase } from '../../services/supabase-artist.service.js';
import cifraClubService from '../../services/cifraclub.service.js';
import SEARCH_TYPES from '../../constants/searchTypes.js';
import logger from '../../utils/logger.js';
import { normalizeArtistResults } from '../../utils/response-normalizers.js';
import type { SearchType } from '../../../shared/types/search.js';

/**
 * Handles search requests for artists or songs.
 * Tries Supabase for artists, otherwise falls back to CifraClub.
 */
export async function searchHandler(req: Request, res: Response): Promise<void> {
  try {
    const { artist, song } = req.query;
    const query = buildSearchQuery(artist as string, song as string);
    const searchType = determineSearchType(artist as string, song as string, SEARCH_TYPES);
    
    if (!query || !searchType) {
      res.status(400).json({ error: 'Missing or invalid search query' });
      return;
    }
    
    logger.info(`Search request - query: "${query}", type: ${searchType}`);
    
    if (searchType === SEARCH_TYPES.ARTIST) {
      try {
        logger.info('Attempting to fetch artists from Supabase...');
        const { data: artists, error } = await searchArtistsInSupabase(query);
        
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
    }
    
    logger.info('Fetching from CifraClub...');
    const results = await cifraClubService.search(query, searchType as SearchType);
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      details: (error as Error).message, 
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined 
    });
  }
}
