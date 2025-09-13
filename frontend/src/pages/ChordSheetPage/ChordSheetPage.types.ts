import type { RefObject } from "react";
import type { Song } from "@/types/song";
import type { ChordSheet, SongMetadata } from "@chordium/types";

/**
 * Props for the ChordSheetPage component
 */
export interface ChordSheetPageProps {
  isPrerenderMode?: boolean;
}

/**
 * Props for the pre-rendered structure
 */
export interface PreRenderedStructureProps {
  title: string;
  artist: string;
  chordDisplayRef: RefObject<HTMLDivElement>;
  onBack: () => void;
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
  routeParams: any;
  chordSheetResult: any;
  chordSheetData: any;
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
}

/**
 * Return type for useChordSheetActions hook
 */
export interface UseChordSheetActionsReturn {
  handleBack: () => void;
  handlePreRenderBack: () => void;
  handleSave: () => Promise<void>;
  handleDelete: (songPath: string) => void;
}
