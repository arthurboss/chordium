import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Import fixtures
import { BackendFixtureLoader } from '../fixture-loader.js';

// Import mocks first
import { supabase, createClient } from '../__mocks__/supabase.js';
import cifraClubService from '../__mocks__/cifraclub.service.js';

// Initialize fixture loader
const fixtureLoader = new BackendFixtureLoader();

// Mock the modules before importing the router
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockResolvedValue({ data: [], error: null })
};

const mockCifraClubService = {
  search: jest.fn(),
  getArtistSongs: jest.fn(),
  getChordSheet: jest.fn(),
  baseUrl: 'https://www.cifraclub.com.br'
};

const mockS3StorageService = {
  getArtistSongs: jest.fn(),
  storeArtistSongs: jest.fn(),
  saveArtistSongs: jest.fn(),
  saveChordSheet: jest.fn(),
  getChordSheet: jest.fn()
};

// Mock the modules
jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

jest.unstable_mockModule('../../config/config.ts', () => ({
  __esModule: true,
  default: {
    supabase: {
      url: 'http://localhost:54321/mock',
      serviceRoleKey: 'dummy-key'
    }
  }
}));

jest.unstable_mockModule('../../services/cifraclub.service.ts', () => ({
  __esModule: true,
  default: mockCifraClubService
}));

jest.unstable_mockModule('../../services/s3-storage.service.ts', () => ({
  s3StorageService: mockS3StorageService
}));

// Import the modules after setting up the mocks
let SearchController;
let searchRouter;
let app;
let server;

// We'll import these after setting up the mocks
beforeAll(async () => {
  // Import the modules after setting up the mocks
  const searchControllerModule = await import('../../controllers/search.controller.ts');
  SearchController = searchControllerModule.default;
  
  const routerModule = await import('../../routes/api.ts');
  searchRouter = routerModule.default;
  
  // Setup Express app after importing the router
  app = express();
  app.use(express.json());
  app.use('/api', searchRouter);
});

beforeAll(async () => {
  // Create server and listen on a random available port
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      global.agent = request.agent(server);
      resolve();
    });
  });
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset default mock implementations
  mockSupabaseClient.from.mockReturnThis();
  mockSupabaseClient.select.mockReturnThis();
  mockSupabaseClient.ilike.mockResolvedValue({ data: [], error: null });
  
  // Reset CifraClub service mocks
  mockCifraClubService.search.mockResolvedValue([]);
  mockCifraClubService.getArtistSongs.mockResolvedValue([]);
  mockCifraClubService.getChordSheet.mockResolvedValue('');
  
  // Reset S3 service mocks - return null to simulate cache miss
  mockS3StorageService.getArtistSongs.mockResolvedValue(null);
  mockS3StorageService.getChordSheet.mockResolvedValue(null);
});

afterAll(() => {
  // Close the server after all tests are done
  return new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset default mock implementations
  if (supabase.from) supabase.from.mockReturnThis();
  if (supabase.select) supabase.select.mockReturnThis();
  if (supabase.ilike) supabase.ilike.mockResolvedValue({ data: [], error: null });
  
  // Reset CifraClub service mocks
  if (cifraClubService.search) cifraClubService.search.mockResolvedValue([]);
  if (cifraClubService.getArtistSongs) cifraClubService.getArtistSongs.mockResolvedValue([]);
  if (cifraClubService.getChordSheet) cifraClubService.getChordSheet.mockResolvedValue('');
});

