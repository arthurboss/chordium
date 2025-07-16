import { ChordSheet } from '../../types/chordSheet';

/**
 * Checks if a chord sheet has meaningful content
 */
export function hasChordSheetContent(chordSheet: ChordSheet | null): boolean {
  return !!(chordSheet?.songChords && chordSheet.songChords.trim().length > 0);
}
