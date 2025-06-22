import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSampleChordSheet } from '../sample-song-loader';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock fetch
global.fetch = vi.fn();

describe('Sample Song Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load Oasis Wonderwall from JSON file', async () => {
    const mockChordSheet: ChordSheet = {
      title: 'Wonderwall',
      artist: 'Oasis',
      songChords: '[Intro]\nEm7  G  Dsus4  A7sus4',
      songKey: 'G',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockChordSheet)
    } as Response);

    const result = await loadSampleChordSheet('oasis', 'wonderwall');
    
    expect(fetch).toHaveBeenCalledWith('/src/data/songs/oasis-wonderwall.json');
    expect(result).toEqual(mockChordSheet);
  });

  it('should load Eagles Hotel California from JSON file', async () => {
    const mockChordSheet: ChordSheet = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Intro]\nBm  F#  A  E  G  D  Em  F#',
      songKey: 'Bm',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockChordSheet)
    } as Response);

    const result = await loadSampleChordSheet('eagles', 'hotel_california');
    
    expect(fetch).toHaveBeenCalledWith('/src/data/songs/eagles-hotel_california.json');
    expect(result).toEqual(mockChordSheet);
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
