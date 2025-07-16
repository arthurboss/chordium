
// Define the musical notes for transposing
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Transpose a chord by a given number of half steps
 */
export function transposeChord(chord: string, halfSteps: number): string {
  // If no transposition needed, return the original chord
  if (halfSteps === 0) return chord;
  
  // Regular expression to match the chord root and any additional info
  const regex = /^([A-G][#b]?)(.*)$/;
  const match = chord.match(regex);
  
  if (!match) return chord; // Not a valid chord
  
  const [, rootNote, rest] = match;
  
  // Normalize sharp/flat notes (convert b to #)
  let normalizedRoot = rootNote;
  if (rootNote.endsWith('b')) {
    const flatIndex = NOTES.indexOf(
      NOTES[(NOTES.indexOf(rootNote[0]) + 11) % 12]
    );
    normalizedRoot = NOTES[flatIndex];
  }
  
  // Find the index of the root note in the notes array
  const rootIndex = NOTES.indexOf(normalizedRoot);
  if (rootIndex === -1) return chord; // Not a valid note
  
  // Calculate the new root note after transposition
  const newRootIndex = (rootIndex + halfSteps + 12) % 12;
  const newRoot = NOTES[newRootIndex];
  
  // Return the new chord with the original suffix
  return newRoot + rest;
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
