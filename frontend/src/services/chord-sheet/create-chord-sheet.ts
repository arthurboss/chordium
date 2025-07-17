import { ChordSheet } from '../../types/chordSheet';
import { GUITAR_TUNINGS } from '../../constants/guitar-tunings';

/**
 * Creates a new chord sheet with default values and validation
 */
export function createChordSheet(data: Partial<ChordSheet>): ChordSheet {
  return {
    title: data.title || '',
    artist: data.artist || 'Unknown Artist',
    songChords: data.songChords || '',
    songKey: data.songKey || '',
    guitarTuning: data.guitarTuning || GUITAR_TUNINGS.STANDARD,
    guitarCapo: data.guitarCapo || 0
  };
}
