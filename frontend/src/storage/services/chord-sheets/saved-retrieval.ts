/**
 * Orchestrated saved chord sheet retrieval service
 * 
 * Composes the modular components (retrieval, access tracking, conversion)
 * to provide the complete saved chord sheet retrieval functionality.
 * Maintains the same public API while using the new modular architecture.
 */

import type { ChordSheet, Song } from '@chordium/types';
import { getSavedStoredChordSheet } from './retrieval';
import { storedToChordSheet } from './conversion';
import { updateAccess } from '../../stores/chord-sheets/utils/access-tracking';
import { ChordSheetStore } from '../../stores/chord-sheets/store';

/**
 * Retrieves a saved chord sheet for the My Chord Sheets tab
 * 
 * Ensures only saved chord sheets are returned, updates access tracking,
 * and converts to domain format. Composed from focused modules.
 */
export async function getSavedChordSheet(path: Song['path']): Promise<ChordSheet | null> {
  try {
    // Pure retrieval - no side effects
    const storedChordSheet = await getSavedStoredChordSheet(path);
    
    if (!storedChordSheet) {
      return null;
    }
    
    // Update access tracking (non-critical, won't fail retrieval)
    try {
      const updatedChordSheet = updateAccess(storedChordSheet);
      const chordSheetStore = new ChordSheetStore();
      
      // Store back with updated metadata, maintaining saved status
      await chordSheetStore.store(
        {
          title: updatedChordSheet.title,
          artist: updatedChordSheet.artist,
          songChords: updatedChordSheet.songChords,
          songKey: updatedChordSheet.songKey,
          guitarTuning: updatedChordSheet.guitarTuning,
          guitarCapo: updatedChordSheet.guitarCapo
        } as ChordSheet,
        { saved: updatedChordSheet.storage.saved },
        path
      );
    } catch (accessError) {
      console.warn('Failed to update access tracking:', accessError);
      // Continue with retrieval - access tracking is non-critical
    }
    
    // Convert to domain format
    return storedToChordSheet(storedChordSheet);
    
  } catch (error) {
    console.error(`Failed to retrieve saved chord sheet for path "${path}":`, error);
    return null;
  }
}