describe('Search Controller', () => {
  // Get fixture data instead of inline mocks
  const mockArtists = fixtureLoader.loadFixture('artists').slice(0, 2); // Get first 2 artists
  const mockSongs = fixtureLoader.getSongSearchResult('test'); // Get test songs from fixtures
  const mockArtistSongs = fixtureLoader.getArtistSongs('radiohead'); // Get artist songs from fixtures

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the mock implementations
    createClient.mockImplementation(() => supabase);
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.ilike.mockReturnThis();
    
    // Reset S3 service mocks - return null to simulate cache miss
    mockS3StorageService.getArtistSongs.mockResolvedValue(null);
    mockS3StorageService.getChordSheet.mockResolvedValue(null);
  });

  describe('GET /api/artists', () => {
    it('should return artists from Supabase when available', async () => {
      const mockSupabaseResponse = [
        { id: 1, displayName: 'Test', path: 'test', songCount: null }
      ];
      
      // Mock successful Supabase response
      mockSupabaseClient.ilike.mockResolvedValueOnce({ 
        data: mockSupabaseResponse, 
        error: null 
      });

      const response = await global.agent
        .get('/api/artists')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      // Expect normalized format (without id)
      expect(response.body).toEqual([{
        displayName: 'Test',
        path: 'test',
        songCount: null
      }]);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('artists');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('displayName', '%test%');
    });

    it('should fall back to CifraClub when Supabase fails', async () => {
      // Mock Supabase error
      mockSupabaseClient.ilike.mockRejectedValueOnce(new Error('Database error'));
      
      // Mock CifraClub response to match the actual structure
      const cifraClubResults = [
        { displayName: 'Test', path: 'test', songCount: null },
        { displayName: 'Crash Test Dummies', path: 'crash-test-dummies', songCount: null }
      ];
      mockCifraClubService.search.mockResolvedValue(cifraClubResults);

      const response = await global.agent
        .get('/api/artists')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(mockCifraClubService.search).toHaveBeenCalledWith('test', 'artist');
    });

    it('should fall back to CifraClub when Supabase returns no results (empty array)', async () => {
      // Arrange
      const searchQuery = 'unknown-artist';
      
      // Mock Supabase returning empty array (no results) but no error
      mockSupabaseClient.ilike.mockResolvedValueOnce({ 
        data: [], 
        error: null 
      });
      
      // Mock CifraClub response with expected structure
      const cifraClubResults = [
        { 
          displayName: 'Unknown Artist', 
          path: 'unknown-artist', 
          songCount: 5,
          type: 'artist',
          url: 'https://www.cifraclub.com.br/unknown-artist/'
        }
      ];
      
      mockCifraClubService.search.mockResolvedValue(cifraClubResults);

      // Act
      const response = await global.agent
        .get('/api/artists')
        .query({ artist: searchQuery });

      // Assert
      expect(response.status).toBe(200);
      
      // Verify Supabase was called correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('artists');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('displayName', `%${searchQuery}%`);
      
      // Verify fallback to CifraClub was triggered
      expect(mockCifraClubService.search).toHaveBeenCalledWith(searchQuery, 'artist');
      
      // Verify the response matches CifraClub results
      expect(response.body).toEqual(cifraClubResults);
      
      // Verify the response contains the expected artist data
      expect(response.body[0]).toMatchObject({
        displayName: 'Unknown Artist',
        path: 'unknown-artist'
      });
    });

    it('should return 400 when artist query is missing', async () => {
      const response = await global.agent
        .get('/api/artists')
        .query({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing artist query parameter' });
    });
  });

  describe('GET /api/cifraclub-search', () => {
    it('should search for artists with Supabase fallback', async () => {
      // Mock successful Supabase response
      mockSupabaseClient.from.mockImplementation(() => mockSupabaseClient);
      mockSupabaseClient.select.mockImplementation(() => mockSupabaseClient);
      mockSupabaseClient.ilike.mockResolvedValueOnce({ 
        data: mockArtists, 
        error: null 
      });

      const response = await global.agent
        .get('/api/cifraclub-search')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArtists);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('artists');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('displayName', '%test%');
    });

    it('should fall back to CifraClub for artist search when Supabase fails', async () => {
      // Mock Supabase error
      supabase.mockError({ message: 'Database error' });
      
      // Mock CifraClub response to match the actual structure
      const cifraClubResults = [
        { displayName: 'Test', path: 'test', songCount: null },
        { displayName: 'Crash Test Dummies', path: 'crash-test-dummies', songCount: null }
      ];
      mockCifraClubService.search.mockResolvedValue(cifraClubResults);

      const response = await global.agent
        .get('/api/cifraclub-search')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(cifraClubResults);
      expect(mockCifraClubService.search).toHaveBeenCalledWith('test', 'artist');
    });

    it('should search for songs directly with CifraClub', async () => {
      // Mock CifraClub service response
      mockCifraClubService.search.mockResolvedValue(mockSongs);

      const response = await global.agent
        .get('/api/cifraclub-search')
        .query({ song: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSongs);
      expect(mockCifraClubService.search).toHaveBeenCalledWith('test', 'song');
    });
  });

  describe('GET /api/artist-songs', () => {
    it('should fetch artist songs from CifraClub', async () => {
      const artistPath = 'test-artist';
      
      mockCifraClubService.getArtistSongs.mockResolvedValue(mockArtistSongs);

      const response = await global.agent
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArtistSongs);
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(
        `https://www.cifraclub.com.br/${artistPath}/`
      );
    });

    it('should return 400 when artistPath is missing', async () => {
      const response = await global.agent
        .get('/api/artist-songs');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing artist path');
    });

    it('should normalize artist path by removing trailing slash', async () => {
      const artistPath = 'test-artist/';
      
      mockCifraClubService.getArtistSongs.mockResolvedValue(mockArtistSongs);

      const response = await global.agent
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArtistSongs);
      // Should call with normalized path (no trailing slash)
      expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(
        'https://www.cifraclub.com.br/test-artist/'
      );
    });

    it('should not cache empty artist song results', async () => {
      const artistPath = 'empty-artist';
      
      // Mock empty results
      mockCifraClubService.getArtistSongs.mockResolvedValue([]);

      const response = await global.agent
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      
      // Verify that S3 caching was not called for empty results
      expect(mockS3StorageService.storeArtistSongs).not.toHaveBeenCalled();
    });

    it('should not cache when scraping fails with errors', async () => {
      const artistPath = 'error-artist';
      
      // Mock scraping error
      mockCifraClubService.getArtistSongs.mockRejectedValue(new Error('Scraping failed'));

      const response = await global.agent
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(502);
      expect(response.body.error).toBe('Bad Gateway');
      
      // Verify that S3 caching was not called for scraping errors
      expect(mockS3StorageService.storeArtistSongs).not.toHaveBeenCalled();
    });

    it('should return 502 when scraping fails with a generic error', async () => {
      const artistPath = 'fail-artist';
      mockCifraClubService.getArtistSongs.mockRejectedValueOnce(new Error('Scraping failed for some reason'));

      const response = await global.agent
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(502);
      expect(response.body.error).toBe('Bad Gateway');
      expect(response.body.details).toMatch(/Scraping failed for some reason/);
    });

    it('should return 504 when scraping fails with a timeout error', async () => {
      const artistPath = 'timeout-artist';
      mockCifraClubService.getArtistSongs.mockRejectedValueOnce(new Error('Navigation timeout of 30000 ms exceeded'));

      const response = await global.agent
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(504);
      expect(response.body.error).toBe('Gateway Timeout');
      expect(response.body.details).toMatch(/timeout/i);
    });
  });
});
