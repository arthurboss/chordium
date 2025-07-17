import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';

/**
 * Convert response from backend to ChordSheet format
 * Backend now returns the new ChordSheet format directly
 * 
 * @param response - Backend response object
 * @returns ChordSheet object with proper defaults
 */
export function convertResponseToChordSheet(response: Record<string, unknown>): ChordSheet {
  return {
    title: response.title as string ?? '',
    artist: response.artist as string ?? 'Unknown Artist',
    songChords: response.songChords as string ?? '',
    songKey: response.songKey as string ?? '',
    guitarTuning: GUITAR_TUNINGS.STANDARD, // Backend always returns standard tuning for now
    guitarCapo: response.guitarCapo as number ?? 0
  };
}
