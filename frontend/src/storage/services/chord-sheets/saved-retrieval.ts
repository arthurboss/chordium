/**
 * Saved chord sheets retrieval service for My Chord Sheets tab
 * 
 * This service handles retrieving ONLY saved chord sheets from IndexedDB
 * for the My Chord Sheets tab. It ensures that only chord sheets with
 * storage.saved: true are returned, preventing any backend fetching.
 * 
 * This service is completely isolated from search/fetch logic.
 */

import type { ChordSheet, Song } from '@chordium/types';
import { ChordSheetStore } from '../../stores/chord-sheets/store';

/**
 * Retrieves a SAVED chord sheet from IndexedDB by song path
 * 
 * This function is specifically for My Chord Sheets tab - it only returns
 * chord sheets that are saved (storage.saved: true), preventing any backend
 * fetching and ensuring UI shows only locally saved content.
 * 
 * @param path - Song path used as IndexedDB key (e.g., "eagles/hotel-california")
 * @returns Promise resolving to ChordSheet if found and saved, null otherwise
 */
export async function getSavedChordSheet(path: Song['path']): Promise<ChordSheet | null> {
  try {
    const chordSheetStore = new ChordSheetStore();
    const storedChordSheet = await chordSheetStore.get(path);
    
    // Only return chord sheets that are saved (not just cached)
    if (!storedChordSheet?.storage.saved) {
      return null;
    }
    
    // Update last accessed timestamp for LRU tracking
    try {
      storedChordSheet.storage.lastAccessed = Date.now();
      storedChordSheet.storage.accessCount += 1;
      
      // Store back with updated metadata
      await chordSheetStore.store(
        {
          title: storedChordSheet.title,
          artist: storedChordSheet.artist,
          songChords: storedChordSheet.songChords,
          songKey: storedChordSheet.songKey,
          guitarTuning: storedChordSheet.guitarTuning,
          guitarCapo: storedChordSheet.guitarCapo
        },
        { saved: true }, // Maintain saved status
        path
      );
    } catch (accessError) {
      // Log but don't fail - updating access time is not critical
      console.warn(`Failed to update access time for "${path}":`, accessError);
    }
    
    // Return ChordSheet data
    const chordSheet: ChordSheet = {
      title: storedChordSheet.title,
      artist: storedChordSheet.artist,
      songChords: storedChordSheet.songChords,
      songKey: storedChordSheet.songKey,
      guitarTuning: storedChordSheet.guitarTuning,
      guitarCapo: storedChordSheet.guitarCapo
    };
    
    return chordSheet;
  } catch (error) {
    console.error(`Failed to retrieve saved chord sheet for path "${path}":`, error);
    return null;
  }
}
