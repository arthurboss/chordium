import SEARCH_TYPES from '../constants/searchTypes.js';
import cifraClubService from '../services/cifraclub.service.js';
import logger from '../utils/logger.js';
import { normalizeForSearch } from '../utils/normalize-for-search.js';
import { normalizePathForComparison } from '../utils/normalize-path-for-comparison.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import config from '../config/config.js';
import { createClient } from '@supabase/supabase-js';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const results = await cifraClubService.search(query, searchType);
      
      res.json(results);
    } catch (error) {
      logger.error('Search error:', error);
      res.status(500).json({ error: 'Search failed', details: error.message });
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
      // Always scrape Cifra Club for artists
      const searchType = SEARCH_TYPES.ARTIST;
      const query = artist || '';
      const artists = await cifraClubService.search(query, searchType);
      logger.info(`Found ${artists.length} artists from Cifra Club`);
      return res.json(artists);
    } catch (error) {
      logger.error('Error fetching artists:', error);
      res.status(500).json({ error: 'Failed to fetch artists', details: error.message });
    }
  }
}

const searchController = new SearchController();

export default searchController;
