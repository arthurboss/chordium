/**
 * Chord sheet retrieval service
 * 
 * Handles retrieving chord sheets from IndexedDB storage with proper
 * error handling and type conversion between StoredChordSheet and ChordSheet.
 */

import type { ChordSheet, Song } from '@chordium/types';
import { ChordSheetStore } from '../../stores/chord-sheets/store';

/**
 * Retrieves a chord sheet from IndexedDB by song path
 * 
 * @param path - Song path used as IndexedDB key (e.g., "eagles/hotel-california")
 * @returns Promise resolving to ChordSheet if found, null if not found or on error
 */
export async function getChordSheetFromStorage(path: Song['path']): Promise<ChordSheet | null> {
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
    console.error('Error checking IndexedDB:', error);
    return null;
  }
}
