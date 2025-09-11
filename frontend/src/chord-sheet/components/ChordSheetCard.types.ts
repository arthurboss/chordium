import type { StoredSongMetadata } from "@/storage/types";

/**
 * Props for the ChordSheetCard component.
 */
export interface ChordSheetCardProps {
  metadata: StoredSongMetadata;
  onView: (metadata: StoredSongMetadata) => void;
  onDelete: (metadata: StoredSongMetadata) => void;
}
