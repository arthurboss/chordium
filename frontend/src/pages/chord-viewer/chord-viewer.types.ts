import type { ChordSheet } from "@/types/chordSheet";

/**
 * Complete chord sheet data structure for display
 */
export interface ChordSheetData {
  chordSheet: ChordSheet;
  path: string;
}

/**
 * Parameters extracted from URL route
 */
export interface RouteParams extends Record<string, string | undefined> {
  artist?: string;
  song?: string;
}

/**
 * Navigation methods for different chord sheet sources
 */
export interface ChordViewerNavigationMethods {
  navigateToMyChordSheets: () => void;
  navigateToHome: () => void;
}

/**
 * Chord sheet operation handlers
 */
export interface ChordSheetOperations {
  handleSaveChordSheet: () => Promise<void>;
  handleDeleteSong: () => Promise<void>;
}

/**
 * Parameters for chord sheet operations hook
 */
export interface UseChordSheetOperationsParams {
  chordSheetData: ChordSheetData | null;
  path: string;
  songTitle: string;
}
