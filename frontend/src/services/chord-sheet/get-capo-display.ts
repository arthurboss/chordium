import { ChordSheet } from '../../types/chordSheet';

/**
 * Gets capo display string
 */
export function getCapoDisplay(chordSheet: ChordSheet | null): string {
  if (!chordSheet || chordSheet.guitarCapo === 0) {
    return 'No capo';
  }
  return `Capo ${chordSheet.guitarCapo}`;
}
