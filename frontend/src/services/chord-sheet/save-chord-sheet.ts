import { ChordSheet } from '../../types/chordSheet';
import { unifiedChordSheetCache } from '../../cache/implementations/unified-chord-sheet-cache';

/**
 * Saves a chord sheet to cache by artist and title
 */
export function saveChordSheet(artist: string, title: string, chordSheet: ChordSheet): void {
  unifiedChordSheetCache.cacheChordSheet(artist, title, chordSheet);
}
