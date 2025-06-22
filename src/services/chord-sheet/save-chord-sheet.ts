import { ChordSheet } from '../../types/chordSheet';
import { cacheChordSheet } from '../../cache/implementations/chord-sheet-cache';

/**
 * Saves a chord sheet to cache by artist and title
 */
export function saveChordSheet(artist: string, title: string, chordSheet: ChordSheet): void {
  cacheChordSheet(artist, title, chordSheet);
}
