import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';
import { cacheChordSheet } from '@/cache/implementations/chord-sheet-cache';
import { 
  addToMySongs, 
  getAllFromMySongs, 
  updateInMySongs, 
  removeFromMySongs 
} from '@/cache/implementations/my-songs-cache';
import { generateCacheKey } from '@/cache/core/cache-key-generator';

/**
 * Unified song storage utility following SRP (Single Responsibility Principle)
 * This is the single source of truth for song storage operations
 * 
 * Storage Strategy:
 * - Primary Storage: ChordSheet objects in mySongs cache (complete data with cache structure)
 * - Cache: ChordSheet objects in chord-sheet-cache (for performance)
 * - UI Layer: Song objects (converted from ChordSheet for navigation)
 */

/**
 * Get ChordSheet objects from mySongs cache
 * @returns Array of ChordSheet objects, empty array if none exist or on error
 */
export const getChordSheets = (): ChordSheet[] => {
  return getAllFromMySongs();
};



/**
 * Convert ChordSheet to Song for UI compatibility using cache key format
 * @param chordSheet ChordSheet object to convert
 * @returns Song object for UI layer
 */
export const chordSheetToSong = (chordSheet: ChordSheet): Song => {
  const cacheKey = generateCacheKey(chordSheet.artist, chordSheet.title);
  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    path: cacheKey // Use the cache key as the path for consistency
  };
};

/**
 * Get songs from localStorage (converted from ChordSheets for backward compatibility)
 * @returns Array of songs, empty array if none exist or on error
 */
export const getSongs = (): Song[] => {
  const chordSheets = getChordSheets();
  return chordSheets.map(chordSheetToSong);
};

/**
 * Add a new ChordSheet to mySongs cache
 * @param chordSheet ChordSheet to add
 */
export const addChordSheet = (chordSheet: ChordSheet): void => {
  addToMySongs(chordSheet.artist, chordSheet.title, chordSheet);
  
  // Also cache the chord sheet for performance in regular cache
  cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
};



/**
 * Update an existing ChordSheet in mySongs cache
 * @param updatedChordSheet ChordSheet with updated data
 */
export const updateChordSheet = (updatedChordSheet: ChordSheet): void => {
  updateInMySongs(updatedChordSheet.artist, updatedChordSheet.title, updatedChordSheet);
  
  // Update regular cache as well
  cacheChordSheet(updatedChordSheet.artist, updatedChordSheet.title, updatedChordSheet);
};



/**
 * Delete a ChordSheet from mySongs cache
 * @param title Title of the chord sheet to delete
 * @param artist Artist of the chord sheet to delete
 */
export const deleteChordSheet = (title: string, artist: string): void => {
  removeFromMySongs(artist, title);
};

/**
 * Delete a song by path (backward compatibility)
 * @param songPath Path of the song to delete (cache key format)
 */
export const deleteSong = (songPath: string): void => {
  // Parse the cache key to get artist and title
  const dashIndex = songPath.lastIndexOf('-');
  
  if (dashIndex === -1) {
    console.warn('Invalid song path format for deletion:', songPath);
    return;
  }
  
  const artistPart = songPath.substring(0, dashIndex);
  const titlePart = songPath.substring(dashIndex + 1);
  
  // Convert underscores back to spaces
  const artist = artistPart.replace(/_/g, ' ');
  const title = titlePart.replace(/_/g, ' ');
  
  deleteChordSheet(title, artist);
};

/**
 * Load ChordSheets with initial/demo ChordSheets integration
 * @param initialChordSheets Demo/sample ChordSheets to include if no saved ChordSheets exist
 * @returns Combined or existing ChordSheets with deduplication
 */
export const loadChordSheets = (initialChordSheets: ChordSheet[]): ChordSheet[] => {
  const savedChordSheets = getAllFromMySongs();
  
  if (savedChordSheets.length === 0) {
    // No saved chord sheets, add initial chord sheets
    initialChordSheets.forEach(chordSheet => {
      addToMySongs(chordSheet.artist, chordSheet.title, chordSheet);
      
      // Cache all initial chord sheets in regular cache
      cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
    });
    
    return initialChordSheets;
  }
  
  // Deduplication: merge initial chord sheets with saved chord sheets, avoiding duplicates by title+artist
  let mergedChordSheets = [...savedChordSheets];
  let hasNewItems = false;
  
  // Process initial chord sheets, adding missing ones
  for (const initialChordSheet of initialChordSheets) {
    const exists = mergedChordSheets.some(savedChordSheet => 
      savedChordSheet.title === initialChordSheet.title && 
      savedChordSheet.artist === initialChordSheet.artist
    );
    
    if (!exists) {
      // Add the initial chord sheet since it doesn't exist in saved chord sheets
      addToMySongs(initialChordSheet.artist, initialChordSheet.title, initialChordSheet);
      mergedChordSheets = [initialChordSheet, ...mergedChordSheets]; // Add to beginning
      hasNewItems = true;
      
      // Cache the new chord sheet
      cacheChordSheet(initialChordSheet.artist, initialChordSheet.title, initialChordSheet);
    }
    // If it exists, we don't add the initial version (prefer the saved version)
  }
  
  // Return the updated list (getAllFromMySongs will return the sorted/updated list)
  return hasNewItems ? getAllFromMySongs() : savedChordSheets;
};

/**
 * Load songs with initial/demo songs integration (backward compatibility - deprecated)
 * @param initialSongs Demo/sample songs to include if no saved songs exist
 * @returns Combined or existing songs with path-based deduplication
 */
export const loadSongs = (initialSongs: Song[]): Song[] => {
  // Return existing songs as ChordSheet objects converted to Song format
  const chordSheets = loadChordSheets([]);
  return chordSheets.map(chordSheetToSong);
};
