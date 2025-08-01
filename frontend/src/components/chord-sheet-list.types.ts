import type { StoredChordSheet } from "@/storage/types";

export interface ChordSheetListProps {
  chordSheets: StoredChordSheet[];
  onChordSheetSelect: (storedChordSheet: StoredChordSheet) => void;
  onDeleteChordSheet: (chordSheetPath: string) => void;
  onUploadClick: () => void;
  tabState?: { scroll: number };
  setTabState?: (state: { scroll: number }) => void;
}
