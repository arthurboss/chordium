import type { ChordSheetListItem } from "@/storage/stores/chord-sheets/operations/get-all-saved";

export interface ChordSheetCardProps {
  chordSheet: ChordSheetListItem;
  onView: (chordSheet: ChordSheetListItem) => void;
  onDelete: (chordSheet: ChordSheetListItem) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}
