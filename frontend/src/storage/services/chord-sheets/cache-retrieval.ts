/**
 * Cache retrieval service for search and general chord sheet loading
 * 
 * This service checks if a chord sheet exists in IndexedDB cache before
 * allowing a backend fetch. Used by the search feature and general chord
 * sheet loading to avoid unnecessary API calls for previously fetched content.
 * 
 * Returns ANY chord sheet from IndexedDB (saved OR cached).
 */

import type { ChordSheet, Song } from '@chordium/types';
import { ChordSheetStore } from '../../stores/chord-sheets/store';

/**
 * Retrieves a chord sheet from IndexedDB cache by song path
 * 
 * Used by search and general loading to check if a chord sheet is already
 * cached before making backend API calls. Returns any chord sheet regardless
 * of saved status.
 * 
 * @param path - Song path used as IndexedDB key (e.g., "eagles/hotel-california")
 * @returns Promise resolving to ChordSheet if found in cache, null if not cached
 */
export async function getChordSheetFromCache(path: Song['path']): Promise<ChordSheet | null> {
  try {
    const chordSheetStore = new ChordSheetStore();
    const storedChordSheet = await chordSheetStore.get(path);
    
    if (storedChordSheet) {
      // Found in IndexedDB - convert StoredChordSheet back to ChordSheet
      const chordSheet: ChordSheet = {
        title: storedChordSheet.title,
        artist: storedChordSheet.artist,
        songChords: storedChordSheet.songChords,
        songKey: storedChordSheet.songKey,
        guitarTuning: storedChordSheet.guitarTuning,
        guitarCapo: storedChordSheet.guitarCapo
      };
      return chordSheet;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking IndexedDB cache:', error);
    return null;
  }
}
