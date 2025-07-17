import { ChordSheet } from '../../types/chordSheet';
import { unifiedChordSheetCache } from '../../cache/implementations/unified-chord-sheet-cache';

/**
 * Retrieves a chord sheet from cache by artist and title
 */
export function getChordSheet(artist: string, title: string): ChordSheet | null {
  return unifiedChordSheetCache.getCachedChordSheet(artist, title);
}
