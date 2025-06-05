import SEARCH_TYPES from '../constants/searchTypes.js';
import cifraClubService from '../services/cifraclub.service.js';
import logger from '../utils/logger.js';

import config from '../config/config.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

function buildSearchQuery(artist, song) {
  if (artist && song) return `${artist} ${song}`;
  return artist || song || '';
}

function determineSearchType(artist, song) {
  if (artist && !song) return SEARCH_TYPES.ARTIST;
  if (song && !artist) return SEARCH_TYPES.SONG;
  if (artist && song) return SEARCH_TYPES.SONG;
  return null;
}

class SearchController {
  async search(req, res) {
    try {
      const { artist, song } = req.query;
      const query = buildSearchQuery(artist, song);
      const searchType = determineSearchType(artist, song);

      if (!query || !searchType) {
        return res.status(400).json({ error: 'Missing or invalid search query' });
      }

      logger.info(`Search request - query: "${query}", type: ${searchType}`);
      
      // For artist searches, try Supabase first
      if (searchType === SEARCH_TYPES.ARTIST) {
        try {
          logger.info('Attempting to fetch artists from Supabase...');
          const { data: artists, error } = await supabase
            .from('artists')
            .select('*')
            .ilike('displayName', `%${query}%`);
            
          if (!error && artists && artists.length > 0) {
            logger.info(`Found ${artists.length} artists in Supabase`);
            return res.json(artists);
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
      
      // Fallback to CifraClub for all other cases or if Supabase fails
      logger.info('Fetching from CifraClub...');
      const results = await cifraClubService.search(query, searchType);
      res.json(results);
      
    } catch (error) {
      logger.error('Search error:', error);
      res.status(500).json({ 
        error: 'Search failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async getArtistSongs(req, res) {
    try {
      const { artistPath } = req.query;
      if (!artistPath) {
        logger.error('Missing artist path parameter');
        return res.status(400).json({ error: 'Missing artist path' });
      }
      logger.info(`Fetching songs for artist with path: ${artistPath}`);
      // Always scrape Cifra Club for artist songs
      const artistUrl = `${cifraClubService.baseUrl}/${artistPath}/`;
      const songs = await cifraClubService.getArtistSongs(artistUrl);
      logger.info(`Found ${songs.length} songs for artist ${artistPath} from Cifra Club`);
      return res.json(songs);
    } catch (error) {
      logger.error('Error fetching artist songs:', error);
      res.status(500).json({ error: 'Failed to fetch artist songs', details: error.message });
    }
  }

  async getChordSheet(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'Missing song URL' });
      }

      logger.info(`Fetching chord sheet: ${url}`);
      const content = await cifraClubService.getChordSheet(url);
      
      if (!content) {
        return res.status(404).json({ error: 'Chord sheet not found' });
      }

      res.json({ content });
    } catch (error) {
      logger.error('Error fetching chord sheet:', error);
      res.status(500).json({ error: 'Failed to fetch chord sheet', details: error.message });
    }
  }

  async getArtists(req, res) {
    try {
      const { artist } = req.query;
      logger.info(`Searching for artists matching: "${artist}"`);

      if (!artist) {
        return res.status(400).json({ error: 'Missing artist query parameter' });
      }

      // First try Supabase
      try {
        const { data: artists, error } = await supabase
          .from('artists')
          .select('*')
          .ilike('displayName', `%${artist}%`);

        if (!error && artists && artists.length > 0) {
          logger.info(`Found ${artists.length} artists in Supabase`);
          return res.json(artists);
        }

        if (error) {
          logger.warn('Supabase query failed, falling back to CifraClub:', error);
        } else {
          logger.info('No artists found in Supabase, falling back to CifraClub');
        }
      } catch (dbError) {
        logger.warn('Error querying Supabase, falling back to CifraClub:', dbError);
      }

      // Fallback to CifraClub if Supabase fails or returns no results
      logger.info('Fetching artists from CifraClub...');
      const results = await cifraClubService.search(artist, SEARCH_TYPES.ARTIST);
      res.json(results);
      
    } catch (error) {
      logger.error('Error in getArtists:', error);
      res.status(500).json({ 
        error: 'Failed to fetch artists', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

const searchController = new SearchController();

export default searchController;
