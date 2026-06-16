
import type { Note } from '@chordium/types';
import { majorKey, minorKey } from '@tonaljs/key';
import tonalNote from '@tonaljs/note';

// Define the musical notes for transposing
export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function transposeNote(note: string, halfSteps: number): string {
  let normalized = note;
  if (note.endsWith('b')) {
    normalized = NOTES[(NOTES.indexOf(note[0] as Note) + 11) % 12];
  }
  const idx = NOTES.indexOf(normalized as Note);
  if (idx === -1) return note;
  return NOTES[(idx + halfSteps + 12) % 12];
}

/**
 * Transpose a chord by a given number of half steps.
 * Both the root note and the bass note of slash chords (e.g. G/B) are transposed.
 */
export function transposeChord(chord: string, halfSteps: number): string {
  if (halfSteps === 0) return chord;

  const match = chord.match(/^([A-G][#b]?)(.*?)(\/[A-G][#b]?)?$/);
  if (!match) return chord;

  const [, root, quality, bassSlash] = match;
  const transposedRoot = transposeNote(root, halfSteps);

  if (bassSlash) {
    return transposedRoot + quality + '/' + transposeNote(bassSlash.slice(1), halfSteps);
  }

  return transposedRoot + quality;
}

/**
 * Convert semitone value back to key name
 * @param semitones The semitone value (0-11)
 * @returns The key name (e.g., "C", "F#", "G", "Bb")
 */
export function semitonesToKeyName(semitones: number): string {
  // Use tonal to generate chromatic notes
  const intervals = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7'];
  const noteIndex = ((semitones % 12) + 12) % 12;
  
  try {
    const note = tonalNote.transpose('C', intervals[noteIndex]);
    return note || 'C'; // Fallback to C if note is empty
  } catch (error) {
    console.warn(`Error generating note for semitone ${semitones}:`, error);
    return 'C';
  }
}

/**
 * Convert a song key (like "C", "F#", "Am") to a numeric semitone value
 * Uses @tonaljs/key for robust key parsing and semitone calculation
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
    
    // Detect if it's a minor key first
    if (trimmedKey.endsWith('m') && trimmedKey.length > 1) {
      // Minor key with 'm' suffix (e.g., "Bm", "Am", "F#m")
      tonic = trimmedKey.slice(0, -1);
      isMinor = true;
    } else if (/\s+(minor|min)$/i.test(trimmedKey)) {
      // Minor key with "minor" or "min" suffix (e.g., "B minor", "A min")
      tonic = trimmedKey.split(/\s+/)[0];
      isMinor = true;
    } else if (/\s+(major|maj)$/i.test(trimmedKey)) {
      // Major key with "major" or "maj" suffix (e.g., "B major", "A maj")
      tonic = trimmedKey.split(/\s+/)[0];
      isMinor = false;
    } else {
      // Default to major key (e.g., "C", "F#", "Bb")
      tonic = trimmedKey;
      isMinor = false;
    }
    
    // Get the key information from tonaljs
    const keyInfo = isMinor ? minorKey(tonic) : majorKey(tonic);
    
    if (!keyInfo.tonic) {
      // If the specified key type failed, try the other type as fallback
      const fallbackKey = isMinor ? majorKey(tonic) : minorKey(tonic);
      if (!fallbackKey.tonic) {
        return 0;
      }
      // Use the fallback key
      tonic = fallbackKey.tonic;
    } else {
      tonic = keyInfo.tonic;
    }
    
    // Convert tonic note to semitone value using our NOTES array
    let tonicNote = tonic;
    
    // Convert flat notes to sharp equivalents to match our NOTES array
    if (tonicNote === 'Bb') tonicNote = 'A#';
    else if (tonicNote === 'Eb') tonicNote = 'D#';
    else if (tonicNote === 'Ab') tonicNote = 'G#';
    else if (tonicNote === 'Db') tonicNote = 'C#';
    else if (tonicNote === 'Gb') tonicNote = 'F#';
    else if (tonicNote === 'Cb') tonicNote = 'B';
    
    const index = NOTES.indexOf(tonicNote as Note);
    
    return (index !== -1 ? index : 0);
    
  } catch (error) {
    // Fallback to 0 if any error occurs
    console.warn(`Error parsing song key "${songKey}":`, error);
    return 0;
  }
}

/**
 * Parse a chord file and extract content
 * This is a simple implementation for demo purposes
 */
export function parseChordFile(content: string): string {
  // For now, we just return the content as is
  // In a real application, we would parse different chord file formats
  return content;
}

/**
 * Detect if a line contains chord patterns
 */
export function isChordLine(line: string): boolean {
  // Simple heuristic: if more than 40% of the characters are chord-like patterns,
  // it's likely a chord line
  const chordPatterns = line.match(/\b[A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?\b/g);
  if (!chordPatterns) return false;
  
  // Calculate the ratio of chord characters to total line length
  const chordChars = chordPatterns.join('').length;
  const totalChars = line.trim().length;
  
  return chordChars / totalChars > 0.4;
}
