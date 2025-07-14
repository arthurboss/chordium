import { ChordSheet } from '../../types/chordSheet';

/**
 * Gets display-friendly guitar tuning string
 */
export function getTuningDisplay(chordSheet: ChordSheet | null): string {
  if (!chordSheet) return '';
  return chordSheet.guitarTuning.join(' ');
}
