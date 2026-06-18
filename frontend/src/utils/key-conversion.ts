import { majorKey, minorKey } from '@tonaljs/key';
import tonalNote from '@tonaljs/note';
import type { Note } from '@chordium/types';
import { NOTES } from './chord-transposition';

/**
 * Convert semitone value back to key name
 * @param semitones The semitone value (0-11)
 * @returns The key name (e.g., "C", "F#", "G", "Bb")
 */
export function semitonesToKeyName(semitones: number): string {
  const intervals = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7'];
  const noteIndex = ((semitones % 12) + 12) % 12;

  try {
    const note = tonalNote.transpose('C', intervals[noteIndex]);
    return note || 'C';
  } catch (error) {
    console.warn(`Error generating note for semitone ${semitones}:`, error);
    return 'C';
  }
}

/**
 * Convert a song key (like "C", "F#", "Am") to a numeric semitone value.
 * Uses @tonaljs/key for robust key parsing and semitone calculation.
 * @param songKey The song key string (e.g., "C", "F#", "Am", "Bb", "G major", "D minor")
 * @returns The numeric semitone value (0-11) or 0 if invalid
 */
export function songKeyToSemitones(songKey: string): number {
  if (!songKey || typeof songKey !== 'string') {
    return 0;
  }

  try {
    const trimmedKey = songKey.trim();
    let tonic: string;
    let isMinor = false;

    if (trimmedKey.endsWith('m') && trimmedKey.length > 1) {
      tonic = trimmedKey.slice(0, -1);
      isMinor = true;
    } else if (/\s+(minor|min)$/i.test(trimmedKey)) {
      tonic = trimmedKey.split(/\s+/)[0];
      isMinor = true;
    } else if (/\s+(major|maj)$/i.test(trimmedKey)) {
      tonic = trimmedKey.split(/\s+/)[0];
      isMinor = false;
    } else {
      tonic = trimmedKey;
      isMinor = false;
    }

    const keyInfo = isMinor ? minorKey(tonic) : majorKey(tonic);

    if (!keyInfo.tonic) {
      const fallbackKey = isMinor ? majorKey(tonic) : minorKey(tonic);
      if (!fallbackKey.tonic) return 0;
      tonic = fallbackKey.tonic;
    } else {
      tonic = keyInfo.tonic;
    }

    let tonicNote = tonic;
    if (tonicNote === 'Bb') tonicNote = 'A#';
    else if (tonicNote === 'Eb') tonicNote = 'D#';
    else if (tonicNote === 'Ab') tonicNote = 'G#';
    else if (tonicNote === 'Db') tonicNote = 'C#';
    else if (tonicNote === 'Gb') tonicNote = 'F#';
    else if (tonicNote === 'Cb') tonicNote = 'B';

    const index = NOTES.indexOf(tonicNote as Note);
    return index !== -1 ? index : 0;

  } catch (error) {
    console.warn(`Error parsing song key "${songKey}":`, error);
    return 0;
  }
}
