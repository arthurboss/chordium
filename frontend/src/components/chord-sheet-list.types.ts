import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";

export type SortOption = "recent" | "az" | "za" | "most-played";

export interface ChordSheetListProps {
  chordSheets: ChordSheetListItem[];
  onChordSheetSelect: (metadata: ChordSheetListItem) => void;
  onDeleteChordSheet: (chordSheetPath: string) => void;
  onUploadClick: () => void;
  tabState?: { scroll: number };
  setTabState?: (state: { scroll: number }) => void;
}
