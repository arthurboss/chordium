import { ChordSheet } from '../types/chordSheet';
import { generateCacheKey } from '../cache/core/cache-key-generator';
import wonderwall from '../../../shared/fixtures/chord-sheet/oasis-wonderwall.json';
import hotelCalifornia from '../../../shared/fixtures/chord-sheet/eagles-hotel_california.json';
import creep from '../../../shared/fixtures/chord-sheet/radiohead-creep.json';

/**
 * Sample Song Loader Service
 * SRP: Single responsibility for loading sample songs from local JSON files
 * DRY: Centralized logic for sample song loading without duplicating cache logic
 */

// Map of available sample songs
const SAMPLE_SONGS: Record<string, ChordSheet> = {
  'oasis-wonderwall': wonderwall,
  'eagles-hotel_california': hotelCalifornia,
  'radiohead-creep': creep,
};

/**
 * Load a specific sample chord sheet from local JSON files
 * @param artist - Artist name (normalized format, e.g., 'oasis')
 * @param title - Song title (normalized format, e.g., 'wonderwall')
 * @returns ChordSheet object or null if not found
 */
export async function loadSampleChordSheet(artist: string, title: string): Promise<ChordSheet | null> {
  try {
    // Generate the filename using the same logic as our normalized files
    const filename = generateCacheKey(artist, title);
    
    // Return the sample song if available
    const sampleSong = SAMPLE_SONGS[filename];
    if (sampleSong) {
      return sampleSong;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Failed to load sample song for ${artist}-${title}:`, error);
    return null;
  }
}

/**
 * Check if a song is a known sample song
 * @param artist - Artist name
 * @param title - Song title
 * @returns boolean indicating if this is a sample song
 */
export function isSampleSong(artist: string, title: string): boolean {
  const normalizedKey = generateCacheKey(artist, title);
  const knownSampleSongs = ['oasis-wonderwall', 'eagles-hotel_california'];
  return knownSampleSongs.includes(normalizedKey);
}
