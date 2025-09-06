import { transposeChord } from './chordUtils';

// Type definitions for chord sheet processing
export interface ChordLine {
  type: 'chord' | 'lyrics' | 'tab' | 'empty';
  content: string;
}

export interface ChordSection {
  type: 'section';
  title: string;
  lines: ChordLine[];
}

// Enhanced chord regex pattern for better recognition
export const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

/**
 * Process chord sheet content into structured sections and lines
 * @param rawContent - Raw text of the chord sheet
 * @param transpose - Number of half steps to transpose, defaults to 0
 * @returns Array of processed chord sections
 */
export function processContent(rawContent: string, transpose: number = 0): ChordSection[] {
  if (!rawContent) return [{ type: 'section', title: '', lines: [] }];
  
  const lines = rawContent.split('\n');
  const sections: ChordSection[] = [];
  let currentSection: ChordSection = { type: 'section', title: '', lines: [] };
  
  for (let line of lines) {
    // Detect section headers (e.g., [Chorus], [Verse], etc.)
    if (line.match(/^\[.*\]$/)) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { 
        type: 'section', 
        title: line.replace(/[[\]]/g, ''), 
        lines: [] 
      };
    } else {
      // Process chord lines and guitar tabs
      if (line.trim() === '') {
        // Add empty line
        currentSection.lines.push({ type: 'empty', content: ' ' });
      } else {
        // Detect if this is a guitar tab line (contains |----|, e|---, etc.)
        const isTabLine = line.includes('|--') || 
                         line.includes('-|') || 
                         line.match(/^[eADGBE]\|/) || 
                         line.match(/^\|/) ||
                         line.match(/^\s*\d+\s*$/) || // Numbers only (fret markers)
                         line.match(/^[eADGBE]:/) || 
                         line.trim().length > 0 && line.trim().split('').every(c => 
                           ['-', '|', '/', '\\', '.', 'h', 'p', 'b', 'r', 's', 't', '(', ')', 
                            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '\t'].includes(c));

        // Chord line detection - has chord patterns
        const hasChordPattern = line.match(CHORD_REGEX);
        const nonSpaceRatio = line.replace(/\s/g, '').length / line.length;
        
        if (isTabLine) {
          currentSection.lines.push({ type: 'tab', content: line });
        } else if ((nonSpaceRatio < 0.5 && hasChordPattern) || 
                  (line.length < 30 && hasChordPattern && line.split(CHORD_REGEX).filter(Boolean).every(s => s.trim() === ''))) {
          // Replace chords with transposed versions if needed
          if (transpose !== 0) {
            // Find chord patterns and transpose them
            line = line.replace(CHORD_REGEX, match => transposeChord(match, transpose));
          }
          
          currentSection.lines.push({ type: 'chord', content: line });
        } else {
          currentSection.lines.push({ type: 'lyrics', content: line });
        }
      }
    }
  }
  
  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
}

/**
 * Generate options for the transpose selector
 * @returns Array of transpose options from -11 to +11 semitones (all 12 unique keys)
 */
export function getTransposeOptions(): number[] {
  return [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
}