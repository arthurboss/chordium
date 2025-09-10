/**
 * Utility functions for splitting chord sheets into metadata and content
 */

import type { StoredChordSheet } from "../../../types/chord-sheet";
import type { StoredChordSheetMetadata } from "../../../types/chord-sheet-metadata";
import type { StoredChordSheetContent } from "../../../types/chord-sheet-content";

/**
 * Splits a complete StoredChordSheet into separate metadata and content parts
 * 
 * @param chordSheet - Complete chord sheet to split
 * @returns Object containing metadata and content parts
 */
export function splitChordSheet(chordSheet: StoredChordSheet): {
  metadata: StoredChordSheetMetadata;
  content: StoredChordSheetContent;
} {
  const { songChords, ...metadataFields } = chordSheet;
  
  const metadata: StoredChordSheetMetadata = {
    ...metadataFields,
    storage: {
      ...chordSheet.storage,
      contentAvailable: true, // Mark that content is available
    },
  };

  const content: StoredChordSheetContent = {
    path: chordSheet.path,
    songChords,
  };

  return { metadata, content };
}

/**
 * Combines metadata and content back into a complete StoredChordSheet
 * 
 * @param metadata - Chord sheet metadata
 * @param content - Chord sheet content
 * @returns Complete StoredChordSheet
 */
export function combineChordSheet(
  metadata: StoredChordSheetMetadata,
  content: StoredChordSheetContent
): StoredChordSheet {
  return {
    ...metadata,
    songChords: content.songChords,
    storage: {
      ...metadata.storage,
      // Remove contentAvailable from storage as it's not part of the original schema
      contentAvailable: undefined,
    } as StoredChordSheet["storage"],
  };
}
