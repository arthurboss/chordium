import { ChordSheet } from '../types/chordSheet';

/**
 * Sample Song Loader Service
 */

/**
 * Load a specific sample chord sheet from local JSON files by path
 * @param path - Song path (e.g., 'oasis/wonderwall')
 * @returns ChordSheet object or null if not found
 */
export async function loadSampleChordSheetByPath(path: string): Promise<ChordSheet | null> {
  try {
    // Convert path format to filename format for JSON files
    const filename = path.replace('/', '-');
    const filePath = `/data/songs/${filename}.json`;
    
    console.log(`🎵 Loading sample song by path: ${filePath}`);
    
    const response = await fetch(filePath);
    
    if (!response.ok) {
      console.log(`📭 Sample song not found: ${filePath}`);
      return null;
    }
    
    const chordSheet: ChordSheet = await response.json();
    console.log(`✅ Loaded sample song: "${chordSheet.title}" by ${chordSheet.artist}`);
    
    return chordSheet;
  } catch (error) {
    console.error(`❌ Failed to load sample song for path ${path}:`, error);
    return null;
  }
}


/**
 * Check if a song is a known sample song by path
 * @param path - Song path
 * @returns boolean indicating if this is a sample song
 */
export function isSampleSongByPath(path: string): boolean {
  const knownSampleSongs = ['oasis/wonderwall', 'eagles/hotel-california'];
  return knownSampleSongs.includes(path);
}
