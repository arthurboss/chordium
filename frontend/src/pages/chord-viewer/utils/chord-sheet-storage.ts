import storeChordSheet from "@/storage/stores/chord-sheets/operations/store-chord-sheet";
import type { ChordSheetData } from "../chord-viewer.types";

/**
 * Saves a chord sheet to database storage or updates an existing cached one
 * 
 * Sets saved: true for user-saved chord sheets. If the chord sheet was already
 * cached from API fetch (with saved: false), this will update it to saved: true.
 * 
 * @param chordSheetData - Complete chord sheet data to save
 * @returns Promise that resolves when save is complete
 */
export async function saveChordSheetToStorage(chordSheetData: ChordSheetData): Promise<void> {
  // Always store with saved: true - this will either create new or update existing
  await storeChordSheet(chordSheetData.chordSheet, true, chordSheetData.path);
}
