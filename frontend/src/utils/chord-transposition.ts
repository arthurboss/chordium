import type { Note } from '@chordium/types';

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
