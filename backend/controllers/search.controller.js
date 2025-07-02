import SEARCH_TYPES from '../constants/searchTypes.js';
import cifraClubService from '../services/cifraclub.service.js';
import { s3StorageService as S3StorageService } from '../services/s3-storage.service.js';
import logger from '../utils/logger.js';
import { normalizeArtistResults } from '../utils/response-normalizers.js';

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
            // Normalize Supabase results to match CifraClub format
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
      
      // Extract artist name from path (remove trailing slash if present)
      const normalizedArtistPath = artistPath.replace(/\/$/, '');
      logger.info(`Fetching songs for artist with path: ${artistPath}`);
      
      // Try to get cached songs from S3 first
      try {
        const cachedSongs = await S3StorageService.getArtistSongs(normalizedArtistPath);
        if (cachedSongs && cachedSongs.length > 0) {
          logger.info(`Found ${cachedSongs.length} cached songs for artist ${normalizedArtistPath} in S3`);
          return res.json(cachedSongs);
        }
      } catch (cacheError) {
        logger.warn(`Failed to retrieve cached songs for ${normalizedArtistPath} from S3:`, cacheError.message);
      }
      
      // Cache miss or error - fetch from CifraClub and cache the results
      logger.info(`No cached data for ${normalizedArtistPath}, fetching from CifraClub...`);
      const artistUrl = `${cifraClubService.baseUrl}/${artistPath}/`;
      const songs = await cifraClubService.getArtistSongs(artistUrl);
      logger.info(`Found ${songs.length} songs for artist ${artistPath} from CifraClub`);
      
      // Cache the results in S3 for future requests
      if (songs && songs.length > 0) {
        try {
          await S3StorageService.storeArtistSongs(normalizedArtistPath, songs);
          logger.info(`Cached ${songs.length} songs for artist ${normalizedArtistPath} in S3`);
        } catch (cacheError) {
          logger.warn(`Failed to cache songs for ${normalizedArtistPath} in S3:`, cacheError.message);
        }
      }
      
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
        logger.error('❌ getChordSheet: Missing song URL parameter');
        return res.status(400).json({ error: 'Missing song URL' });
      }

      logger.info(`🎵 CHORD SHEET FETCH START: ${url}`);
      logger.info(`📊 Flow Step 1: Backend received chord sheet request`);
      logger.info(`📋 Request Details:`, { 
        url,
        timestamp: new Date().toISOString() 
      });
      
      const chordSheet = await cifraClubService.getChordSheet(url);
      
      if (!chordSheet?.songChords) {
        logger.error(`❌ Flow Step 2: No chord sheet data returned from CifraClub service for ${url}`);
        return res.status(404).json({ error: 'Chord sheet not found' });
      }

      logger.info(`✅ Flow Step 2: Chord sheet data extracted successfully`);
      logger.info(`📏 Chords length: ${chordSheet.songChords.length} characters`);
      logger.info(`📝 Title: "${chordSheet.title}", Artist: "${chordSheet.artist}"`);
      logger.info(`🎵 Metadata - Key: ${chordSheet.songKey || 'none'}, Capo: ${chordSheet.guitarCapo || 'none'}, Tuning: ${chordSheet.guitarTuning ? JSON.stringify(chordSheet.guitarTuning) : 'none'}`);
      logger.info(`📤 Flow Step 3: Sending ChordSheet response to frontend`);

      res.json(chordSheet);
    } catch (error) {
      logger.error('❌ Error fetching chord sheet:', error);
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
          // Normalize Supabase results to match CifraClub format
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

  async addSongToArtist(req, res) {
    try {
      const { artistName, song } = req.body;
      
      if (!artistName || !song) {
        return res.status(400).json({ error: 'Missing artistName or song data' });
      }
      
      if (!song.title || !song.path) {
        return res.status(400).json({ error: 'Song must have title and path properties' });
      }
      
      logger.info(`Adding song "${song.title}" to artist "${artistName}"`);
      
      const success = await S3StorageService.addSongToArtist(artistName, song);
      
      if (success) {
        logger.info(`Successfully added song "${song.title}" to artist "${artistName}"`);
        res.json({ success: true, message: 'Song added successfully' });
      } else {
        res.status(500).json({ error: 'Failed to add song to artist' });
      }
    } catch (error) {
      logger.error('Error adding song to artist:', error);
      res.status(500).json({ error: 'Failed to add song to artist', details: error.message });
    }
  }

  async removeSongFromArtist(req, res) {
    try {
      const { artistName, songPath } = req.body;
      
      if (!artistName || !songPath) {
        return res.status(400).json({ error: 'Missing artistName or songPath' });
      }
      
      logger.info(`Removing song with path "${songPath}" from artist "${artistName}"`);
      
      const success = await S3StorageService.removeSongFromArtist(artistName, songPath);
      
      if (success) {
        logger.info(`Successfully removed song with path "${songPath}" from artist "${artistName}"`);
        res.json({ success: true, message: 'Song removed successfully' });
      } else {
        res.status(404).json({ error: 'Song not found in artist list' });
      }
    } catch (error) {
      logger.error('Error removing song from artist:', error);
      res.status(500).json({ error: 'Failed to remove song from artist', details: error.message });
    }
  }

  async listCachedArtists(req, res) {
    try {
      logger.info('Listing all cached artists from S3');
      
      const artists = await S3StorageService.listArtists();
      
      logger.info(`Found ${artists.length} cached artists in S3`);
      res.json({ artists });
    } catch (error) {
      logger.error('Error listing cached artists:', error);
      res.status(500).json({ error: 'Failed to list cached artists', details: error.message });
    }
  }
}

const searchController = new SearchController();

export default searchController;
