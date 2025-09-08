import type { ChordSheet } from '@/types/chordSheet';

/**
 * Props for the ChordMetadata component
 * Displays musical metadata like artist and tuning information
 */
export interface ChordMetadataProps {
  /** Chord sheet object containing all metadata */
  chordSheet: ChordSheet;
}
