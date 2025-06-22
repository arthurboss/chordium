import { ChordSheet } from '../../types/chordSheet';
import { getCachedChordSheet } from '../../cache/implementations/chord-sheet-cache';

/**
 * Retrieves a chord sheet from cache by artist and title
 */
export function getChordSheet(artist: string, title: string): ChordSheet | null {
  return getCachedChordSheet(artist, title);
}
