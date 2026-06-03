import { jest } from '@jest/globals';
import { Request, Response } from 'express';

const mockCifraClubService = {
  search: jest.fn() as jest.MockedFunction<(query: string, type: string) => Promise<unknown[]>>
};

jest.unstable_mockModule('../../../services/cifraclub.service.js', () => ({
  default: mockCifraClubService,
}));

const { searchHandler } = await import('../../../controllers/handlers/searchHandler.js');

const mockReqRes = (query: Record<string, unknown> = {}) => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;
  const req = { query } as unknown as Request;
  return [req, res] as const;
};

describe('searchHandler', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns 400 if query is missing', async () => {
    const [req, res] = mockReqRes({});
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid search query' });
  });

  it('returns CifraClub results for artist search', async () => {
    mockCifraClubService.search.mockResolvedValue([{ displayName: 'Adele', path: 'adele', songCount: null }]);
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(mockCifraClubService.search).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ displayName: 'Adele', path: 'adele', songCount: null }]);
  });

  it('returns CifraClub results for song search', async () => {
    mockCifraClubService.search.mockResolvedValue([{ title: 'Hello', artist: 'Adele', path: 'adele/hello' }]);
    const [req, res] = mockReqRes({ song: 'Hello' });
    await searchHandler(req, res);
    expect(mockCifraClubService.search).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ title: 'Hello', artist: 'Adele', path: 'adele/hello' }]);
  });

  it('returns 500 on error', async () => {
    mockCifraClubService.search.mockRejectedValue(new Error('CifraClub failed'));
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Search failed' }));
  });
});
