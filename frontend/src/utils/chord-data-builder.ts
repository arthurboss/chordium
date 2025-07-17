import { ChordSheetWithUIState, toChordSheetWithUIState } from '@/types/chordSheetWithUIState';
import { ChordSheet } from '@chordium/types';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';
import { LocalSongResult } from './local-chord-sheet-finder';

/**
 * Builds ChordSheetWithUIState from a local song result
 * Follows SRP: Single responsibility of data transformation
 * 
 * @param localSong - The local song result to transform
 * @returns ChordSheetWithUIState - Formatted data for the chord sheet component
 */
export function buildChordSheetData(localSong: LocalSongResult): ChordSheetWithUIState {
  const chordSheet: ChordSheet = {
    title: localSong.title,
    artist: localSong.artist,
    songChords: localSong.path, // For local songs, path contains the chord content
    songKey: localSong.key || '',
    guitarTuning: GUITAR_TUNINGS.STANDARD, // Default to standard tuning
    guitarCapo: parseInt(localSong.capo || '0', 10) || 0
  };

  return toChordSheetWithUIState(chordSheet);
}
