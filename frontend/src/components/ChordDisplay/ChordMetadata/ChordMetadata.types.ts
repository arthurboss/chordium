import type { ChordSheet } from '@/types/chordSheet';

/**
 * Props for the ChordMetadata component
 * Displays musical metadata like artist and tuning information
 */
export interface ChordMetadataProps {
  /** Chord sheet object containing all metadata */
  chordSheet: ChordSheet;
  /** Path of the song (e.g. "ac-dc/back-in-black"), used to derive the artist slug */
  path: string;
}
