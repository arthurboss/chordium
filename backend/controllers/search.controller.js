import SEARCH_TYPES from '../constants/searchTypes.js';
import cifraClubService from '../services/cifraclub.service.js';
import logger from '../utils/logger.js';

// Helper functions outside the class
function buildSearchQuery(artist, song) {
  if (artist && song) return `${artist} ${song}`;
  return artist || song || '';
}

function determineSearchType(artist, song) {
  if (artist && !song) return SEARCH_TYPES.ARTIST;
  if (song && !artist) return SEARCH_TYPES.SONG;
  return SEARCH_TYPES.COMBINED;
}

class SearchController {
  async search(req, res) {
    try {
      const { artist, song } = req.query;
      const query = buildSearchQuery(artist, song);
      const searchType = determineSearchType(artist, song);

      if (!query) {
        return res.status(400).json({ error: 'Missing search query' });
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
      const { artistUrl } = req.query;
      
      if (!artistUrl) {
        return res.status(400).json({ error: 'Missing artist URL' });
      }

      logger.info(`Fetching songs for artist: ${artistUrl}`);
      const songs = await cifraClubService.getArtistSongs(artistUrl);
      res.json(songs);
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

}

// The helper functions are now defined at the top of the file

const searchController = new SearchController();

export default searchController;
