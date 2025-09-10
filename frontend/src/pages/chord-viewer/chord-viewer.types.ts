import type { ChordSheet, SongMetadata } from "@chordium/types";

/**
 * Complete chord sheet data structure for display
 */
export interface ChordSheetData {
  chordSheet: ChordSheet & SongMetadata;
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
  navigateToSearch: () => void;
  navigateBack: () => void;
}

/**
 * Navigation data extracted from router location state
 */
export interface NavigationData {
  path: string;
  title: string;
  artist: string;
}
