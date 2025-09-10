import type { ChordSheet, SongMetadata } from "@chordium/types";
import type { ChordSheetData } from "../chord-viewer.types";

/**
 * Creates a complete chord sheet data object for display
 * Combines metadata and content into a single ChordSheet object for backward compatibility
 * 
 * @param metadata - Song metadata (title, artist, etc.)
 * @param content - Chord sheet content (songChords)
 * @param path - Storage path for the chord sheet
 * @returns Complete chord sheet data structure
 */
export function createChordSheetData(
  metadata: SongMetadata,
  content: ChordSheet,
  path: string
): ChordSheetData {
  // Create a combined ChordSheet object for backward compatibility
  const combinedChordSheet: ChordSheet & SongMetadata = {
    ...metadata,
    ...content
  };
  
  return { 
    chordSheet: combinedChordSheet, 
    path 
  };
}
