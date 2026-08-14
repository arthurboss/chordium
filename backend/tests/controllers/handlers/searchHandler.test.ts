import { jest } from '@jest/globals';
import { Request, Response } from 'express';

const mockCifraClubService = {
  search: jest.fn() as jest.MockedFunction<(query: string) => Promise<unknown[]>>
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

const ARTIST_HIT = { type: 'artist', displayName: 'Adele', path: 'adele', songCount: null };
const SONG_HIT = { type: 'song', title: 'Hello', artist: 'Adele', path: 'adele/hello' };

describe('searchHandler', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('returns 400 if query is missing', async () => {
    const [req, res] = mockReqRes({});
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing search query' });
  });

  it('returns 400 if query is only whitespace', async () => {
    const [req, res] = mockReqRes({ q: '   ' });
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockCifraClubService.search).not.toHaveBeenCalled();
  });

  it('returns artists and songs together for a single query', async () => {
    mockCifraClubService.search.mockResolvedValue([ARTIST_HIT, SONG_HIT]);
    const [req, res] = mockReqRes({ q: 'adele' });
    await searchHandler(req, res);
    expect(mockCifraClubService.search).toHaveBeenCalledWith('adele');
    expect(res.json).toHaveBeenCalledWith([ARTIST_HIT, SONG_HIT]);
  });

  it('searches the whole phrase rather than splitting it', async () => {
    mockCifraClubService.search.mockResolvedValue([SONG_HIT]);
    const [req, res] = mockReqRes({ q: '  adele hello  ' });
    await searchHandler(req, res);
    expect(mockCifraClubService.search).toHaveBeenCalledWith('adele hello');
    expect(res.json).toHaveBeenCalledWith([SONG_HIT]);
  });

  it('returns 500 on error', async () => {
    mockCifraClubService.search.mockRejectedValue(new Error('Search source failed'));
    const [req, res] = mockReqRes({ q: 'adele' });
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Search failed' }));
  });
});
