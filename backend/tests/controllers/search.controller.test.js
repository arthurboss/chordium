import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import http from 'http';

// Import mocks first
import { supabase, createClient } from '../__mocks__/supabase.js';
import cifraClubService from '../__mocks__/cifraclub.service.js';

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

// Mock the modules
jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

jest.unstable_mockModule('../../services/cifraclub.service.js', () => ({
  __esModule: true,
  default: mockCifraClubService
}));

// Import the modules after setting up the mocks
let SearchController;
let searchRouter;
let app;
let server;

// We'll import these after setting up the mocks
beforeAll(async () => {
  // Import the modules after setting up the mocks
  const searchControllerModule = await import('../../controllers/search.controller.js');
  SearchController = searchControllerModule.default;
  
  const routerModule = await import('../../routes/api.js');
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
  // Mock data
  const mockArtists = [
    { id: 1, displayName: 'Test', path: 'test', songCount: null },
    { id: 2, displayName: 'Crash Test Dummies', path: 'crash-test-dummies', songCount: null }
  ];

  const mockSongs = [
    { title: 'Test Me - Melanie Martinez', url: 'https://www.cifraclub.com.br/melanie-martinez/test-me/' },
    { title: 'Love Test - The Growlers', url: 'https://www.cifraclub.com.br/the-growlers/love-test/' },
    { title: 'Test Drive - Ariana Grande', url: 'https://www.cifraclub.com.br/ariana-grande/test-drive/' },
    { title: 'The Test - The Academy Is...', url: 'https://www.cifraclub.com.br/the-academy-is/the-test/' },
    { title: 'Test of time - Petra', url: 'https://www.cifraclub.com.br/petra/test-of-time/' },
    { title: 'Test Pattern - The Thermals', url: 'https://www.cifraclub.com.br/the-thermals/test-pattern/' },
    { title: 'Fight Test - The Flaming Lips', url: 'https://www.cifraclub.com.br/flaming-lips/fight-test/' }
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
      const mockArtistsResponse = [
        { id: 1, displayName: 'Test', path: 'test', songCount: null }
      ];
      
      // Mock successful Supabase response
      mockSupabaseClient.ilike.mockResolvedValueOnce({ 
        data: mockArtistsResponse, 
        error: null 
      });

      const response = await global.agent
        .get('/api/artists')
        .query({ artist: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockArtistsResponse);
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
      
      mockCifraClubService.getArtistSongs.mockResolvedValue(mockSongs);

      const response = await global.agent
        .get('/api/artist-songs')
        .query({ artistPath });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSongs);
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
  });
});
