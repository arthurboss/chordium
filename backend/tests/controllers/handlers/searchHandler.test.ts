import { jest } from '@jest/globals';
import { Request, Response } from 'express';

// Setup mocks using unstable_mockModule for ES modules
const mockSearchArtistsInSupabase = jest.fn() as jest.MockedFunction<
  (query: string) => Promise<{ data: unknown[] | null; error: string | null }>
>;

const mockCifraClubService = {
  search: jest.fn() as jest.MockedFunction<(query: string, type: string) => Promise<unknown[]>>
};

jest.unstable_mockModule('../../../services/supabase-artist.service.js', () => ({
  searchArtistsInSupabase: mockSearchArtistsInSupabase,
}));

jest.unstable_mockModule('../../../services/cifraclub.service.js', () => ({
  default: mockCifraClubService,
}));

// Import the handler after setting up mocks
const { searchHandler } = await import('../../../controllers/handlers/searchHandler.js');

const mockReqRes = (query: Record<string, unknown> = {}) => {
  const res = { 
    status: jest.fn().mockReturnThis(), 
    json: jest.fn() 
  } as unknown as Response;
  
  const req = { 
    query 
  } as unknown as Request;
  
  return [req, res] as const;
};

describe('searchHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 if query or searchType is missing', async () => {
    const [req, res] = mockReqRes({});
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid search query' });
  });

  it('returns Supabase results if found', async () => {
    mockSearchArtistsInSupabase.mockResolvedValue({ data: [{ id: 1 }], error: null });
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(mockSearchArtistsInSupabase).toHaveBeenCalled();
  });

  it('falls back to CifraClub if Supabase fails', async () => {
    mockSearchArtistsInSupabase.mockResolvedValue({ data: null, error: 'fail' });
    mockCifraClubService.search.mockResolvedValue(['fallback']);
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(mockCifraClubService.search).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(['fallback']);
  });

  it('falls back to CifraClub if Supabase returns no results', async () => {
    mockSearchArtistsInSupabase.mockResolvedValue({ data: [], error: null });
    mockCifraClubService.search.mockResolvedValue(['fallback']);
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(mockCifraClubService.search).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(['fallback']);
  });

  it('returns 500 on error', async () => {
    mockSearchArtistsInSupabase.mockImplementation(() => { 
      throw new Error('fail'); 
    });
    mockCifraClubService.search.mockRejectedValue(new Error('CifraClub also failed'));
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Search failed' }));
  });
});
