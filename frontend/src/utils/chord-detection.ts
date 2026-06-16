/**
 * Detect if a line consists entirely of chord names.
 */
export function isChordLine(line: string): boolean {
  const chordPatterns = line.match(/\b[A-G][#b]?(?:m|maj|min|aug|dim|sus|add)?[0-9]?(?:\/[A-G][#b]?)?\b/g);
  if (!chordPatterns) return false;

  const chordChars = chordPatterns.join('').length;
  const totalChars = line.trim().length;

  return chordChars / totalChars > 0.4;
}

/**
 * Parse a chord file and extract content.
 */
export function parseChordFile(content: string): string {
  return content;
}
