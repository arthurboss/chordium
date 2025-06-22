import { ChordSheet } from '../../types/chordSheet';

/**
 * Extracts chord sheet content for display components
 */
export function getChordContent(chordSheet: ChordSheet | null): string {
  return chordSheet?.songChords ?? '';
}
