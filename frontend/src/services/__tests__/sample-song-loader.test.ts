import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSampleChordSheet } from '../sample-song-loader';
import wonderwall from '../../../../shared/fixtures/chord-sheet/oasis-wonderwall.json';
import hotelCalifornia from '../../../../shared/fixtures/chord-sheet/eagles-hotel_california.json';

// Mock fetch
global.fetch = vi.fn();

describe('Sample Song Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load Oasis Wonderwall from JSON file', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(wonderwall)
    } as Response);

    const result = await loadSampleChordSheet('oasis', 'wonderwall');
    expect(result).toEqual(wonderwall);
  });

  it('should load Eagles Hotel California from JSON file', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(hotelCalifornia)
    } as Response);

    const result = await loadSampleChordSheet('eagles', 'hotel_california');
    expect(result).toEqual(hotelCalifornia);
  });

  it('should return null when sample song file is not found', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response);

    const result = await loadSampleChordSheet('unknown', 'song');
    expect(result).toBeNull();
  });

  it('should return null when fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const result = await loadSampleChordSheet('oasis', 'wonderwall');
    
    expect(result).toBeNull();
  });
});
