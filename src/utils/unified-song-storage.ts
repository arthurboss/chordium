import { Song } from '@/types/song';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
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
 * Save ChordSheet objects to mySongs cache (compatibility function)
 * @param chordSheets Array of ChordSheet objects to save
 */
export const saveChordSheets = (chordSheets: ChordSheet[]): void => {
  console.warn('Direct saveChordSheets usage is deprecated. Use addChordSheet or updateChordSheet instead.');
  // For compatibility with tests, we need to implement this
  // Clear existing and add all
  // This is not optimal but needed for backward compatibility
};

/**
 * Save songs array to mySongs (backward compatibility - deprecated)
 * @param songs Array of songs to save
 */
export const saveSongs = (songs: Song[]): void => {
  console.warn('Direct saveSongs usage is deprecated. Use addChordSheet instead.');
  // This function is deprecated - all new code should use addChordSheet
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
 * Add a new song to mySongs (backward compatibility - deprecated)
 * @param song Song to add
 */
export const addSong = (song: Song): void => {
  console.warn('Cannot add song without chord content. Use addChordSheet instead.');
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
 * Update an existing song (backward compatibility - deprecated)
 * @param updatedSong Song with updated data
 */
export const updateSong = (updatedSong: Song): void => {
  console.warn('Cannot update song without chord content. Use updateChordSheet instead.');
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
  console.warn('loadSongs is deprecated. Use loadChordSheets instead.');
  // Return existing songs as ChordSheet objects converted to Song format
  const chordSheets = loadChordSheets([]);
  return chordSheets.map(chordSheetToSong);
};

// Legacy interface for migration purposes only
interface LegacySong extends Song {
  content?: string;
}

/**
 * Migration utility to move songs from old storage key to new unified key
 * This ensures data is not lost during the transition
 */
export const migrateSongsFromOldStorage = (): void => {
  try {
    const oldSongs = localStorage.getItem('chordium-songs');
    if (oldSongs) {
      const parsedOldSongs: LegacySong[] = JSON.parse(oldSongs);
      const currentChordSheets = getAllFromMySongs();
      
      // Convert old songs to chord sheets and merge with current chord sheets
      parsedOldSongs.forEach((oldSong: LegacySong) => {
        const exists = currentChordSheets.some(chordSheet => 
          chordSheet.title === oldSong.title && chordSheet.artist === oldSong.artist
        );
        if (!exists && oldSong.content) {
          const chordSheet: ChordSheet = {
            title: oldSong.title,
            artist: oldSong.artist,
            songChords: oldSong.content,
            songKey: '',
            guitarTuning: GUITAR_TUNINGS.STANDARD,
            guitarCapo: 0
          };
          addToMySongs(oldSong.artist, oldSong.title, chordSheet);
        }
      });
      
      // Remove old storage key after successful migration
      localStorage.removeItem('chordium-songs');
      console.log('Successfully migrated songs from old storage');
    }
  } catch (e) {
    console.error('Failed to migrate songs from old storage:', e);
  }
};

/**
 * Migration utility to convert old Song objects that have chord content in the path field
 * to the new ChordSheet structure where chord content is stored properly
 */
export const migrateChordContentFromPath = (): void => {
  try {
    // Check if we have old Song-based storage in the new mySongs key
    const oldSongsData = localStorage.getItem('mySongs');
    if (!oldSongsData) return;
    
    let oldSongs: LegacySong[];
    try {
      oldSongs = JSON.parse(oldSongsData);
    } catch {
      return; // Invalid JSON, nothing to migrate
    }
    
    // Check if this is already in the new cache structure
    if (oldSongsData.includes('"items"') && oldSongsData.includes('"timestamp"')) {
      return; // Already migrated to cache structure
    }
    
    // Check if this is already ChordSheet data (new format)
    if (oldSongs.length > 0 && 'songChords' in oldSongs[0]) {
      return; // Already migrated to ChordSheet format
    }
    
    let migrationOccurred = false;
    
    oldSongs.forEach(song => {
      // Check if this song has chord content in the path field
      // Old format: path contains actual chord content (multi-line, with chords)
      // New format: path contains just the identifier/URL
      const hasChordContentInPath = song.path && (
        song.path.includes('\n') || // Multi-line content
        song.path.includes('[') ||  // Chord brackets like [C] [G]
        song.path.length > 100      // Very long content (probably chords)
      );
      
      if (hasChordContentInPath || song.content) {
        console.log(`🔄 Migrating song "${song.title}" to ChordSheet format`);
        
        // Create a ChordSheet object with the chord content
        const chordSheet: ChordSheet = {
          title: song.title,
          artist: song.artist,
          songChords: song.content ?? song.path, // Use content if available, otherwise path
          songKey: '', // Default values for now
          guitarTuning: GUITAR_TUNINGS.STANDARD,
          guitarCapo: 0
        };
        
        addToMySongs(song.artist, song.title, chordSheet);
        
        // Cache the chord sheet content
        cacheChordSheet(song.artist, song.title, chordSheet);
        
        migrationOccurred = true;
      }
    });
    
    if (migrationOccurred) {
      console.log('✅ Successfully migrated Song objects to ChordSheet format');
    }
  } catch (e) {
    console.error('❌ Failed to migrate chord content from path:', e);
  }
};
