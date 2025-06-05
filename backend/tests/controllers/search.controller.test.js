import request from 'supertest';
import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import the search controller directly
import '../../controllers/search.controller.js';

// Import the router after the mocks are set up
import searchRouter from '../../routes/api.js';
import { supabase, createClient } from '../__mocks__/supabase.js';
import cifraClubService from '../__mocks__/cifraclub.service.js';

// Mock the CifraClub service
jest.mock('../../services/cifraclub.service.js', () => ({
  __esModule: true,
  default: {
    baseUrl: 'https://www.cifraclub.com.br',
    search: jest.fn(),
    getArtistSongs: jest.fn(),
    getChordSheet: jest.fn(),
    mockSuccessfulSearch: function(results) {
      this.search.mockResolvedValue(results);
      return this;
    },
    mockSearchError: function(error) {
      this.search.mockRejectedValue(error);
      return this;
    },
    mockSuccessfulArtistSongs: function(songs) {
      this.getArtistSongs.mockResolvedValue(songs);
      return this;
    },
    mockArtistSongsError: function(error) {
      this.getArtistSongs.mockRejectedValue(error);
      return this;
    },
    mockSuccessfulChordSheet: function(content) {
      this.getChordSheet.mockResolvedValue(content);
      return this;
    },
    mockChordSheetError: function(error) {
      this.getChordSheet.mockRejectedValue(error);
      return this;
    }
  }
}));

// Mock the modules
jest.mock('@supabase/supabase-js');

// Setup Express app
const app = express();
app.use(express.json());
app.use('/api', searchRouter);

describe('Search Controller', () => {
  // Mock data
  const mockArtists = [
    { id: 1, displayName: 'Test Artist', path: 'test-artist' },
    { id: 2, displayName: 'Another Artist', path: 'another-artist' }
  ];

  const mockSongs = [
    { title: 'Test Song', url: 'https://www.cifraclub.com.br/test-artist/test-song' },
    { title: 'Another Song', url: 'https://www.cifraclub.com.br/test-artist/another-song' }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock implementations
    createClient.mockImplementation(() => supabase);
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.ilike.mockReturnThis();
  });

  describe('GET /api/artists', () => {
    it('should return artists from Supabase when available', async () => {
      // Mock successful Supabase response
      supabase.mockSuccess(mockArtists);

      const response = await request(app)
        .get('/api/artists')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArtists);
      expect(supabase.from).toHaveBeenCalledWith('artists');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.ilike).toHaveBeenCalledWith('displayName', '%test%');
    });

    it('should fall back to CifraClub when Supabase fails', async () => {
      // Mock Supabase error
      const error = new Error('Database error');
      supabase.mockError(error);
      
      // Mock CifraClub response
      cifraClubService.mockSuccessfulSearch([
        { title: 'Test Artist', url: 'https://www.cifraclub.com.br/test-artist' }
      ]);

      const response = await request(app)
        .get('/api/artists')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(cifraClubService.search).toHaveBeenCalledWith('test', 'artist');
    });

    it('should return 400 when artist query is missing', async () => {
      const response = await request(app)
        .get('/api/artists');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing artist query parameter');
    });
  });

  describe('GET /api/cifraclub-search', () => {
    it('should search for artists with Supabase fallback', async () => {
      // Mock successful Supabase response for artist search
      supabase.mockSuccess(mockArtists);

      const response = await request(app)
        .get('/api/cifraclub-search')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArtists);
      expect(supabase.from).toHaveBeenCalledWith('artists');
    });

    it('should fall back to CifraClub for artist search when Supabase fails', async () => {
      // Mock Supabase error
      supabase.mockError(new Error('Database error'));
      
      // Mock CifraClub response
      const cifraClubResults = [
        { title: 'Test Artist', url: 'https://www.cifraclub.com.br/test-artist' }
      ];
      cifraClubService.mockSuccessfulSearch(cifraClubResults);

      const response = await request(app)
        .get('/api/cifraclub-search')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(cifraClubResults);
      expect(cifraClubService.search).toHaveBeenCalledWith('test', 'artist');
    });

    it('should search for songs directly with CifraClub', async () => {
      // Mock CifraClub response for song search
      cifraClubService.mockSuccessfulSearch(mockSongs);

      const response = await request(app)
        .get('/api/cifraclub-search')
        .query({ song: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSongs);
      expect(cifraClubService.search).toHaveBeenCalledWith('test', 'song');
    });
  });

  describe('GET /api/artist-songs', () => {
    it('should fetch artist songs from CifraClub', async () => {
      const artistPath = 'test-artist';
      cifraClubService.mockSuccessfulArtistSongs(mockSongs);

      const response = await request(app)
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSongs);
      expect(cifraClubService.getArtistSongs).toHaveBeenCalledWith(
        `https://www.cifraclub.com.br/${artistPath}/`
      );
    });

    it('should return 400 when artistPath is missing', async () => {
      const response = await request(app)
        .get('/api/artist-songs');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing artist path');
    });
  });
});
