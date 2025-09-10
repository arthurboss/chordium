import type { SongMetadata } from "./song-metadata.js";
import type { ChordSheetContent } from "./chord-sheet-content.js";

export interface ChordSheet extends SongMetadata, ChordSheetContent {}

// Re-export for convenience
export type { ChordSheetContent };