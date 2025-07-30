/**
 * Access tracking persistence for chord sheets
 * 
 * Handles the concern of persisting access tracking updates back to storage.
 * Separated from pure access tracking logic to isolate storage operations.
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/chord-sheet";
import { ChordSheetStore } from "../../../stores/chord-sheets/store";
import { updateAccess } from "../../../stores/chord-sheets/utils/access-tracking";

/**
 * Updates and persists access tracking for a chord sheet
 * 
 * Updates the access metadata and saves it back to storage.
 * Non-critical operation - logs errors but doesn't throw.
 */
export async function persistAccessUpdate(
  storedChordSheet: StoredChordSheet,
  path: Song['path']
): Promise<void> {
  try {
    const chordSheetStore = new ChordSheetStore();
    const updatedChordSheet = updateAccess(storedChordSheet);
    
    // Store back with updated metadata, maintaining saved status
    await chordSheetStore.store(
      {
        title: updatedChordSheet.title,
        artist: updatedChordSheet.artist,
        songChords: updatedChordSheet.songChords,
        songKey: updatedChordSheet.songKey,
        guitarTuning: updatedChordSheet.guitarTuning,
        guitarCapo: updatedChordSheet.guitarCapo
      },
      { saved: true },
      path
    );
  } catch (error) {
    // Log but don't throw - access tracking updates are not critical
    console.warn(`Failed to persist access update for "${path}":`, error);
  }
}
