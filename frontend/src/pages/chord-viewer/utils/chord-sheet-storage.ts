import storeChordSheet from "@/storage/stores/chord-sheets/operations/store-chord-sheet";
import type { ChordSheetData } from "../chord-viewer.types";

/**
 * Saves a chord sheet to database storage
 * 
 * @param chordSheetData - Complete chord sheet data to save
 * @returns Promise that resolves when save is complete
 */
export async function saveChordSheetToStorage(chordSheetData: ChordSheetData): Promise<void> {
  await storeChordSheet(chordSheetData.chordSheet, true, chordSheetData.path);
}
