import { searchHandler } from '../searchHandler.js';

jest.mock('../../services/supabase-artist.service.js', () => ({
  searchArtistsInSupabase: jest.fn()
}));
jest.mock('../../services/cifraclub.service.js', () => ({
  default: { search: jest.fn() }
}));

const { searchArtistsInSupabase } = require('../../services/supabase-artist.service.js');
const cifraClubService = require('../../services/cifraclub.service.js').default;

const mockReqRes = (query = {}) => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  return [{ query }, res];
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
    searchArtistsInSupabase.mockResolvedValue({ data: [{ id: 1 }], error: null });
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(searchArtistsInSupabase).toHaveBeenCalled();
  });

  it('falls back to CifraClub if Supabase fails', async () => {
    searchArtistsInSupabase.mockResolvedValue({ data: null, error: 'fail' });
    cifraClubService.search.mockResolvedValue(['fallback']);
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(cifraClubService.search).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(['fallback']);
  });

  it('falls back to CifraClub if Supabase returns no results', async () => {
    searchArtistsInSupabase.mockResolvedValue({ data: [], error: null });
    cifraClubService.search.mockResolvedValue(['fallback']);
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(cifraClubService.search).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(['fallback']);
  });

  it('returns 500 on error', async () => {
    searchArtistsInSupabase.mockImplementation(() => { throw new Error('fail'); });
    const [req, res] = mockReqRes({ artist: 'Adele' });
    await searchHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Search failed' }));
  });
});
