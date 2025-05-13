import { ChordSectionType, ChordLineType } from '@/components/ChordDisplay/types';

/**
 * Regular expression for detecting musical chord patterns
 * Matches standard chord notation including:
 * - Basic chords (C, G, D, etc.)
 * - Modified chords with accidentals (C#, Bb)
 * - Extended chords (maj7, m7, 7, etc.)
 * - Slash chords (G/B, D/F#)
 */
export const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

/**
 * Special characters typically used in guitar tablature notation
 */
const TAB_SPECIAL_CHARS = ['-', '|', '/', '\\', '.', 'h', 'p', 'b', 'r', 's', 't', '(', ')', 
                          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '\t'];

/**
 * Detects if a line is a guitar tablature line
 * @param line - The line of text to analyze
 * @returns boolean - True if the line appears to be guitar tablature
 */
const isGuitarTabLine = (line: string): boolean => {
  return line.includes('|--') || 
         line.includes('-|') || 
         line.match(/^[eADGBE]\|/) !== null || 
         line.match(/^\|/) !== null ||
         line.match(/^\s*\d+\s*$/) !== null || // Numbers only (fret markers)
         line.match(/^[eADGBE]:/) !== null || 
         (line.trim().length > 0 && 
          line.trim().split('').every(c => TAB_SPECIAL_CHARS.includes(c)));
};

/**
 * Analyzes a line to determine if it's likely a chord line
 * @param line - The line to analyze
 * @returns boolean - True if the line appears to be a chord line
 */
const isChordLine = (line: string): boolean => {
  const hasChordPattern = line.match(CHORD_REGEX) !== null;
  if (!hasChordPattern) return false;
  
  // If the ratio of non-space characters is low, it's likely a chord line
  const nonSpaceRatio = line.replace(/\s/g, '').length / line.length;
  
  // Short line with only chords and spaces
  const isShortChordOnlyLine = 
    line.length < 30 && 
    line.split(CHORD_REGEX).filter(Boolean).every(s => s.trim() === '');
    
  return (nonSpaceRatio < 0.5 && hasChordPattern) || isShortChordOnlyLine;
};

/**
 * Process raw chord content into structured format for preview
 * @param rawContent - Raw text content with chords, lyrics, and tablature
 * @returns ChordSectionType[] - Processed content split into sections and lines
 */
export const processContent = (rawContent: string): ChordSectionType[] => {
  if (!rawContent) return [{ type: 'section', title: '', lines: [] }];
  
  const lines = rawContent.split('\n');
  const sections: ChordSectionType[] = [];
  let currentSection: ChordSectionType = { type: 'section', title: '', lines: [] };
  
  for (const line of lines) {
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
      // Process empty lines
      if (line.trim() === '') {
        currentSection.lines.push({ type: 'empty', content: ' ' });
        continue;
      }
      
      // Identify line type
      if (isGuitarTabLine(line)) {
        currentSection.lines.push({ type: 'tab', content: line });
      } else if (isChordLine(line)) {
        currentSection.lines.push({ type: 'chord', content: line });
      } else {
        currentSection.lines.push({ type: 'lyrics', content: line });
      }
    }
  }
  
  // Don't forget to add the final section
  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
};
