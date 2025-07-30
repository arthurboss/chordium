/**
 * Pure retrieval logic for saved chord sheets
 * 
 * Handles only the retrieval concern - checking storage and validating
 * saved status. Does not handle access tracking or data conversion.
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/chord-sheet";
import { ChordSheetStore } from "../../../stores/chord-sheets/store";

/**
 * Retrieves a saved chord sheet from storage
 * 
 * Returns the stored chord sheet only if it exists and is marked as saved.
 * Pure retrieval function with no side effects (no access tracking).
 */
export async function getSavedStoredChordSheet(path: Song['path']): Promise<StoredChordSheet | null> {
  const chordSheetStore = new ChordSheetStore();
  const storedChordSheet = await chordSheetStore.get(path);
  
  // Only return chord sheets that are saved (not just cached)
  if (!storedChordSheet?.storage.saved) {
    return null;
  }
  
  return storedChordSheet;
}
