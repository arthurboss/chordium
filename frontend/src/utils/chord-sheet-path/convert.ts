/**
 * Converts chord sheet paths to database storage paths
 */

/**
 * Converts a chord sheet path to database path format
 * 
 * @param chordSheetPath - Chord sheet path in format artist-name_song-title  
 * @returns Database path in format artist-name/song-title
 */
export function chordSheetPathToStoragePath(chordSheetPath: string): string {
  return chordSheetPath.replace('_', '/');
}
