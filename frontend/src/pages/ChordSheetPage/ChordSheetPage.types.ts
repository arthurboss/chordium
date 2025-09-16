import type { RefObject } from "react";
import type { Song } from "@/types/song";
import type { ChordSheet, SongMetadata } from "@chordium/types";
import type { RouteParams, ChordSheetData } from "../chord-viewer/chord-viewer.types";
import type { ChordSheetWithFallbackState, ChordSheetWithFallbackActions } from "@/hooks/useChordSheetWithFallback";

/**
 * Props for the ChordSheetPage component
 */
export interface ChordSheetPageProps {
  isPrerenderMode?: boolean;
}


/**
 * Props for the main content structure
 */
export interface ContentStructureProps {
  song: { song: Song; chordSheet: ChordSheet & SongMetadata };
  chordContent: string;
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
  onDelete: (songPath: string) => void;
  onSave: () => void;
  onUpdate: (content: string) => void;
  hideDeleteButton: boolean;
  hideSaveButton: boolean;
  isFromMyChordSheets: boolean;
  useProgressiveLoading: boolean;
  loadContent?: () => Promise<void>;
  isContentLoading: boolean;
}

/**
 * Return type for useChordSheetData hook
 */
export interface UseChordSheetDataReturn {
  path: string;
  routeParams: RouteParams;
  chordSheetResult: ChordSheetWithFallbackState & ChordSheetWithFallbackActions;
  chordSheetData: ChordSheetData | null;
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
}

/**
 * Return type for useChordSheetActions hook
 */
export interface UseChordSheetActionsReturn {
  handleBack: () => void;
  handleSave: () => Promise<void>;
  handleDelete: (songPath: string) => void;
}
