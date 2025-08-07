import type { StoredChordSheet } from "@/storage/types";

/**
 * Props for the ChordSheetCard component.
 */
export interface ChordSheetCardProps {
  chordSheet: StoredChordSheet;
  onView: (chordSheet: StoredChordSheet) => void;
  onDelete: (chordSheet: StoredChordSheet) => void;
}
