import { ChordSheet } from '../types/chordSheet';
import { generateCacheKey } from '../cache/core/cache-key-generator';

/**
 * Sample Song Loader Service
 * SRP: Single responsibility for loading sample songs from local JSON files
 * DRY: Centralized logic for sample song loading without duplicating cache logic
 */

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
    const filePath = `/data/songs/${filename}.json`;
    
    const response = await fetch(filePath);
    
    if (!response.ok) {
      return null;
    }
    
    const chordSheet: ChordSheet = await response.json();
    
    return chordSheet;
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
