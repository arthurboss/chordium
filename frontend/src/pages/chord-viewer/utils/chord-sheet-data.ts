import type { ChordSheet } from "@/types/chordSheet";
import type { ChordSheetData } from "../chord-viewer.types";

/**
 * Creates a complete chord sheet data object for display
 * Simply combines the backend ChordSheet with the storage path
 * 
 * @param chordSheet - ChordSheet data from backend (already has title/artist)
 * @param path - Storage path for the chord sheet
 * @returns Complete chord sheet data structure
 */
export function createChordSheetData(
  chordSheet: ChordSheet,
  path: string
): ChordSheetData {
  return { 
    chordSheet, 
    path 
  };
}
