import request from 'supertest';
import express from 'express';
import { jest, describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import { BackendFixtureLoader } from '../fixture-loader';

const fixtureLoader = new BackendFixtureLoader();

// Mock setup (shared across files)
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn()
};

const mockCifraClubService = {
  baseUrl: 'https://www.cifraclub.com.br',
  search: jest.fn(),
  getArtistSongs: jest.fn(),
  getChordSheet: jest.fn()
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
  createClient: () => mockSupabase
}));

jest.unstable_mockModule('../../config/config', () => ({
  __esModule: true,
  default: {
    supabase: {
      url: 'http://localhost:54321/mock',
      serviceRoleKey: 'dummy-key'
    }
  }
}));

jest.unstable_mockModule('../../services/cifraclub.service', () => ({
  default: mockCifraClubService
}));

jest.unstable_mockModule('../../services/s3-storage.service', () => ({
  s3StorageService: mockS3StorageService
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let searchRouter: any;

beforeAll(async () => {
  const module = await import('../../routes/api');
  searchRouter = module.default;
});

describe('GET /api/artist-songs', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', searchRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    (mockSupabase.ilike as jest.Mock).mockImplementation(() => Promise.resolve({ data: [], error: null }));
    (mockCifraClubService.search as jest.Mock).mockImplementation(() => Promise.resolve([]));
    (mockCifraClubService.getArtistSongs as jest.Mock).mockImplementation(() => Promise.resolve([]));
    (mockS3StorageService.getArtistSongs as jest.Mock).mockImplementation(() => Promise.resolve(null));
  });

  it('should fetch artist songs from CifraClub', async () => {
    const artistPath = 'test-artist';
    const mockArtistSongs = fixtureLoader.getArtistSongs('radiohead').slice(0, 1);
    (mockCifraClubService.getArtistSongs as jest.Mock).mockImplementation(() => Promise.resolve(mockArtistSongs));

    const response = await request(app).get('/api/artist-songs').query({ artistPath });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockArtistSongs);
    expect(mockCifraClubService.getArtistSongs).toHaveBeenCalledWith(
      `https://www.cifraclub.com.br/${artistPath}/`
    );
  });

  it('should return 400 when artistPath is missing', async () => {
    const response = await request(app).get('/api/artist-songs');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing artist path');
  });
});
