import { ChordSheet } from '../../types/chordSheet';
import { getTuningDisplay } from './get-tuning-display';
import { getCapoDisplay } from './get-capo-display';
import { hasChordSheetContent } from './has-chord-sheet-content';

/**
 * Gets song metadata for display
 */
export function getMetadata(chordSheet: ChordSheet | null) {
  if (!chordSheet) {
    return {
      title: '',
      artist: 'Unknown Artist',
      key: '',
      tuning: '',
      capo: 'No capo',
      hasContent: false
    };
  }

  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    key: chordSheet.songKey || 'Unknown',
    tuning: getTuningDisplay(chordSheet),
    capo: getCapoDisplay(chordSheet),
    hasContent: hasChordSheetContent(chordSheet)
  };
}
