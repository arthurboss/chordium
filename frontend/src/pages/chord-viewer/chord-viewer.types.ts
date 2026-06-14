import type { ChordSheet, SongMetadata } from "@chordium/types";

export interface ChordSheetData {
  chordSheet: ChordSheet & SongMetadata;
  path: string;
}

export interface RouteParams extends Record<string, string | undefined> {
  artist?: string;
  song?: string;
}

export interface ChordViewerNavigationMethods {
  navigateToMyChordSheets: () => void;
  navigateToHome: () => void;
  navigateToSearch: () => void;
  navigateBack: () => void;
}

export interface NavigationData {
  path: string;
  title: string;
  artist: string;
}
