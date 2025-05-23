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
      
      // In development, read from mock files
      const mockFilePath = path.resolve(__dirname, '../../src/mocks', `${artistPath}.json`);
      logger.info(`Looking for mock file at: ${mockFilePath}`);
      
      if (fs.existsSync(mockFilePath)) {
        logger.info(`Mock file found for artist: ${artistPath}`);
        const fileContent = fs.readFileSync(mockFilePath, 'utf8');
        const songs = JSON.parse(fileContent);
        logger.info(`Found ${songs.length} songs for artist ${artistPath} in mock data`);
        return res.json(songs);
      } else {
        logger.warn(`Mock file not found for artist: ${artistPath}`);
        return res.status(404).json({ error: 'Artist songs not found', details: `No mock file found for artist: ${artistPath}` });
      }
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
      // LOCAL DEVELOPMENT: Read from mock file
      const { artist } = req.query;
      logger.info(`Searching for artists matching: "${artist}"`);
      
      // For development/testing, read from the mock file
      const mockFilePath = path.resolve(__dirname, '../../src/mocks/artists.json');
      
      if (fs.existsSync(mockFilePath)) {
        const fileContent = fs.readFileSync(mockFilePath, 'utf8');
        let artists = JSON.parse(fileContent);
        
        // If artist parameter is provided, filter the results
        if (artist && artist.trim()) {
          const searchTerm = artist.trim().toLowerCase();
          const normalizedSearchTerm = normalizeForSearch(searchTerm);
          
          artists = artists.filter(a => 
            normalizeForSearch(a.displayName).includes(normalizedSearchTerm) ||
            normalizePathForComparison(a.path).includes(normalizePathForComparison(searchTerm))
          );
          logger.info(`Found ${artists.length} artists matching "${searchTerm}"`);
        }
        
        return res.json(artists);
      }
      // LOCAL DEVELOPMENT: Read from mock file

      // If no mock file, try Supabase (production)
      const { data, error } = await supabase
        .from('artists')
        .select('path, displayName, songCount');
      if (error) {
        logger.error('Supabase error fetching artists:', error);
        return res.status(500).json({ error: 'Failed to fetch artists', details: error.message });
      }
      logger.info('API response to frontend:', data);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching artists:', error);
      res.status(500).json({ error: 'Failed to fetch artists', details: error.message });
    }
  }
}

const searchController = new SearchController();

export default searchController;
