import { describe, it, expect } from 'vitest';
import { loadSampleChordSheet } from '../sample-song-loader';
import wonderwall from '../../../../shared/fixtures/chord-sheet/oasis-wonderwall.json';
import hotelCalifornia from '../../../../shared/fixtures/chord-sheet/eagles-hotel_california.json';

describe('Sample Song Loader', () => {
  it('should load Oasis Wonderwall from JSON file', async () => {
    const result = await loadSampleChordSheet('oasis', 'wonderwall');
    expect(result).toEqual(wonderwall);
  });

  it('should load Eagles Hotel California from JSON file', async () => {
    const result = await loadSampleChordSheet('eagles', 'hotel_california');
    expect(result).toEqual(hotelCalifornia);
  });

  it('should return null when sample song is not found', async () => {
    const result = await loadSampleChordSheet('unknown', 'song');
    expect(result).toBeNull();
  });

  it('should return null for non-existent sample song', async () => {
    const result = await loadSampleChordSheet('nonexistent', 'song');
    expect(result).toBeNull();
  });
});
