// Utility functions for formatting chord sheets

export interface ChordSheetMetadata {
  songTitle: string;
  artistName: string;
  isCifraClub: boolean;
}

export const formatPdfChordSheet = (
  text: string, 
  { songTitle, artistName, isCifraClub }: ChordSheetMetadata
): string => {
  console.log('Formatting chord sheet with metadata:');
  console.log('Title:', songTitle);
  console.log('Artist:', artistName);
  console.log('Is Cifra Club:', isCifraClub);
  
  // Split by lines and remove excessive whitespace
  const lines = text.split('\n').map(line => line.trim());
  
  // Remove empty lines
  const nonEmptyLines = lines.filter(line => line.length > 0);
  
  // Process the lines to better format chord sheets
  const formattedLines: string[] = [];
  
  // Add song metadata if available
  if (songTitle && artistName) {
    formattedLines.push(`[title]${songTitle}[/title]`);
    formattedLines.push(`[artist]${artistName}[/artist]`);
    formattedLines.push(''); // Add empty line after metadata
  }
  
  let currentSection = '';
  
  // Process lines with improved detection
  for (let i = 0; i < nonEmptyLines.length; i++) {
    const line = nonEmptyLines[i];
    
    // Skip page numbers
    if (/^\d+$/.test(line)) {
      continue;
    }
    
    // Check for section headers
    if (isSectionHeader(line)) {
      const sectionName = line.trim().replace(/:/g, '');
      currentSection = `[${sectionName}]`;
      formattedLines.push(currentSection);
      continue;
    }
    
    // For Cifra Club PDFs, handle special cases
    if (isCifraClub) {
      // Skip metadata lines that we've already extracted
      if (i < 5 && (line === songTitle || line === artistName)) {
        continue;
      }
    }
    
    // Check for different line types
    if (isTabLine(line)) {
      formattedLines.push(line);
    } else if (isChordLine(line)) {
      formattedLines.push(line);
    } else if (isLyricsLine(line)) {
      formattedLines.push(line);
    } else {
      // If we can't determine the line type, include it anyway
      formattedLines.push(line);
    }
  }
  
  return formattedLines.join('\n');
};

// Enhanced chord regex that includes common chord variations
const CHORD_REGEX = /\b([A-G][#b]?(?:m|maj|min|aug|dim|sus|add|maj7|m7|7|9|11|13|6|m6|m9|m11|m13|7sus4|7sus2|7b5|7b9|7#9|7#11|7#5|aug7|dim7)?(?:\/[A-G][#b]?)?)\b/g;

// Section header regex
const SECTION_HEADER_REGEX = /(?:verse|chorus|bridge|intro|outro|solo|pre-chorus|interlude)/i;

// Check for section headers
export const isSectionHeader = (line: string): boolean => {
  return SECTION_HEADER_REGEX.test(line);
};

// Tab line detection
export const isTabLine = (line: string): boolean => {
  // Check for common tab patterns
  const tabPatterns = [
    /^[-=]{3,}$/, // Lines of hyphens or equals
    /^[0-9hpsl/\\~]{3,}$/, // Numbers and tab symbols
    /^[x0-9]{6,}$/, // Multiple numbers or x's (muted strings)
    /^[A-G][#b]?\s*\|/ // Chord followed by bar
  ];
  return tabPatterns.some(pattern => pattern.test(line));
};

// Chord line detection
export const isChordLine = (line: string): boolean => {
  // Skip if it's a tab line
  if (isTabLine(line)) return false;
  
  // Count chord matches
  const chordMatches = line.match(CHORD_REGEX) || [];
  
  // Calculate chord density (chords per character)
  const chordDensity = chordMatches.length / line.length;
  
  // Check for common chord line characteristics
  const hasEnoughChords = chordMatches.length >= 2;
  const hasHighChordDensity = chordDensity > 0.1; // At least 10% of the line is chords
  const hasSpacedChords = line.match(/\s{2,}/) !== null; // Multiple spaces between chords
  
  return hasEnoughChords || (hasHighChordDensity && hasSpacedChords);
};

// Lyrics line detection
export const isLyricsLine = (line: string): boolean => {
  // Skip if it's a tab line or chord line
  if (isTabLine(line) || isChordLine(line)) return false;
  
  // Check for common lyrics characteristics
  const hasWords = line.match(/\b\w{2,}\b/g)?.length || 0;
  const wordDensity = hasWords / line.length;
  
  return hasWords >= 2 && wordDensity > 0.2; // At least 2 words and 20% word density
};
