import type { StoredSongMetadata } from "@/storage/types";

export interface ChordSheetListProps {
  chordSheets: StoredSongMetadata[];
  onChordSheetSelect: (metadata: StoredSongMetadata) => void;
  onDeleteChordSheet: (chordSheetPath: string) => void;
  onUploadClick: () => void;
  tabState?: { scroll: number };
  setTabState?: (state: { scroll: number }) => void;
}
