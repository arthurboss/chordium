import { buildSearchQuery, determineSearchType } from '../../utils/search.utils.js';
import { searchArtistsInSupabase } from '../../services/supabase-artist.service.js';
import cifraClubService from '../../services/cifraclub.service.js';
import SEARCH_TYPES from '../../constants/searchTypes.js';
import logger from '../../utils/logger.js';
import { normalizeArtistResults } from '../../utils/response-normalizers.js';

/**
 * Handles search requests for artists or songs.
 * Tries Supabase for artists, otherwise falls back to CifraClub.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
async function searchHandler(req, res) {
  // Handles a search request for artists or songs.
  try {
    const { artist, song } = req.query;
    const query = buildSearchQuery(artist, song);
    const searchType = determineSearchType(artist, song, SEARCH_TYPES);
    if (!query || !searchType) {
      return res.status(400).json({ error: 'Missing or invalid search query' });
    }
    logger.info(`Search request - query: "${query}", type: ${searchType}`);
    if (searchType === SEARCH_TYPES.ARTIST) {
      try {
        logger.info('Attempting to fetch artists from Supabase...');
        const { data: artists, error } = await searchArtistsInSupabase(query);
        if (!error && artists && artists.length > 0) {
          logger.info(`Found ${artists.length} artists in Supabase`);
          const normalizedResults = normalizeArtistResults(artists, 'supabase');
          return res.json(normalizedResults);
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
    const results = await cifraClubService.search(query, searchType);
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
}

export { searchHandler };
