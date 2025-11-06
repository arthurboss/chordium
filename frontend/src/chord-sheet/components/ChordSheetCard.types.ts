import type { StoredSongMetadata } from "@/storage/types";

export interface ChordSheetCardProps {
  metadata: StoredSongMetadata;
  onView: (metadata: StoredSongMetadata) => void;
  onDelete: (metadata: StoredSongMetadata) => void;
}
